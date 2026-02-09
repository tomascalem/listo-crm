import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import type {
  CreateTodoInput,
  UpdateTodoInput,
  CompleteTodoInput,
  ShareTodoInput,
  BulkCompleteTodosInput,
  BulkDeleteTodosInput,
} from '../schemas/todo.schema.js';
import { TaskType, TaskPriority } from '@prisma/client';

export const todoService = {
  // Get all todos with filters
  async findAll(query: {
    assignedTo?: string;
    venueId?: string;
    contactId?: string;
    completed?: string;
    priority?: string;
    type?: string;
    dueBefore?: string;
    dueAfter?: string;
    page?: string;
    limit?: string;
  }, userId: string) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    // Filter by assigned user or shared with current user
    if (query.assignedTo) {
      where.assignedToId = query.assignedTo;
    } else {
      // Show todos assigned to user or shared with user
      where.OR = [
        { assignedToId: userId },
        { sharedWith: { some: { userId } } },
      ];
    }

    if (query.venueId) where.venueId = query.venueId;
    if (query.contactId) where.contactId = query.contactId;
    if (query.completed !== undefined) where.completed = query.completed === 'true';
    if (query.priority) where.priority = query.priority as TaskPriority;
    if (query.type) where.type = query.type as TaskType;

    if (query.dueBefore || query.dueAfter) {
      where.dueDate = {};
      if (query.dueBefore) {
        (where.dueDate as Record<string, unknown>).lte = new Date(query.dueBefore);
      }
      if (query.dueAfter) {
        (where.dueDate as Record<string, unknown>).gte = new Date(query.dueAfter);
      }
    }

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { priority: 'desc' }],
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          createdBy: { select: { id: true, name: true } },
          sharedWith: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          venue: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true } },
        },
      }),
      prisma.todo.count({ where }),
    ]);

    const items = todos.map((t) => ({
      ...t,
      sharedWith: t.sharedWith.map((s) => s.user),
    }));

    return paginatedResponse(items, total, page, limit);
  },

  // Get todo by ID
  async findById(id: string) {
    const todo = await prisma.todo.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        sharedWith: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        venue: true,
        contact: true,
        sourceInteraction: true,
      },
    });

    if (!todo) {
      throw new ApiError(404, 'Todo not found');
    }

    return {
      ...todo,
      sharedWith: todo.sharedWith.map((s) => s.user),
    };
  },

  // Create todo
  async create(input: CreateTodoInput, createdById: string) {
    const { sharedWithIds, source, ...todoData } = input;

    return prisma.todo.create({
      data: {
        ...todoData,
        dueDate: new Date(input.dueDate),
        source: source ?? undefined,
        createdById,
        sharedWith: sharedWithIds?.length
          ? { create: sharedWithIds.map((id) => ({ userId: id })) }
          : undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        sharedWith: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });
  },

  // Update todo
  async update(id: string, input: UpdateTodoInput) {
    const existing = await prisma.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Todo not found');
    }

    const { sharedWithIds, source, ...todoData } = input;

    return prisma.$transaction(async (tx) => {
      // Update shared users if provided
      if (sharedWithIds !== undefined) {
        await tx.todoShare.deleteMany({ where: { todoId: id } });
        if (sharedWithIds.length > 0) {
          await tx.todoShare.createMany({
            data: sharedWithIds.map((userId) => ({ todoId: id, userId })),
          });
        }
      }

      const updateData: Record<string, unknown> = { ...todoData };
      if (input.dueDate) {
        updateData.dueDate = new Date(input.dueDate);
      }
      if (source !== undefined) {
        updateData.source = source ?? undefined;
      }

      return tx.todo.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          createdBy: { select: { id: true, name: true } },
          sharedWith: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          venue: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true } },
        },
      });
    });
  },

  // Toggle completion
  async toggleComplete(id: string, input: CompleteTodoInput) {
    const existing = await prisma.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Todo not found');
    }

    return prisma.todo.update({
      where: { id },
      data: { completed: input.completed },
    });
  },

  // Delete todo
  async delete(id: string) {
    const existing = await prisma.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Todo not found');
    }

    return prisma.todo.delete({ where: { id } });
  },

  // Share todo with users
  async share(id: string, input: ShareTodoInput) {
    const existing = await prisma.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Todo not found');
    }

    // Get existing shares
    const existingShares = await prisma.todoShare.findMany({
      where: { todoId: id },
      select: { userId: true },
    });
    const existingUserIds = new Set(existingShares.map((s) => s.userId));

    // Only add new shares
    const newUserIds = input.userIds.filter((id) => !existingUserIds.has(id));

    if (newUserIds.length > 0) {
      await prisma.todoShare.createMany({
        data: newUserIds.map((userId) => ({ todoId: id, userId })),
      });
    }

    return { shared: newUserIds.length };
  },

  // Unshare todo with user
  async unshare(todoId: string, userId: string) {
    const existing = await prisma.todoShare.findUnique({
      where: { todoId_userId: { todoId, userId } },
    });

    if (!existing) {
      throw new ApiError(404, 'Share not found');
    }

    await prisma.todoShare.delete({
      where: { todoId_userId: { todoId, userId } },
    });

    return { unshared: true };
  },

  // Bulk complete todos
  async bulkComplete(input: BulkCompleteTodosInput) {
    const result = await prisma.todo.updateMany({
      where: { id: { in: input.ids } },
      data: { completed: input.completed },
    });
    return { updated: result.count };
  },

  // Bulk delete todos
  async bulkDelete(input: BulkDeleteTodosInput) {
    const result = await prisma.todo.deleteMany({
      where: { id: { in: input.ids } },
    });
    return { deleted: result.count };
  },

  // Get todos for dashboard (user's incomplete todos)
  async getForDashboard(userId: string, limit = 10) {
    return prisma.todo.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          { sharedWith: { some: { userId } } },
        ],
        completed: false,
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      take: limit,
      include: {
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });
  },
};
