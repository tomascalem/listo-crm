import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiResponse.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

// Generate initials from name
function generateAvatar(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const authService = {
  // Register a new user
  async register(input: RegisterInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password and create user
    const passwordHash = await hashPassword(input.password);
    const avatar = generateAvatar(input.name);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.createTokens(user.id);

    return { user, ...tokens };
  },

  // Login user
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.createTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  },

  // Refresh tokens
  async refreshTokens(refreshToken: string) {
    // Verify the refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Delete old token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Create new tokens
    return this.createTokens(payload.userId);
  },

  // Logout - invalidate refresh token
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  },

  // Create and store tokens
  async createTokens(userId: string) {
    const { accessToken, refreshToken, refreshExpiresAt } = generateTokens(userId);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  },

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

  // Clean up expired refresh tokens (call periodically)
  async cleanupExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  },
};
