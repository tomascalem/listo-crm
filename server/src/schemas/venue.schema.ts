import { z } from 'zod';

// Venue enums
export const VenueStatus = z.enum(['client', 'prospect', 'churned', 'negotiating']);
export const VenueStage = z.enum([
  'lead',
  'qualified',
  'demo',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);
export const VenueType = z.enum([
  'stadium',
  'arena',
  'amphitheater',
  'theater',
  'convention_center',
  'other',
]);

// Opportunity details schema
const opportunitySchema = z.object({
  useCases: z.array(z.enum(['suites', 'back_of_house', 'warehouse', 'labor_tracking'])).optional(),
  licenses: z
    .object({
      watches: z.number().int().nonnegative(),
      mobile: z.number().int().nonnegative(),
      tablets: z.number().int().nonnegative(),
    })
    .optional(),
  onsiteInterest: z.boolean().optional(),
  expectedReleaseDate: z.string().optional(),
  intel: z
    .object({
      source: z.string().optional(),
      interests: z.array(z.string()).optional(),
      painPoints: z.array(z.string()).optional(),
    })
    .optional(),
});

// Create venue schema
export const createVenueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(50),
  type: VenueType,
  capacity: z.number().int().positive().optional().nullable(),
  stage: VenueStage.optional().default('lead'),
  status: VenueStatus.optional().default('prospect'),
  dealValue: z.number().positive().optional().nullable(),
  probability: z.number().int().min(0).max(100).optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  operatorId: z.string().cuid('Invalid operator ID'),
  concessionaireIds: z.array(z.string().cuid()).optional().default([]),
  assignedUserIds: z.array(z.string().cuid()).optional().default([]),
  imageUrl: z.string().url().optional().nullable(),
  teamLogoUrl: z.string().url().optional().nullable(),
  teamName: z.string().optional().nullable(),
  opportunity: opportunitySchema.optional().nullable(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;

// Update venue schema
export const updateVenueSchema = createVenueSchema.partial().omit({ operatorId: true }).extend({
  operatorId: z.string().cuid('Invalid operator ID').optional(),
});

export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;

// Update venue stage schema
export const updateVenueStageSchema = z.object({
  stage: VenueStage,
});

export type UpdateVenueStageInput = z.infer<typeof updateVenueStageSchema>;

// List venues query schema
export const listVenuesQuerySchema = z.object({
  status: VenueStatus.optional(),
  type: VenueType.optional(),
  stage: VenueStage.optional(),
  search: z.string().optional(),
  operatorId: z.string().cuid().optional(),
  assignedTo: z.string().cuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Bulk update schema
export const bulkUpdateVenuesSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one venue ID is required'),
  stage: VenueStage.optional(),
  status: VenueStatus.optional(),
  assignedUserIds: z.array(z.string().cuid()).optional(),
});

export type BulkUpdateVenuesInput = z.infer<typeof bulkUpdateVenuesSchema>;

// Bulk delete schema
export const bulkDeleteVenuesSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one venue ID is required'),
});

export type BulkDeleteVenuesInput = z.infer<typeof bulkDeleteVenuesSchema>;
