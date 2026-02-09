import { google, calendar_v3 } from 'googleapis';
import { prisma } from '../config/database.js';
import { googleOAuthService } from './google-oauth.service.js';
import { ApiError } from '../utils/apiResponse.js';

export const calendarSyncService = {
  /**
   * Determine event type from title/summary
   */
  mapEventType(summary: string): 'call' | 'video' | 'meeting' {
    const lower = summary.toLowerCase();
    if (lower.includes('call') || lower.includes('phone')) return 'call';
    if (
      lower.includes('video') ||
      lower.includes('zoom') ||
      lower.includes('meet') ||
      lower.includes('teams') ||
      lower.includes('webinar')
    ) {
      return 'video';
    }
    return 'meeting';
  },

  /**
   * Sync Google Calendar events for a user (import only)
   */
  async syncCalendar(userId: string, options?: { fullSync?: boolean }) {
    const fullSync = options?.fullSync || false;

    // Update sync status
    await prisma.googleSyncState.update({
      where: { userId },
      data: { calendarSyncStatus: 'syncing', lastCalendarError: null },
    });

    try {
      const auth = await googleOAuthService.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const tokenRecord = await prisma.googleOAuthToken.findUnique({
        where: { userId },
      });

      if (!tokenRecord) {
        throw new ApiError(401, 'Google account not connected');
      }

      // Time range: 30 days ago to 90 days ahead
      const now = new Date();
      const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const listParams: calendar_v3.Params$Resource$Events$List = {
        calendarId: 'primary',
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      };

      // Use sync token for incremental sync
      if (!fullSync && tokenRecord.calendarSyncToken) {
        listParams.syncToken = tokenRecord.calendarSyncToken;
      } else {
        listParams.timeMin = timeMin.toISOString();
        listParams.timeMax = timeMax.toISOString();
      }

      let events: calendar_v3.Schema$Event[] = [];
      let pageToken: string | undefined;
      let nextSyncToken: string | undefined;

      // Paginate through all events
      do {
        try {
          const response = await calendar.events.list({
            ...listParams,
            pageToken,
          });

          events = events.concat(response.data.items || []);
          pageToken = response.data.nextPageToken || undefined;
          nextSyncToken = response.data.nextSyncToken || undefined;
        } catch (error: any) {
          if (error.code === 410) {
            // Sync token expired - do full sync
            console.log('Calendar sync token expired, performing full sync');
            delete listParams.syncToken;
            listParams.timeMin = timeMin.toISOString();
            listParams.timeMax = timeMax.toISOString();
            pageToken = undefined;
            events = [];
            continue;
          }
          throw error;
        }
      } while (pageToken);

      // Process events
      let importedCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;

      for (const event of events) {
        const result = await this.processEvent(event, userId);
        if (result.action === 'created') importedCount++;
        if (result.action === 'updated') updatedCount++;
        if (result.action === 'deleted') deletedCount++;
      }

      // Store sync token for future incremental syncs
      if (nextSyncToken) {
        await prisma.googleOAuthToken.update({
          where: { userId },
          data: {
            calendarSyncToken: nextSyncToken,
            lastCalendarSync: new Date(),
          },
        });
      }

      // Update sync status
      await prisma.googleSyncState.update({
        where: { userId },
        data: { calendarSyncStatus: 'idle' },
      });

      console.log(
        `Calendar sync completed: ${importedCount} imported, ${updatedCount} updated, ${deletedCount} deleted`
      );

      return {
        synced: true,
        imported: importedCount,
        updated: updatedCount,
        deleted: deletedCount,
      };
    } catch (error: any) {
      console.error('Calendar sync error:', error);
      await prisma.googleSyncState.update({
        where: { userId },
        data: {
          calendarSyncStatus: 'error',
          lastCalendarError: error.message || 'Unknown error',
        },
      });
      throw error;
    }
  },

  /**
   * Process a single calendar event
   */
  async processEvent(
    event: calendar_v3.Schema$Event,
    userId: string
  ): Promise<{ action: 'created' | 'updated' | 'deleted' | 'skipped' }> {
    if (!event.id) {
      return { action: 'skipped' };
    }

    // Handle deleted/cancelled events
    if (event.status === 'cancelled') {
      const synced = await prisma.syncedCalendarEvent.findUnique({
        where: { googleEventId: event.id },
      });

      if (synced?.scheduledEventId) {
        await prisma.scheduledEvent
          .delete({
            where: { id: synced.scheduledEventId },
          })
          .catch(() => {
            // Ignore if already deleted
          });

        await prisma.syncedCalendarEvent.delete({
          where: { googleEventId: event.id },
        });

        return { action: 'deleted' };
      }
      return { action: 'skipped' };
    }

    // Skip all-day events (no time component)
    if (event.start?.date && !event.start?.dateTime) {
      return { action: 'skipped' };
    }

    const startTime = event.start?.dateTime ? new Date(event.start.dateTime) : null;
    const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;

    if (!startTime) {
      return { action: 'skipped' };
    }

    // Check if already synced
    const existingSynced = await prisma.syncedCalendarEvent.findUnique({
      where: { googleEventId: event.id },
    });

    // Extract meeting link from various sources
    const meetingLink =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
      null;

    const eventData = {
      type: this.mapEventType(event.summary || ''),
      title: event.summary || 'Untitled Event',
      startTime,
      endTime,
      meetingLink,
      location: event.location || null,
      notes: event.description || null,
      googleEventId: event.id,
      googleCalendarId: 'primary',
      lastGoogleSync: new Date(),
    };

    if (existingSynced?.scheduledEventId) {
      // Update existing event
      await prisma.scheduledEvent.update({
        where: { id: existingSynced.scheduledEventId },
        data: eventData,
      });

      await prisma.syncedCalendarEvent.update({
        where: { googleEventId: event.id },
        data: {
          lastSyncedAt: new Date(),
          googleUpdatedAt: new Date(event.updated || Date.now()),
        },
      });

      return { action: 'updated' };
    } else {
      // Create new scheduled event
      const scheduledEvent = await prisma.scheduledEvent.create({
        data: {
          ...eventData,
          userId,
        },
      });

      await prisma.syncedCalendarEvent.create({
        data: {
          userId,
          googleEventId: event.id,
          scheduledEventId: scheduledEvent.id,
          googleUpdatedAt: new Date(event.updated || Date.now()),
        },
      });

      return { action: 'created' };
    }
  },
};
