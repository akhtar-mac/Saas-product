import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Strict rate limiter for Authentication (prevent brute force): 10 attempts per minute per IP
const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 60, // Block for 1 min if points consumed
});

// General API rate limiter: 300 requests per minute per IP
const apiLimiter = new RateLimiterMemory({
  points: 300,
  duration: 60,
});

export async function authRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || req.socket.remoteAddress || 'anonymous';
    await authLimiter.consume(key);
    next();
  } catch (err: any) {
    const retrySecs = Math.round(err?.msBeforeNext ? err.msBeforeNext / 1000 : 60);
    res.set('Retry-After', String(retrySecs));
    res.status(429).json({
      success: false,
      error: `Too many login attempts. Please wait ${retrySecs} seconds before trying again.`,
    });
  }
}

export async function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || req.socket.remoteAddress || 'anonymous';
    await apiLimiter.consume(key);
    next();
  } catch (err: any) {
    const retrySecs = Math.round(err?.msBeforeNext ? err.msBeforeNext / 1000 : 60);
    res.set('Retry-After', String(retrySecs));
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded. Please slow down your requests.',
    });
  }
}
