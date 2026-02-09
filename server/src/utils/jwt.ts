import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from './apiResponse.js';

export interface TokenPayload {
  userId: string;
}

// Parse duration string (e.g., '15m', '7d') to milliseconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit!] || 0);
}

// Convert duration string to seconds for JWT
function durationToSeconds(duration: string): number {
  return Math.floor(parseDuration(duration) / 1000);
}

// Generate access and refresh tokens
export function generateTokens(userId: string): {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
} {
  const accessToken = jwt.sign(
    { userId } as TokenPayload,
    config.jwtSecret,
    { expiresIn: durationToSeconds(config.jwtAccessExpiresIn) }
  );

  const refreshToken = jwt.sign(
    { userId } as TokenPayload,
    config.jwtSecret,
    { expiresIn: durationToSeconds(config.jwtRefreshExpiresIn) }
  );

  // Calculate refresh expiration date
  const refreshExpiresAt = new Date(
    Date.now() + parseDuration(config.jwtRefreshExpiresIn)
  );

  return { accessToken, refreshToken, refreshExpiresAt };
}

// Verify and decode access token
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid access token');
    }
    throw error;
  }
}

// Verify and decode refresh token
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    throw error;
  }
}
