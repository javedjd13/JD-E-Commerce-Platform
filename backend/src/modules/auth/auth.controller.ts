const authService = require("./auth.service");
const AppError = require("../../utils/AppError");
const env = require("../../config/env");
import prisma from "../../lib/prisma";
import { created, noContent, ok } from "../../utils/http";
import { readPositiveInt } from "../../utils/ids";

import type { Request, Response } from "express";

function getProfileImageUrl(name: string, email: string) {
  const label = encodeURIComponent(name || email.split("@")[0] || "User");
  return `https://ui-avatars.com/api/?name=${label}&background=0f172a&color=ffffff&size=160`;
}

function toPublicUser(user: any) {
  const nameParts = String(user.name || "")
    .split(/\s+/)
    .filter(Boolean);
  const firstName = user.first_name || user.firstName || nameParts[0] || "";
  const lastName =
    user.last_name || user.lastName || nameParts.slice(1).join(" ");
  const name =
    [firstName, lastName].filter(Boolean).join(" ") || user.name || "";
  const addresses = (user.addresses || []).map((address: any) => ({
    id: address.publicId,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  }));
  const phone =
    user.phone ||
    addresses.find((address: any) => address.isDefault)?.phone ||
    addresses[0]?.phone ||
    null;
  const profileImageUrl =
    user.profileImageUrl || getProfileImageUrl(name, user.email);

  return {
    id: user.publicId,
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: user.email,
    phone,
    role: (user.role || "").toLowerCase(),
    profileImageUrl,
    panNumber: user.panNumber,
    contactInformation: {
      fullName: name,
      email: user.email,
      phone,
    },
    addresses,
    createdAt: user.createdAt || user.created_at,
    updatedAt: user.updatedAt || user.updated_at,
  };
}

function readPublicId(value: unknown, label: string) {
  return readPositiveInt(value, label);
}

function normalizeAddressInput(body: any) {
  return {
    label: body.label || "Home",
    fullName: body.fullName || body.name,
    phone: body.phone,
    line1: body.line1,
    line2: body.line2 || null,
    city: body.city,
    state: body.state,
    postalCode: body.postalCode,
    country: body.country || "India",
    isDefault: Boolean(body.isDefault),
  };
}

function validateAddressInput(input: ReturnType<typeof normalizeAddressInput>) {
  const required = [
    "fullName",
    "phone",
    "line1",
    "city",
    "state",
    "postalCode",
  ] as const;
  const missing = required.filter((key) => !String(input[key] || "").trim());
  if (missing.length) {
    throw new AppError(
      `Missing address fields: ${missing.join(", ")}`,
      400,
      "VALIDATION_ERROR",
    );
  }
}

async function getUserWithAddresses(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
    },
  });
}

async function unsetDefaultAddressIfNeeded(userId: string, isDefault: boolean) {
  if (!isDefault) return;
  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });
}

function setAuthCookie(res: Response, token: string) {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export async function register(req: Request, res: Response) {
  const { token, user } = await authService.signup(req.body);
  setAuthCookie(res, token);
  return created(res, { user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400,
      "VALIDATION_ERROR",
    );
  }

  const { token, user } = await authService.login({ email, password });
  setAuthCookie(res, token);
  return ok(res, { user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("accessToken", { path: "/" });
  return noContent(res);
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return ok(res, { user: null });
  }

  const user = await getUserWithAddresses(req.user!.sub);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return ok(res, { user: toPublicUser(user) });
}

export async function updateProfile(req: Request, res: Response) {
  const nameParts = (req.body.name || "").trim().split(/\s+/);
  const firstName = req.body.firstName || nameParts[0] || "";
  const lastName = req.body.lastName || nameParts.slice(1).join(" ") || "";
  const name = [firstName, lastName].filter(Boolean).join(" ");

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: {
      ...(req.body.email ? { email: req.body.email } : {}),
      ...(name ? { name } : {}),
      ...(req.body.phone !== undefined
        ? { phone: req.body.phone || null }
        : {}),
      ...(req.body.profileImageUrl !== undefined
        ? { profileImageUrl: req.body.profileImageUrl || null }
        : {}),
      ...(req.body.panNumber !== undefined
        ? { panNumber: req.body.panNumber || null }
        : {}),
    },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
    },
  });

  return ok(res, { user: toPublicUser(user) });
}

export async function createAddress(req: Request, res: Response) {
  const input = normalizeAddressInput(req.body);
  validateAddressInput(input);

  const addressCount = await prisma.address.count({
    where: { userId: req.user!.sub },
  });
  const shouldBeDefault = input.isDefault || addressCount === 0;
  await unsetDefaultAddressIfNeeded(req.user!.sub, shouldBeDefault);

  await prisma.address.create({
    data: {
      ...input,
      isDefault: shouldBeDefault,
      userId: req.user!.sub,
    },
  });

  const user = await getUserWithAddresses(req.user!.sub);
  return created(res, { user: toPublicUser(user) });
}

export async function updateAddress(req: Request, res: Response) {
  const input = normalizeAddressInput(req.body);
  validateAddressInput(input);

  const existing = await prisma.address.findFirst({
    where: {
      publicId: readPublicId(req.params.addressId, "Address"),
      userId: req.user!.sub,
    },
  });
  if (!existing)
    throw new AppError("Address not found", 404, "ADDRESS_NOT_FOUND");

  await unsetDefaultAddressIfNeeded(req.user!.sub, input.isDefault);
  await prisma.address.update({
    where: { id: existing.id },
    data: input,
  });

  const user = await getUserWithAddresses(req.user!.sub);
  return ok(res, { user: toPublicUser(user) });
}

export async function deleteAddress(req: Request, res: Response) {
  const existing = await prisma.address.findFirst({
    where: {
      publicId: readPublicId(req.params.addressId, "Address"),
      userId: req.user!.sub,
    },
  });
  if (!existing)
    throw new AppError("Address not found", 404, "ADDRESS_NOT_FOUND");

  await prisma.address.delete({ where: { id: existing.id } });

  if (existing.isDefault) {
    const nextAddress = await prisma.address.findFirst({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    if (nextAddress) {
      await prisma.address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  const user = await getUserWithAddresses(req.user!.sub);
  return ok(res, { user: toPublicUser(user) });
}
