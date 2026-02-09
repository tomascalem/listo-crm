import { z } from 'zod';

export const FileType = z.enum(['deck', 'one_pager', 'proposal', 'report', 'other']);
export const EntityType = z.enum(['venue', 'operator', 'concessionaire']);

// Get upload URL schema
export const getUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  entityType: EntityType,
  entityId: z.string().cuid(),
});

export type GetUploadUrlInput = z.infer<typeof getUploadUrlSchema>;

// Create file schema (after upload)
export const createFileSchema = z.object({
  name: z.string().min(1).max(500),
  type: FileType,
  s3Key: z.string().min(1),
  s3Url: z.string().url(),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
  entityType: EntityType,
  entityId: z.string().cuid(),
  isInheritable: z.boolean().optional().default(false),
});

export type CreateFileInput = z.infer<typeof createFileSchema>;

// Update file schema
export const updateFileSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  type: FileType.optional(),
  isInheritable: z.boolean().optional(),
});

export type UpdateFileInput = z.infer<typeof updateFileSchema>;
