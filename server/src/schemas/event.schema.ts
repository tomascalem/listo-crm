import { z } from 'zod';

export const ScheduledEventType = z.enum(['call', 'video', 'meeting']);

// Create event schema
export const createEventSchema = z.object({
  type: ScheduledEventType,
  title: z.string().min(1, 'Title is required').max(500),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  venueId: z.string().cuid().optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// Update event schema
export const updateEventSchema = createEventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
