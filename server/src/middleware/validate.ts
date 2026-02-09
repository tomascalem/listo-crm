import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/apiResponse.js';

// Middleware factory for validating requests against Zod schemas
export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(400, 'Validation failed', messages));
      } else {
        next(error);
      }
    }
  };
}

// Validate only body
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(400, 'Validation failed', messages));
      } else {
        next(error);
      }
    }
  };
}

// Validate only query params
export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(400, 'Validation failed', messages));
      } else {
        next(error);
      }
    }
  };
}

// Validate only params
export function validateParams(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(400, 'Validation failed', messages));
      } else {
        next(error);
      }
    }
  };
}
