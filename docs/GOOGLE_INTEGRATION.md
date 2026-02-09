# Google Integration Documentation

This document describes the Gmail and Google Calendar integration for Listo CRM.

## Overview

The integration provides:
- **Gmail Add-on**: Manually import email threads from Gmail with one click
- **Google Calendar Sync**: Import calendar events into the CRM's schedule
- **OAuth 2.0**: Secure authentication with Google accounts

All syncs are **read-only** - no data is sent back to Google.

---

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Gmail API**
   - **Google Calendar API**
   - **Google People API** (for user info)

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (or "Internal" for Google Workspace)
3. Fill in:
   - App name: `Listo CRM`
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add test users while in testing mode

### 3. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `Listo CRM Web Client`
5. Authorized redirect URIs:
   - Development: `http://localhost:4000/api/v1/google/callback`
   - Production: `https://your-domain.com/api/v1/google/callback`
6. Save the **Client ID** and **Client Secret**

### 4. Environment Variables

Add to `server/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/google/callback

# Token encryption (32 bytes hex)
# Generate with: openssl rand -hex 32
TOKEN_ENCRYPTION_KEY=your_32_byte_hex_key
```

---

## Architecture

### Backend Files

```
server/src/
├── config/
│   └── index.ts              # Google OAuth config
├── utils/
│   └── encryption.ts         # Token encryption (AES-256-GCM)
├── services/
│   ├── google-oauth.service.ts   # OAuth flow & token management
│   ├── gmail-addon.service.ts    # Gmail Add-on support
│   └── calendar-sync.service.ts  # Calendar sync logic
├── controllers/
│   └── google.controller.ts      # API endpoint handlers
└── routes/
    └── google.routes.ts          # Route definitions
```

### Frontend Files

```
src/
├── lib/
│   └── api.ts                    # googleApi client
├── queries/
│   └── google.ts                 # React Query hooks
├── components/crm/settings/
│   └── google-integration.tsx    # Settings UI component
└── pages/
    └── Settings.tsx              # Integrations tab
```

### Database Models

```prisma
// OAuth tokens (encrypted at rest)
model GoogleOAuthToken {
  id            String   @id
  userId        String   @unique
  accessToken   String   // Encrypted
  refreshToken  String   // Encrypted
  googleEmail   String
  lastGmailSync DateTime?
  lastCalendarSync DateTime?
  gmailHistoryId String?     // For incremental Gmail sync
  calendarSyncToken String?  // For incremental Calendar sync
}

// Sync status tracking
model GoogleSyncState {
  id                 String
  userId             String @unique
  gmailSyncStatus    GoogleSyncStatus  // idle | syncing | error
  calendarSyncStatus GoogleSyncStatus
  lastGmailError     String?
  lastCalendarError  String?
}

// Track synced Gmail messages (avoid duplicates)
model SyncedGmailMessage {
  id             String
  gmailMessageId String @unique
  gmailThreadId  String
  interactionId  String?  // Links to CRM Interaction
}

// Track synced Calendar events
model SyncedCalendarEvent {
  id               String
  googleEventId    String @unique
  scheduledEventId String?  // Links to CRM ScheduledEvent
}
```

---

## API Endpoints

All endpoints require authentication except `/google/callback`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/google/auth-url` | Get OAuth consent URL |
| GET | `/api/v1/google/callback` | OAuth callback (redirect from Google) |
| POST | `/api/v1/google/disconnect` | Disconnect Google account |
| GET | `/api/v1/google/status` | Get connection status |
| POST | `/api/v1/google/calendar/sync` | Trigger Calendar sync |

### Response Examples

**GET /google/status**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "email": "user@gmail.com",
    "lastGmailSync": "2024-01-15T10:30:00Z",
    "lastCalendarSync": "2024-01-15T10:30:00Z",
    "connectedAt": "2024-01-10T08:00:00Z",
    "syncStatus": {
      "gmailSyncStatus": "idle",
      "calendarSyncStatus": "idle",
      "lastGmailError": null,
      "lastCalendarError": null
    }
  }
}
```

---

## How Sync Works

### Gmail (via Add-on)

Emails are imported manually using the Gmail Add-on. See the Gmail Add-on section below for details.

### Email Processing (Add-on):
   - Fetches message metadata and body
   - Parses From, To, CC, Subject, Date
   - Extracts plain text body (falls back to HTML stripped)

3. **Contact Matching**:
   - Matches sender/recipient email to CRM contacts
   - Only creates Interactions for matched contacts
   - Links email to contact's first associated venue

4. **Thread Handling**:
   - Groups emails by Gmail thread ID
   - Adds new messages to existing Interaction if thread exists
   - Creates new Interaction for new threads

### Calendar Sync

1. **Incremental Sync**: Uses Calendar sync tokens
   - Stores `syncToken` for efficient updates
   - Falls back to full sync if token expired (410)

