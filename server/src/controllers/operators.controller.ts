import { Request, Response, NextFunction } from 'express';
import { operatorService } from '../services/operator.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type { CreateOperatorInput, UpdateOperatorInput } from '../schemas/operator.schema.js';

export const operatorsController = {
  // GET /operators - List all operators
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await operatorService.findAll(req.query as Record<string, string>);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // GET /operators/:id - Get operator by ID
  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const operator = await operatorService.findById(req.params.id);
      res.json(successResponse(operator));
    } catch (error) {
      next(error);
    }
  },

  // POST /operators - Create operator
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateOperatorInput = req.body;
      const operator = await operatorService.create(input);
      res.status(201).json(successResponse(operator));
    } catch (error) {
      next(error);
    }
  },

  // PUT /operators/:id - Update operator
  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateOperatorInput = req.body;
      const operator = await operatorService.update(req.params.id, input);
      res.json(successResponse(operator));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /operators/:id - Delete operator
  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await operatorService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  // GET /operators/:id/venues - Get venues for operator
  async getVenues(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const venues = await operatorService.getVenues(req.params.id);
      res.json(successResponse(venues));
    } catch (error) {
      next(error);
    }
  },

  // GET /operators/:id/contacts - Get contacts for operator
  async getContacts(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const contacts = await operatorService.getContacts(req.params.id);
      res.json(successResponse(contacts));
    } catch (error) {
      next(error);
    }
  },

  // GET /operators/:id/interactions - Get interactions for operator
  async getInteractions(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const interactions = await operatorService.getInteractions(req.params.id);
      res.json(successResponse(interactions));
    } catch (error) {
      next(error);
    }
  },
};
