import { z } from 'zod';

export const TaskType = z.enum(['email', 'call', 'meeting', 'document', 'follow_up', 'other']);
export const TaskPriority = z.enum(['low', 'medium', 'high']);

// Todo source schema
const todoSourceSchema = z.object({
  type: z.enum(['email', 'call', 'meeting', 'ai', 'manual']),
  label: z.string(),
  interactionId: z.string().cuid().optional(),
});

// Create todo schema
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime(),
  dueTime: z.string().optional().nullable(),
  priority: TaskPriority.optional().default('medium'),
  type: TaskType,
  assignedToId: z.string().cuid('Invalid user ID'),
  sharedWithIds: z.array(z.string().cuid()).optional().default([]),
  venueId: z.string().cuid().optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
  source: todoSourceSchema.optional().nullable(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

// Update todo schema
export const updateTodoSchema = createTodoSchema.partial();

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

// Complete todo schema
export const completeTodoSchema = z.object({
  completed: z.boolean(),
});

export type CompleteTodoInput = z.infer<typeof completeTodoSchema>;

// Share todo schema
export const shareTodoSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1),
});

export type ShareTodoInput = z.infer<typeof shareTodoSchema>;

// List todos query schema
export const listTodosQuerySchema = z.object({
  assignedTo: z.string().cuid().optional(),
  venueId: z.string().cuid().optional(),
  contactId: z.string().cuid().optional(),
  completed: z.string().optional(),
  priority: TaskPriority.optional(),
  type: TaskType.optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Bulk operations
export const bulkCompleteTodosSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
  completed: z.boolean(),
});

export type BulkCompleteTodosInput = z.infer<typeof bulkCompleteTodosSchema>;

export const bulkDeleteTodosSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
});

export type BulkDeleteTodosInput = z.infer<typeof bulkDeleteTodosSchema>;
