import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type { RegisterInput, LoginInput, RefreshTokenInput } from '../schemas/auth.schema.js';

export const authController = {
  // POST /auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input: RegisterInput = req.body;
      const result = await authService.register(input);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      const result = await authService.refreshTokens(refreshToken);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      await authService.logout(refreshToken);
      res.json(successResponse({ message: 'Logged out successfully' }));
    } catch (error) {
      next(error);
    }
  },

  // GET /auth/me
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  },
};