2. **Event Processing**:
   - Imports events from 30 days ago to 90 days ahead
   - Skips all-day events (no time component)
   - Extracts meeting links from Hangout/Meet data

3. **Event Type Detection**:
   - "call" - title contains "call" or "phone"
   - "video" - title contains "video", "zoom", "meet", "teams"
   - "meeting" - default for other events

4. **Update Handling**:
   - Updates existing events if already synced
   - Deletes local event if Google event cancelled

---

## Frontend Components

### GoogleIntegration Component

Located at `src/components/crm/settings/google-integration.tsx`

Features:
- Connect/Disconnect button
- Shows connected email address
- Gmail sync status and manual trigger
- Calendar sync status and manual trigger
- Error display for failed syncs
- Handles OAuth callback URL params

### React Query Hooks

Located at `src/queries/google.ts`

```typescript
// Get connection status (auto-refetch every 30s)
useGoogleStatus()

// Connect Google account (redirects to OAuth)
useConnectGoogle()

// Disconnect Google account
useDisconnectGoogle()

// Trigger Gmail sync
useSyncGmail(fullSync?: boolean)

// Trigger Calendar sync
useSyncCalendar(fullSync?: boolean)
```

---

## Security

### Token Storage
- OAuth tokens encrypted with AES-256-GCM before database storage
- Encryption key stored in environment variable
- IV and auth tag stored with ciphertext

### OAuth Flow
- State parameter prevents CSRF attacks
- State tokens expire after 10 minutes
- Tokens auto-refresh when expired

### Scopes
- Read-only scopes only (no write access)
- `gmail.readonly` - Read emails
- `calendar.readonly` - Read calendar events
- `userinfo.email` - Get user's email address

---

## Troubleshooting

### "Google integration is not configured"
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart the server after changing `.env`

### OAuth callback errors
- Verify redirect URI matches exactly in Google Console
- Check that user is added as test user (while in testing mode)

### Sync errors
- Check server logs for detailed error messages
- Verify Gmail/Calendar APIs are enabled in Google Console
- Check API quotas haven't been exceeded

### No emails matched
- Emails are only matched if sender/recipient exists as a Contact in CRM
- Contact must have matching email address (case-insensitive)
- Contact must be associated with at least one Venue

---

## Gmail Add-on

The Gmail Add-on provides a better alternative to automatic sync - you choose which emails to send to your CRM.

### Features

- **Send Thread to CRM** - Import entire email conversations with one click
- **Status Indicator** - See if a thread is already tracked in CRM
- **Update Threads** - Sync new messages in existing threads
- **Remove from CRM** - Delete tracked threads from your CRM
- **Contact Matching** - Automatically links emails to matching contacts

### Setup

See `gmail-addon/README.md` for detailed installation instructions.

**Quick Start:**
1. Go to [script.google.com](https://script.google.com) and create a new project
2. Copy the code from `gmail-addon/Code.gs` and `gmail-addon/appsscript.json`
3. Deploy as a test add-on
4. Configure with your CRM API URL and API key

### API Key Authentication

The Gmail Add-on uses API keys instead of JWT tokens (which expire). Users can generate API keys in Settings.

**API Key Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/api-keys` | List all API keys |
| POST | `/api/v1/api-keys` | Create a new API key |
| DELETE | `/api/v1/api-keys/:id` | Revoke an API key |

**Creating an API Key:**
```bash
curl -X POST http://localhost:4000/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Gmail Add-on"}'
```

The response includes the full API key - save it immediately as it won't be shown again.

### Add-on API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/google/gmail/thread-status` | Check if thread is imported |
| POST | `/api/v1/google/gmail/import-thread` | Import a thread |
| DELETE | `/api/v1/google/gmail/thread/:threadId` | Remove thread from CRM |
| GET | `/api/v1/google/gmail/contacts/search` | Search contacts |

### Local Development with ngrok

To test the add-on with your local CRM:

```bash
# Terminal 1: Start your CRM server
cd server && pnpm dev

# Terminal 2: Start ngrok tunnel
ngrok http 4000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io/api/v1`) in the add-on settings.

---

## Future Enhancements

### Background Sync (Not Yet Implemented)
The plan includes automatic background sync every 15 minutes using Bull queue and Redis:

```bash
# Install dependencies
pnpm add bull ioredis

# Add to .env
REDIS_URL=redis://localhost:6379
```

Files to create:
- `server/src/config/queue.ts` - Bull queue configuration
- `server/src/jobs/google-sync.job.ts` - Sync job definition

### Send Email (Not Yet Implemented)
Gmail write scope (`gmail.send`) can be added later to enable:
- Sending emails directly from CRM
- Reply to email threads
- Email templates

### Two-Way Calendar Sync (Not Yet Implemented)
Calendar write scope (`calendar.events`) can be added to:
- Create CRM events in Google Calendar
- Update events bidirectionally
- Delete events from Google Calendar
