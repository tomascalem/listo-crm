import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const eventsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.findAll(
        req.query as Record<string, string>,
        req.user!.id
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findById(req.params.id);
      res.json(successResponse(event));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.create(req.body, req.user!.id);
      res.status(201).json(successResponse(event));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const event = await eventService.update(req.params.id, req.body, req.user!.id);
      res.json(successResponse(event));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await eventService.delete(req.params.id, req.user!.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },
};
