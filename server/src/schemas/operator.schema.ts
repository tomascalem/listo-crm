import { z } from 'zod';

// Create operator schema
export const createOperatorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  headquarters: z.string().optional().nullable(),
});

export type CreateOperatorInput = z.infer<typeof createOperatorSchema>;

// Update operator schema
export const updateOperatorSchema = createOperatorSchema.partial();

export type UpdateOperatorInput = z.infer<typeof updateOperatorSchema>;

// Operator ID param schema
export const operatorIdParamSchema = z.object({
  id: z.string().cuid('Invalid operator ID'),
});

// List operators query schema
export const listOperatorsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
