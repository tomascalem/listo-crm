import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { encryptToken, decryptToken } from '../utils/encryption.js';
import { ApiError } from '../utils/apiResponse.js';

export const googleOAuthService = {
  /**
   * Create a new OAuth2 client
   */
  createOAuth2Client(): OAuth2Client {
    return new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  },

  /**
   * Generate the OAuth consent URL
   */
  getAuthUrl(state: string): string {
    const oauth2Client = this.createOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.google.scopes,
      state,
      prompt: 'consent', // Force consent to ensure we get refresh token
    });
  },

  /**
   * Exchange authorization code for tokens and store them
   */
  async exchangeCode(code: string, userId: string) {
    const oauth2Client = this.createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new ApiError(400, 'Failed to obtain tokens from Google');
    }

    // Get user info from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    if (!userInfo.data.email) {
      throw new ApiError(400, 'Failed to get email from Google account');
    }

    // Store encrypted tokens in database
    await prisma.googleOAuthToken.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: encryptToken(tokens.access_token),
        refreshToken: encryptToken(tokens.refresh_token),
        scope: tokens.scope || config.google.scopes.join(' '),
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        googleEmail: userInfo.data.email,
        googleId: userInfo.data.id || null,
      },
      update: {
        accessToken: encryptToken(tokens.access_token),
        refreshToken: encryptToken(tokens.refresh_token),
        scope: tokens.scope || config.google.scopes.join(' '),
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        googleEmail: userInfo.data.email,
        googleId: userInfo.data.id || null,
      },
    });

    // Initialize sync state
    await prisma.googleSyncState.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return { email: userInfo.data.email };
  },

  /**
   * Get an authenticated OAuth2 client for a user
   * Handles automatic token refresh
   */
  async getAuthenticatedClient(userId: string): Promise<OAuth2Client> {
    const storedToken = await prisma.googleOAuthToken.findUnique({
      where: { userId },
    });

    if (!storedToken) {
      throw new ApiError(401, 'Google account not connected');
    }

    const oauth2Client = this.createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: decryptToken(storedToken.accessToken),
      refresh_token: decryptToken(storedToken.refreshToken),
      expiry_date: storedToken.expiresAt.getTime(),
    });

    // Handle automatic token refresh
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        try {
          await prisma.googleOAuthToken.update({
            where: { userId },
            data: {
              accessToken: encryptToken(tokens.access_token),
              expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
            },
          });
        } catch (error) {
          console.error('Failed to update refreshed token:', error);
        }
      }
    });

    return oauth2Client;
  },

  /**
   * Disconnect Google account for a user
   */
  async disconnect(userId: string) {
    const token = await prisma.googleOAuthToken.findUnique({
      where: { userId },
    });

    if (token) {
      // Try to revoke the token with Google
      const oauth2Client = this.createOAuth2Client();
      try {
        await oauth2Client.revokeToken(decryptToken(token.accessToken));
      } catch (error) {
        // Ignore revocation errors - token may already be invalid
        console.warn('Token revocation failed (may already be invalid):', error);
      }
    }

    // Delete from database - cascade will handle related records
    await prisma.googleOAuthToken.delete({
      where: { userId },
    }).catch(() => {
      // Ignore if not found
    });

    await prisma.googleSyncState.delete({
      where: { userId },
    }).catch(() => {
      // Ignore if not found
    });

    // Also clean up synced records
    await prisma.syncedGmailMessage.deleteMany({
      where: { userId },
    });

    await prisma.syncedCalendarEvent.deleteMany({
      where: { userId },
    });
  },

  /**
   * Get connection status for a user
   */
  async getConnectionStatus(userId: string) {
    const token = await prisma.googleOAuthToken.findUnique({
      where: { userId },
      select: {
        googleEmail: true,
        lastGmailSync: true,
        lastCalendarSync: true,
        createdAt: true,
      },
    });

    const syncState = await prisma.googleSyncState.findUnique({
      where: { userId },
    });

    return {
      connected: !!token,
      email: token?.googleEmail || null,
      lastGmailSync: token?.lastGmailSync || null,
      lastCalendarSync: token?.lastCalendarSync || null,
      connectedAt: token?.createdAt || null,
      syncStatus: syncState
        ? {
            gmailSyncStatus: syncState.gmailSyncStatus,
            calendarSyncStatus: syncState.calendarSyncStatus,
            lastGmailError: syncState.lastGmailError,
            lastCalendarError: syncState.lastCalendarError,
          }
        : null,
    };
  },
};
