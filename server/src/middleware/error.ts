import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({ err: error, path: req.path, method: req.method }, 'Error occurred');

  // Handle ApiError
  if (error instanceof ApiError) {
    res.status(error.statusCode).json(errorResponse(error.message, error.errors));
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const messages = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json(errorResponse('Validation failed', messages));
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        res.status(409).json(errorResponse('A record with this value already exists'));
        return;
      case 'P2025':
        // Record not found
        res.status(404).json(errorResponse('Record not found'));
        return;
      case 'P2003':
        // Foreign key constraint failed
        res.status(400).json(errorResponse('Related record not found'));
        return;
      default:
        res.status(500).json(errorResponse('Database error'));
        return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json(errorResponse('Invalid data provided'));
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(errorResponse('Invalid token'));
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json(errorResponse('Token has expired'));
    return;
  }

  // Default to 500 internal server error
  const message = config.isDev ? error.message : 'Internal server error';
  res.status(500).json(errorResponse(message));
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(errorResponse(`Route ${req.method} ${req.path} not found`));
};
