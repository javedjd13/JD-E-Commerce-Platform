import type { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { created, ok } from "../../utils/http";
import { readPositiveInt } from "../../utils/ids";
import { productPrice } from "../../utils/money";
import { serializeProduct } from "../product/product.serializer";

const AppError = require("../../utils/AppError");

async function findInternalProductId(productId: unknown) {
  const product = await prisma.product.findUnique({
    where: {
      publicId: readPositiveInt(productId, "Product", "INVALID_PRODUCT_ID"),
    },
    select: { id: true },
  });

  if (!product)
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  return product.id;
}

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

function serializeCart(cart: any) {
  const items = cart.items.map((item: any) => {
    const unitPrice = productPrice(item.product.price, item.product.discount);
    return {
      id: item.publicId,
      productId: item.product.publicId,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      product: serializeProduct(item.product),
    };
  });

  return {
    id: cart.publicId,
    items,
    subtotal: items.reduce((sum: number, item: any) => sum + item.lineTotal, 0),
  };
}

function readQuantity(value: unknown, { allowZero = false } = {}) {
  const quantity = Number(value);
  const minimum = allowZero ? 0 : 1;

  if (!Number.isInteger(quantity) || quantity < minimum) {
    throw new AppError(
      `Quantity must be an integer greater than or equal to ${minimum}`,
      400,
      "VALIDATION_ERROR",
    );
  }

  return quantity;
}

export async function getCart(req: Request, res: Response) {
  return ok(res, { cart: serializeCart(await getOrCreateCart(req.user!.sub)) });
}

export async function addToCart(req: Request, res: Response) {
  const { productId, quantity = 1 } = req.body;
  if (!productId)
    throw new AppError("Product is required", 400, "VALIDATION_ERROR");
  const requestedQuantity = readQuantity(quantity);
  const internalProductId = await findInternalProductId(productId);

  const cart = await getOrCreateCart(req.user!.sub);
  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId: internalProductId },
    },
    update: { quantity: { increment: requestedQuantity } },
    create: {
      cartId: cart.id,
      productId: internalProductId,
      quantity: requestedQuantity,
    },
  });

  return created(res, {
    cart: serializeCart(await getOrCreateCart(req.user!.sub)),
  });
}

export async function updateCart(req: Request, res: Response) {
  const { productId, quantity } = req.body;
  if (!productId || quantity === undefined) {
    throw new AppError(
      "Product and quantity are required",
      400,
      "VALIDATION_ERROR",
    );
  }
  const requestedQuantity = readQuantity(quantity, { allowZero: true });
  const internalProductId = await findInternalProductId(productId);

  const cart = await getOrCreateCart(req.user!.sub);
  if (requestedQuantity === 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: internalProductId },
    });
  } else {
    const result = await prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId: internalProductId },
      data: { quantity: requestedQuantity },
    });
    if (!result.count)
      throw new AppError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
  }

  return ok(res, { cart: serializeCart(await getOrCreateCart(req.user!.sub)) });
}

export async function removeFromCart(req: Request, res: Response) {
  const { productId } = req.params;
  if (!productId)
    throw new AppError("Product is required", 400, "VALIDATION_ERROR");
  const internalProductId = await findInternalProductId(productId);

  const cart = await getOrCreateCart(req.user!.sub);
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: internalProductId },
  });

  return ok(res, { cart: serializeCart(await getOrCreateCart(req.user!.sub)) });
}
