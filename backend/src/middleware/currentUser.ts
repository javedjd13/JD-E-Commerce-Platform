const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { parseCookies } = require('../utils/cookies');

import type { NextFunction, Request, Response } from 'express';

function requireUserId(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies.accessToken;

  if (bearerToken || cookieToken) {
    try {
      req.user = jwt.verify(bearerToken || cookieToken, env.jwt.accessSecret) as Request['user'];
      return next();
    } catch (error) {
      return next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
  }

  const headerUserId = req.header('x-user-id');
  const bodyUserId = typeof req.body?.userId === 'string' ? req.body.userId : undefined;
  const queryUserId = typeof req.query?.userId === 'string' ? req.query.userId : undefined;
  const userId = headerUserId || bodyUserId || queryUserId;

  if (!userId) {
    return next(new AppError('Authorization Bearer token or x-user-id header is required', 400, 'USER_ID_REQUIRED'));
  }

  req.user = {
    sub: userId,
    role: 'USER',
    email: ''
  };

  return next();
}

module.exports = { requireUserId };

export {};
