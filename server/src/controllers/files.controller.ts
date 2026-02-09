import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/file.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type { CreateFileInput, UpdateFileInput, GetUploadUrlInput } from '../schemas/file.schema.js';
import { EntityType } from '@prisma/client';

export const filesController = {
  async listByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.query as { entityType: string; entityId: string };
      const result = await fileService.findByEntity(
        entityType as EntityType,
        entityId,
        req.query as Record<string, string>
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const file = await fileService.findById(req.params.id);
      res.json(successResponse(file));
    } catch (error) {
      next(error);
    }
  },

  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const input: GetUploadUrlInput = req.body;
      const result = await fileService.getUploadUrl(
        input.fileName,
        input.mimeType,
        input.entityType,
        input.entityId
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateFileInput = req.body;
      const file = await fileService.create(input, req.user!.id);
      res.status(201).json(successResponse(file));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateFileInput = req.body;
      const file = await fileService.update(req.params.id, input);
      res.json(successResponse(file));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await fileService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  async getDownloadUrl(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const result = await fileService.getDownloadUrl(req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
};
