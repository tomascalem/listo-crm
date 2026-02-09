import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { errorResponse } from '../utils/apiResponse.js';

// General rate limiter for all API routes
export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many requests, please try again later'),
  skip: () => config.isDev, // Skip rate limiting in development
});

// Stricter rate limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many authentication attempts, please try again later'),
  skip: () => config.isDev,
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many file uploads, please try again later'),
  skip: () => config.isDev,
});
