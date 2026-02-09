import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { googleOAuthService } from '../services/google-oauth.service.js';
import { calendarSyncService } from '../services/calendar-sync.service.js';
import { gmailAddonService } from '../services/gmail-addon.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { config } from '../config/index.js';

// In-memory state token storage (in production, use Redis)
const stateTokens = new Map<string, { userId: string; expiresAt: number }>();

// Clean up expired state tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateTokens) {
    if (value.expiresAt < now) {
      stateTokens.delete(key);
    }
  }
}, 60000); // Every minute

export const googleController = {
  /**
   * GET /google/auth-url
   * Get the OAuth consent URL
   */
  async getAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Check if Google credentials are configured
      if (!config.google.clientId || !config.google.clientSecret) {
        return res.status(503).json({
          success: false,
          error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
        });
      }

      // Generate secure state token
      const state = crypto.randomBytes(32).toString('hex');

      // Store state with user ID (expires in 10 minutes)
      stateTokens.set(state, {
        userId,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      const authUrl = googleOAuthService.getAuthUrl(state);
      res.json(successResponse({ authUrl }));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /google/callback
   * Handle OAuth callback from Google
   */
  async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state, error: oauthError } = req.query as {
        code?: string;
        state?: string;
        error?: string;
      };

      const frontendUrl = config.corsOrigin;

      // Handle OAuth errors
      if (oauthError) {
        return res.redirect(
          `${frontendUrl}/settings?google=error&message=${encodeURIComponent(oauthError)}`
        );
      }

      // Validate required params
      if (!code || !state) {
        return res.redirect(
          `${frontendUrl}/settings?google=error&message=${encodeURIComponent('Missing code or state')}`
        );
      }

      // Validate state token
      const stateData = stateTokens.get(state);
      if (!stateData || stateData.expiresAt < Date.now()) {
        stateTokens.delete(state);
        return res.redirect(
          `${frontendUrl}/settings?google=error&message=${encodeURIComponent('Invalid or expired state token')}`
        );
      }

      // Clean up state token
      stateTokens.delete(state);

      // Exchange code for tokens
      const result = await googleOAuthService.exchangeCode(code, stateData.userId);

      res.redirect(
        `${frontendUrl}/settings?google=success&email=${encodeURIComponent(result.email!)}`
      );
    } catch (error: any) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = config.corsOrigin;
      res.redirect(
        `${frontendUrl}/settings?google=error&message=${encodeURIComponent(error.message || 'Unknown error')}`
      );
    }
  },

  /**
   * POST /google/disconnect
   * Disconnect Google account
   */
  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      await googleOAuthService.disconnect(req.user!.id);
      res.json(successResponse({ disconnected: true }));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /google/status
   * Get connection status
   */
  async getConnectionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await googleOAuthService.getConnectionStatus(req.user!.id);
      res.json(successResponse(status));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /google/calendar/sync
   * Trigger Calendar sync
   */
  async syncCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullSync } = req.body;
      const result = await calendarSyncService.syncCalendar(req.user!.id, { fullSync });
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // Gmail Add-on Endpoints
  // ============================================

  /**
   * GET /google/gmail/thread-status
   * Check if a Gmail thread has been imported to CRM
   */
  async getThreadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.query as { threadId: string };

      if (!threadId) {
        return res.status(400).json({
          success: false,
          error: 'threadId is required',
        });
      }

      const status = await gmailAddonService.getThreadStatus(req.user!.id, threadId);
      res.json(successResponse(status));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /google/gmail/import-thread
   * Import a Gmail thread into CRM
   */
  async importThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId, subject, messages, participants, contactId } = req.body;

      if (!threadId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({
          success: false,
          error: 'threadId and messages array are required',
        });
      }

      const result = await gmailAddonService.importThread(
        req.user!.id,
        { threadId, subject, messages, participants },
        contactId
      );

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /google/gmail/thread/:threadId
   * Remove a Gmail thread from CRM
   */
  async removeThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        return res.status(400).json({
          success: false,
          error: 'threadId is required',
        });
      }

      const result = await gmailAddonService.removeThread(req.user!.id, threadId);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /google/gmail/contacts/search
   * Search contacts for the add-on dropdown
   */
  async searchContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query as { q: string };

      const contacts = await gmailAddonService.searchContacts(q || '', 10);
      res.json(successResponse(contacts));
    } catch (error) {
      next(error);
    }
  },
};
