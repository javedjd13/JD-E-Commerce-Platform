const authService = require('./auth.service');
const AppError = require('../../utils/AppError');
const env = require('../../config/env');
import prisma from '../../lib/prisma';

import type { Request, Response } from 'express';

function toPublicUser(user: any) {
  const nameParts = String(user.name || '').split(/\s+/).filter(Boolean);
  const firstName = user.first_name || user.firstName || nameParts[0] || '';
  const lastName = user.last_name || user.lastName || nameParts.slice(1).join(' ');
  const name = [firstName, lastName].filter(Boolean).join(' ') || user.name || '';
  return {
    id: user.id,
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: user.email,
    role: (user.role || '').toLowerCase()
  };
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

export async function register(req: Request, res: Response) {
  const { token, user } = await authService.signup(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  }

  const { token, user } = await authService.login({ email, password });
  setAuthCookie(res, token);
  res.json({ user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('accessToken', { path: '/' });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  res.json({ user: toPublicUser(user) });
}

export async function updateProfile(req: Request, res: Response) {
  const nameParts = (req.body.name || '').trim().split(/\s+/);
  const firstName = req.body.firstName || nameParts[0] || '';
  const lastName = req.body.lastName || nameParts.slice(1).join(' ') || '';
  const name = [firstName, lastName].filter(Boolean).join(' ');

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: {
      ...(req.body.email ? { email: req.body.email } : {}),
      ...(name ? { name } : {})
    }
  });

  res.json({ user: toPublicUser(user) });
}
