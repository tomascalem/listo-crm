import { z } from 'zod';

export const InteractionType = z.enum(['call', 'video', 'email', 'meeting', 'note']);

// Email message schema (for email threads)
const emailMessageSchema = z.object({
  id: z.string(),
  from: z.object({ name: z.string(), email: z.string() }),
  to: z.array(z.object({ name: z.string(), email: z.string() })),
  cc: z.array(z.object({ name: z.string(), email: z.string() })).optional(),
  subject: z.string(),
  body: z.string(),
  date: z.string(),
  isInbound: z.boolean(),
});

// Create interaction schema
export const createInteractionSchema = z.object({
  type: InteractionType,
  date: z.string().datetime(),
  duration: z.number().int().positive().optional().nullable(),
  summary: z.string().min(1, 'Summary is required'),
  transcript: z.string().optional().nullable(),
  recordingUrl: z.string().url().optional().nullable(),
  highlights: z.array(z.string()).optional().default([]),
  wants: z.array(z.string()).optional().default([]),
  concerns: z.array(z.string()).optional().default([]),
  emailThread: z.array(emailMessageSchema).optional().nullable(),
  contactId: z.string().cuid('Invalid contact ID'),
  venueId: z.string().cuid('Invalid venue ID'),
});

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;

// Update interaction schema
export const updateInteractionSchema = createInteractionSchema.partial();

export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;

// List interactions query schema
export const listInteractionsQuerySchema = z.object({
  venueId: z.string().cuid().optional(),
  contactId: z.string().cuid().optional(),
  type: InteractionType.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
