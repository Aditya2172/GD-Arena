import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Safe logging: never print sensitive API keys or headers
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  
  // Clean client response without leaking internal paths or stack traces
  res.status(statusCode).json({
    error: err.message || 'An unexpected internal server error occurred.',
    status: statusCode,
    ...(config.nodeEnv === 'development' && { details: err.details || undefined })
  });
};
