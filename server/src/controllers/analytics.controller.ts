import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const analyticsController = {
  async getPipelineMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getPipelineMetrics();
      res.json(successResponse(metrics));
    } catch (error) {
      next(error);
    }
  },

  async getPipelineTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'weekly' | 'monthly') || 'monthly';
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
      const trends = await analyticsService.getPipelineTrends(period, months);
      res.json(successResponse(trends));
    } catch (error) {
      next(error);
    }
  },

  async getRevenueMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getRevenueMetrics();
      res.json(successResponse(metrics));
    } catch (error) {
      next(error);
    }
  },

  async getRevenueForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const forecast = await analyticsService.getRevenueForecast();
      res.json(successResponse(forecast));
    } catch (error) {
      next(error);
    }
  },

  async getActivityMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 3;
      const metrics = await analyticsService.getActivityMetrics(months);
      res.json(successResponse(metrics));
    } catch (error) {
      next(error);
    }
  },

  async getActivityByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 3;
      const activity = await analyticsService.getActivityByUser(months);
      res.json(successResponse(activity));
    } catch (error) {
      next(error);
    }
  },

  async getPerformanceMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getPerformanceMetrics();
      res.json(successResponse(metrics));
    } catch (error) {
      next(error);
    }
  },

  async getVenuesByType(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await analyticsService.getVenuesByType();
      res.json(successResponse(distribution));
    } catch (error) {
      next(error);
    }
  },

  async getVenuesByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await analyticsService.getVenuesByStatus();
      res.json(successResponse(distribution));
    } catch (error) {
      next(error);
    }
  },
};
