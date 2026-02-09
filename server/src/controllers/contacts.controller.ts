import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type { CreateContactInput, UpdateContactInput, BulkDeleteContactsInput } from '../schemas/contact.schema.js';

export const contactsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactService.findAll(req.query as Record<string, string>);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.findById(req.params.id);
      res.json(successResponse(contact));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateContactInput = req.body;
      const contact = await contactService.create(input);
      res.status(201).json(successResponse(contact));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateContactInput = req.body;
      const contact = await contactService.update(req.params.id, input);
      res.json(successResponse(contact));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await contactService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const input: BulkDeleteContactsInput = req.body;
      const result = await contactService.bulkDelete(input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async linkToVenue(req: Request<{ id: string; venueId: string }>, res: Response, next: NextFunction) {
    try {
      const result = await contactService.linkToVenue(req.params.id, req.params.venueId);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async unlinkFromVenue(req: Request<{ id: string; venueId: string }>, res: Response, next: NextFunction) {
    try {
      const result = await contactService.unlinkFromVenue(req.params.id, req.params.venueId);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
};
