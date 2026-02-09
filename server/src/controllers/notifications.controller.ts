import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const notificationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.findAll(
        req.user!.id,
        req.query as Record<string, string>
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(req.user!.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user!.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.params.id, req.user!.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },
};
