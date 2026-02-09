import { Request, Response, NextFunction } from 'express';
import { venueService } from '../services/venue.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type {
  CreateVenueInput,
  UpdateVenueInput,
  UpdateVenueStageInput,
  BulkUpdateVenuesInput,
  BulkDeleteVenuesInput,
} from '../schemas/venue.schema.js';

export const venuesController = {
  // GET /venues - List all venues
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await venueService.findAll(req.query as Record<string, string>);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // GET /venues/:id - Get venue by ID
  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const venue = await venueService.findById(req.params.id);
      res.json(successResponse(venue));
    } catch (error) {
      next(error);
    }
  },

  // POST /venues - Create venue
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateVenueInput = req.body;
      const venue = await venueService.create(input);
      res.status(201).json(successResponse(venue));
    } catch (error) {
      next(error);
    }
  },

  // PUT /venues/:id - Update venue
  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateVenueInput = req.body;
      const venue = await venueService.update(req.params.id, input);
      res.json(successResponse(venue));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /venues/:id/stage - Update venue stage
  async updateStage(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateVenueStageInput = req.body;
      const venue = await venueService.updateStage(req.params.id, input);
      res.json(successResponse(venue));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /venues/:id - Delete venue
  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await venueService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  // POST /venues/bulk/update - Bulk update venues
  async bulkUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const input: BulkUpdateVenuesInput = req.body;
      const result = await venueService.bulkUpdate(input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // POST /venues/bulk/delete - Bulk delete venues
  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const input: BulkDeleteVenuesInput = req.body;
      const result = await venueService.bulkDelete(input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // GET /venues/:id/contacts - Get contacts for venue
  async getContacts(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const contacts = await venueService.getContacts(req.params.id);
      res.json(successResponse(contacts));
    } catch (error) {
      next(error);
    }
  },

  // GET /venues/:id/interactions - Get interactions for venue
  async getInteractions(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const interactions = await venueService.getInteractions(req.params.id);
      res.json(successResponse(interactions));
    } catch (error) {
      next(error);
    }
  },

  // GET /venues/:id/todos - Get todos for venue
  async getTodos(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const todos = await venueService.getTodos(req.params.id);
      res.json(successResponse(todos));
    } catch (error) {
      next(error);
    }
  },

  // GET /venues/:id/files - Get files for venue
  async getFiles(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const files = await venueService.getFiles(req.params.id);
      res.json(successResponse(files));
    } catch (error) {
      next(error);
    }
  },

  // GET /venues/:id/contracts - Get contracts for venue
  async getContracts(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const contracts = await venueService.getContracts(req.params.id);
      res.json(successResponse(contracts));
    } catch (error) {
      next(error);
    }
  },
};
