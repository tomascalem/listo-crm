import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/api-key.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const apiKeyController = {
  /**
   * GET /api-keys
   * List all API keys for the authenticated user
   */
  async listKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const keys = await apiKeyService.listKeys(req.user!.id);
      res.json(successResponse(keys));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api-keys
   * Generate a new API key
   */
  async createKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, expiresInDays } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Name is required',
        });
        return;
      }

      // Calculate expiration date if specified
      let expiresAt: Date | undefined;
      if (expiresInDays && expiresInDays > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      const result = await apiKeyService.generateKey(req.user!.id, name, expiresAt);

      // Note: The full key is only returned once!
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api-keys/:id
   * Revoke an API key
   */
  async revokeKey(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await apiKeyService.revokeKey(req.user!.id, id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api-keys/:id/permanent
   * Permanently delete an API key
   */
  async deleteKey(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await apiKeyService.deleteKey(req.user!.id, id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
};
