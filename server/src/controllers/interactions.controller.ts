import { Request, Response, NextFunction } from 'express';
import { interactionService } from '../services/interaction.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type { CreateInteractionInput, UpdateInteractionInput } from '../schemas/interaction.schema.js';

export const interactionsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await interactionService.findAll(
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
      const interaction = await interactionService.findById(req.params.id);
      res.json(successResponse(interaction));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateInteractionInput = req.body;
      const interaction = await interactionService.create(input, req.user!.id);
      res.status(201).json(successResponse(interaction));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateInteractionInput = req.body;
      const interaction = await interactionService.update(req.params.id, input);
      res.json(successResponse(interaction));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await interactionService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },
};
