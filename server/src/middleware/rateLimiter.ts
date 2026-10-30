import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Creates an in-memory rate limiter middleware.
 * @param windowMs Time window in milliseconds (e.g. 60000 = 1 min)
 * @param max Max allowed requests within window
 */
export const rateLimiter = (windowMs: number = 60000, max: number = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = (req.user?.id || req.ip || 'anonymous') + ':' + req.baseUrl;
    const now = Date.now();

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > max) {
      res.status(429).json({
        error: 'Too many requests. Please slow down and try again shortly.',
        retryAfterMs: Math.max(0, store[key].resetTime - now)
      });
      return;
    }

    next();
  };
};
