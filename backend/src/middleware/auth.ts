const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { parseCookies } = require('../utils/cookies');

import type { NextFunction, Request, Response } from 'express';

type Role = 'USER' | 'ADMIN';

function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const cookies = parseCookies(req.headers.cookie);
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : cookies.accessToken;

  if (!token) {
    return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
  }

  try {
    req.user = jwt.verify(token, env.jwt.accessSecret) as Request['user'];
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };

export {};
