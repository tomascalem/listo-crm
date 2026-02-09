import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Update preferences schema
export const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  timezone: z.string().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// User ID param schema
export const userIdParamSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
});
