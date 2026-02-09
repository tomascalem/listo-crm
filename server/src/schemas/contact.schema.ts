import { z } from 'zod';

// Create contact schema
export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.string().min(1, 'Role is required'),
  isPrimary: z.boolean().optional().default(false),
  avatar: z.string().optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  operatorId: z.string().cuid().optional().nullable(),
  concessionaireId: z.string().cuid().optional().nullable(),
  venueIds: z.array(z.string().cuid()).optional().default([]),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

// Update contact schema
export const updateContactSchema = createContactSchema.partial();

export type UpdateContactInput = z.infer<typeof updateContactSchema>;

// List contacts query schema
export const listContactsQuerySchema = z.object({
  search: z.string().optional(),
  venueId: z.string().cuid().optional(),
  operatorId: z.string().cuid().optional(),
  concessionaireId: z.string().cuid().optional(),
  isPrimary: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Bulk delete schema
export const bulkDeleteContactsSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
});

export type BulkDeleteContactsInput = z.infer<typeof bulkDeleteContactsSchema>;
