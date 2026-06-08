const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");
import { getAccessToken } from "../utils/authToken";

import type { NextFunction, Request, Response } from "express";

type Role = "USER" | "ADMIN";

function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = getAccessToken(req);

  if (!token) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  try {
    req.user = jwt.verify(token, env.jwt.accessSecret) as Request["user"];
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
  }
}

function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = getAccessToken(req);

  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwt.accessSecret) as Request["user"];
  } catch {
    req.user = undefined;
  }

  return next();
}

function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    return next();
  };
}

module.exports = { authenticate, optionalAuthenticate, authorize };

export {};
