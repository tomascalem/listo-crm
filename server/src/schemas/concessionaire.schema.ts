import { z } from 'zod';

// Create concessionaire schema
export const createConcessionaireSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  headquarters: z.string().optional().nullable(),
});

export type CreateConcessionaireInput = z.infer<typeof createConcessionaireSchema>;

// Update concessionaire schema
export const updateConcessionaireSchema = createConcessionaireSchema.partial();

export type UpdateConcessionaireInput = z.infer<typeof updateConcessionaireSchema>;
