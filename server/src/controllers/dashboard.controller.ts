import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const dashboardController = {
  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await dashboardService.getSchedule(req.user!.id);
      res.json(successResponse(schedule));
    } catch (error) {
      next(error);
    }
  },

  async getTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const todos = await dashboardService.getTodos(req.user!.id, limit);
      res.json(successResponse(todos));
    } catch (error) {
      next(error);
    }
  },

  async getRecommendedActions(req: Request, res: Response, next: NextFunction) {
    try {
      const actions = await dashboardService.getRecommendedActions(req.user!.id);
      res.json(successResponse(actions));
    } catch (error) {
      next(error);
    }
  },

  async dismissAction(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.dismissAction(req.params.id, req.user!.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async completeAction(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.completeAction(req.params.id, req.user!.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const insights = await dashboardService.getInsights(req.user!.id);
      res.json(successResponse(insights));
    } catch (error) {
      next(error);
    }
  },

  async markInsightRead(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.markInsightRead(req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats(req.user!.id);
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  },
};
