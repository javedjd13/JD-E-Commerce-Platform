const logger = require('../config/logger');
const AppError = require('../utils/AppError');

import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

type HttpError = Error & {
  statusCode?: number;
  code?: string;
  details?: unknown;
};

function notFound(req: Request, _res: Response, next: NextFunction) {
  const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(error);
}

const errorHandler: ErrorRequestHandler = (error: HttpError, req, res, _next) => {
  const statusCode = error.statusCode || 500;

  logger.error(error.message, {
    code: error.code,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method
  });

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? 'Internal server error' : error.message,
      code: error.code || 'INTERNAL_ERROR',
      details: error.details || undefined
    }
  });
};

module.exports = { notFound, errorHandler };

export {};
