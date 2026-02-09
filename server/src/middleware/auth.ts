import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/apiResponse.js';

// Middleware to require authentication
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  return authenticate(req, res, next);
}

// Require specific user (for profile routes)
export function requireSameUser(paramName = 'id') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.params[paramName];

    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (userId && userId !== req.user.id && userId !== 'me') {
      return next(new ApiError(403, 'Access denied'));
    }

    next();
  };
}
