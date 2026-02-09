import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { successResponse, ApiError } from '../utils/apiResponse.js';
import type {
  UpdateProfileInput,
  UpdatePreferencesInput,
  ChangePasswordInput,
} from '../schemas/user.schema.js';

export const usersController = {
  // GET /users - List all users
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      res.json(successResponse(users));
    } catch (error) {
      next(error);
    }
  },

  // GET /users/:id - Get user by ID
  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  },

  // PUT /users/me - Update current user profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input: UpdateProfileInput = req.body;
      const user = await userService.updateProfile(req.user!.id, input);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  },

  // PUT /users/me/password - Change password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input: ChangePasswordInput = req.body;
      const result = await userService.changePassword(req.user!.id, input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // POST /users/me/avatar - Upload avatar
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      // For now, just accept a URL (S3 integration will handle actual uploads)
      const { avatarUrl } = req.body as { avatarUrl: string };

      if (!avatarUrl) {
        throw new ApiError(400, 'Avatar URL is required');
      }

      const user = await userService.updateAvatar(req.user!.id, avatarUrl);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /users/me/avatar - Remove avatar
  async removeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateAvatar(req.user!.id, null);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  },

  // GET /users/me/preferences - Get preferences
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const preferences = await userService.getPreferences(req.user!.id);
      res.json(successResponse(preferences));
    } catch (error) {
      next(error);
    }
  },

  // PUT /users/me/preferences - Update preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const input: UpdatePreferencesInput = req.body;
      const preferences = await userService.updatePreferences(req.user!.id, input);
      res.json(successResponse(preferences));
    } catch (error) {
      next(error);
    }
  },
};
