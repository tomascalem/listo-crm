import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Service for managing API keys
 * API keys are used for integrations like the Gmail Add-on
 */
export const apiKeyService = {
  /**
   * Generate a new API key for a user
   */
  async generateKey(userId: string, name: string, expiresAt?: Date) {
    // Generate a random 32-byte key
    const rawKey = crypto.randomBytes(32).toString('hex');

    // Create the full key with prefix for identification
    const keyPrefix = rawKey.substring(0, 8);
    const fullKey = `listo_${rawKey}`;

    // Hash the key for storage (we only store the hash)
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

    // Create the API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
        keyPrefix,
        expiresAt,
      },
    });

    // Return the full key only once - it won't be retrievable again
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: fullKey, // Only returned on creation!
      keyPrefix,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    };
  },

  /**
   * Validate an API key and return the associated user
   */
  async validateKey(key: string) {
    // Hash the provided key
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    // Find the API key by hash
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });

    if (!apiKey) {
      return null;
    }

    // Check if revoked
    if (apiKey.revokedAt) {
      return null;
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp (don't await to avoid slowing down request)
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {
      // Ignore errors updating lastUsedAt
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
      },
      user: apiKey.user,
    };
  },

  /**
   * List all API keys for a user (without the actual keys)
   */
  async listKeys(userId: string) {
    const keys = await prisma.apiKey.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys;
  },

  /**
   * Revoke an API key
   */
  async revokeKey(userId: string, keyId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
        revokedAt: null,
      },
    });

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return { revoked: true };
  },

  /**
   * Delete an API key permanently
   */
  async deleteKey(userId: string, keyId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    });

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return { deleted: true };
  },
};
