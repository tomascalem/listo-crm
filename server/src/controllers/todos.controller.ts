import { Request, Response, NextFunction } from 'express';
import { todoService } from '../services/todo.service.js';
import { successResponse } from '../utils/apiResponse.js';
import type {
  CreateTodoInput,
  UpdateTodoInput,
  CompleteTodoInput,
  ShareTodoInput,
  BulkCompleteTodosInput,
  BulkDeleteTodosInput,
} from '../schemas/todo.schema.js';

export const todosController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await todoService.findAll(
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
      const todo = await todoService.findById(req.params.id);
      res.json(successResponse(todo));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateTodoInput = req.body;
      const todo = await todoService.create(input, req.user!.id);
      res.status(201).json(successResponse(todo));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: UpdateTodoInput = req.body;
      const todo = await todoService.update(req.params.id, input);
      res.json(successResponse(todo));
    } catch (error) {
      next(error);
    }
  },

  async toggleComplete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: CompleteTodoInput = req.body;
      const todo = await todoService.toggleComplete(req.params.id, input);
      res.json(successResponse(todo));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await todoService.delete(req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  async share(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const input: ShareTodoInput = req.body;
      const result = await todoService.share(req.params.id, input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async unshare(req: Request<{ id: string; userId: string }>, res: Response, next: NextFunction) {
    try {
      const result = await todoService.unshare(req.params.id, req.params.userId);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async bulkComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const input: BulkCompleteTodosInput = req.body;
      const result = await todoService.bulkComplete(input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const input: BulkDeleteTodosInput = req.body;
      const result = await todoService.bulkDelete(input);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
};
