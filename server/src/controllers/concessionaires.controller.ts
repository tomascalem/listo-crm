import { Request, Response, NextFunction } from 'express';
import { concessionaireService } from '../services/concessionaire.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type { CreateConcessionaireInput, UpdateConcessionaireInput } from '../schemas/concessionaire.schema.js';

export const concessionairesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await concessionaireService.findAll(req.query as Record<string, string>);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const concessionaire = await concessionaireService.findById(req.params.id);
      res.json(successResponse(concessionaire));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateConcessionaireInput = req.body;
      const concessionaire = await concessionaireService.create(input);
      res.status(201).json(successResponse(concessionaire));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateConcessionaireInput = req.body;
      const concessionaire = await concessionaireService.update(req.params.id, input);
      res.json(successResponse(concessionaire));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await concessionaireService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  async getVenues(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const venues = await concessionaireService.getVenues(req.params.id);
      res.json(successResponse(venues));
    } catch (error) {
      next(error);
    }
  },

  async getContacts(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const contacts = await concessionaireService.getContacts(req.params.id);
      res.json(successResponse(contacts));
    } catch (error) {
      next(error);
    }
  },
};
