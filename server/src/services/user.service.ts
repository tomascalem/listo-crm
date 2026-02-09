import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { ApiError } from '../utils/apiResponse.js';
import type {
  UpdateProfileInput,
  UpdatePreferencesInput,
  ChangePasswordInput,
} from '../schemas/user.schema.js';

// Generate initials from name
function generateAvatar(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const userService = {
  // Get all users (for assignment dropdowns)
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  },

  // Get user by ID
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        avatarUrl: true,
        createdAt: true,
        preferences: {
          select: {
            emailNotifications: true,
            inAppNotifications: true,
            theme: true,
            timezone: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  },

  // Update user profile
  async updateProfile(userId: string, input: UpdateProfileInput) {
    // Check if email is being changed and if it's already taken
    if (input.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: input.email,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new ApiError(409, 'Email already in use');
      }
    }

    // Update avatar if name is changing
    const updateData: Record<string, unknown> = { ...input };
    if (input.name) {
      updateData.avatar = generateAvatar(input.name);
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        avatarUrl: true,
      },
    });
  },

  // Change password
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const validPassword = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!validPassword) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password and update
    const passwordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully' };
  },

  // Update avatar URL
  async updateAvatar(userId: string, avatarUrl: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        avatarUrl: true,
      },
    });
  },

  // Get user preferences
  async getPreferences(userId: string) {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    // Return default preferences if none exist
    return (
      preferences || {
        emailNotifications: true,
        inAppNotifications: true,
        theme: 'system',
        timezone: 'America/New_York',
      }
    );
  },

  // Update user preferences
  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    return prisma.userPreference.upsert({
      where: { userId },
      update: input,
      create: {
        userId,
        ...input,
      },
    });
  },
};
