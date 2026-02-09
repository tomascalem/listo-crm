import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const auditController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await auditService.findAll(req.query as Record<string, string>);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getByEntity(
    req: Request<{ type: string; id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await auditService.findByEntity(
        req.params.type,
        req.params.id,
        req.query as Record<string, string>
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getByUser(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const result = await auditService.findByUser(
        req.params.id,
        req.query as Record<string, string>
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
};
