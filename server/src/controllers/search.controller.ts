import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const searchController = {
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        q: (req.query.q as string) || '',
        type: req.query.type as 'venue' | 'contact' | 'operator' | 'concessionaire' | undefined,
        limit: req.query.limit as string | undefined,
        offset: req.query.offset as string | undefined,
      };
      const results = await searchService.globalSearch(query);
      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  },

  async searchVenues(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await searchService.searchVenues(
        req.query as Record<string, string>
      );
      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  },

  async searchContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await searchService.searchContacts(
        req.query as Record<string, string>
      );
      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  },

  async searchOperators(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await searchService.searchOperators(
        req.query as Record<string, string>
      );
      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  },

  async searchConcessionaires(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await searchService.searchConcessionaires(
        req.query as Record<string, string>
      );
      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  },
};
