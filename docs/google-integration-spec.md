# Google Integration Specification

This document outlines the planned integration with Gmail and Google Calendar for Listo CRM.

## Overview

### Goals
- Sync all email communications with clients into the CRM
- Display email threads in the InteractionTimeline
- Send emails directly from contact/venue pages
- Sync calendar events (meetings, calls) as interactions
- Create calendar events from the CRM
- Real-time synchronization

### Constraints
- Internal tool for a small team
- Hosted on AWS
- Must handle email attribution to venues/operators/concessionaires

---

## Technical Architecture

### Infrastructure Required

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend API | Node.js/Express or Next.js | Handle OAuth, sync, business logic |
| Database | PostgreSQL (RDS) | Store users, tokens, emails, mappings |
| Background Jobs | AWS Lambda + SQS or Bull | Periodic sync, webhook processing |
| Real-time | WebSockets or Pusher | Push new emails/events to frontend |
| Cache | Redis (ElastiCache) | Rate limiting, session storage |

### Google APIs

- **Gmail API** - Read, send, watch for new messages
- **Google Calendar API** - CRUD events, watch for changes
- **Google Pub/Sub** - Real-time notifications for new emails/events

### Authentication Flow

```
User clicks "Connect Google Account"
         ↓
Redirect to Google OAuth consent screen
         ↓
User grants permissions (gmail.modify, calendar.events)
         ↓
Google redirects back with auth code
         ↓
Backend exchanges code for access + refresh tokens
         ↓
Store encrypted tokens in database
         ↓
Begin initial sync
```

**Scopes Required:**
- `https://www.googleapis.com/auth/gmail.modify` - Read/send emails
- `https://www.googleapis.com/auth/calendar.events` - Read/write calendar
- `https://www.googleapis.com/auth/userinfo.email` - Identify user

---

## Email Attribution System

### The Challenge

Emails need to be associated with the correct venue, operator, or concessionaire. However:
- One contact may work with multiple venues
- Domain names don't always indicate which specific venue
- Email threads can span multiple venues

### Attribution Strategy (Layered Approach)

When an email arrives, process in this order:

```
Email arrives
     ↓
[1] Match sender email → Contact → Entity ✓ DONE
     ↓ (no match or multiple entities)
[2] Match thread ID → Previous email associations ✓ DONE
     ↓ (new thread)
[3] Match domain → Single entity? ✓ DONE
     ↓ (multiple entities or no match)
[4] Show disambiguation UI → User picks → Save association
```

### Thread Handling

**Key Principle:** Email threads can be associated with multiple venues.

Scenarios:
1. **Single venue thread** - All emails in thread linked to one venue
2. **Multi-venue thread** - Conversation shifts between venues; thread linked to all relevant venues
3. **General thread** - Not specific to any venue (e.g., general partnership discussion)

When a user associates an email with a venue that differs from previous emails in the thread:
- Add the new venue to the thread's associations
- Do NOT remove previous associations
- The thread now appears in both venues' timelines

### Disambiguation UI

When the system cannot auto-match an email:

```
┌─────────────────────────────────────────────────────────┐
│ 📧 New email from john@aegpresents.com                  │
│ Subject: "Q2 concession numbers"                        │
│                                                         │
│ Which venue(s) is this related to?                      │
│                                                         │
│ ☐ Red Rocks Amphitheatre                                │
│ ☐ The Anthem                                            │
│ ☐ Forest Hills Stadium                                  │
│ ☐ None / General inquiry                                │
│                                                         │
│ ☑ Remember this choice for future emails from John      │
│                                                         │
│                                    [Skip] [Save]        │
└─────────────────────────────────────────────────────────┘
```

Features:
- Multi-select for threads spanning multiple venues
- Option to create contact if sender doesn't exist
- "Remember" checkbox to set default for this contact
- Skip option for non-critical emails

---

## Data Models

### New Tables

```sql
-- User's connected Google account
CREATE TABLE google_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  google_email VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  scopes TEXT[],
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Domain to entity mapping
CREATE TABLE domain_mappings (
  id UUID PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'venue', 'operator', 'concessionaire'
  entity_id UUID NOT NULL,
  is_primary BOOLEAN DEFAULT false, -- for domains with multiple entities
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email threads
CREATE TABLE email_threads (
  id UUID PRIMARY KEY,
  gmail_thread_id VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(500),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Thread to entity associations (many-to-many)
CREATE TABLE thread_entity_associations (
  id UUID PRIMARY KEY,
  thread_id UUID REFERENCES email_threads(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  associated_by UUID REFERENCES users(id),
  associated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(thread_id, entity_type, entity_id)
);

-- Individual emails
CREATE TABLE emails (
  id UUID PRIMARY KEY,
  thread_id UUID REFERENCES email_threads(id),
  gmail_message_id VARCHAR(255) UNIQUE NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_emails TEXT[], -- array of recipients
  cc_emails TEXT[],
  subject VARCHAR(500),
  body_preview TEXT, -- first 500 chars
  body_html TEXT,
  sent_at TIMESTAMP NOT NULL,
  is_inbound BOOLEAN NOT NULL,
  contact_id UUID REFERENCES contacts(id), -- matched contact
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY,
  google_event_id VARCHAR(255) UNIQUE NOT NULL,
  google_calendar_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(500),
  attendee_emails TEXT[],
  entity_type VARCHAR(50), -- associated entity
  entity_id UUID,
  contact_ids UUID[], -- associated contacts
  created_by UUID REFERENCES users(id),
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Pending attributions (emails needing user input)
CREATE TABLE pending_attributions (
  id UUID PRIMARY KEY,
  email_id UUID REFERENCES emails(id),
  suggested_entities JSONB, -- AI/domain suggestions
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'skipped'
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
interface EmailThread {
  id: string
  gmailThreadId: string
  subject: string
  lastMessageAt: Date
  // Associated entities (can be multiple)
  venueIds: string[]
  operatorIds: string[]
  concessionaireIds: string[]
  emails: Email[]
}

interface Email {
  id: string
  threadId: string
  gmailMessageId: string
  from: {
    email: string
    name?: string
  }
  to: string[]
  cc?: string[]
  subject: string
  bodyPreview: string
  bodyHtml?: string
  sentAt: Date
  isInbound: boolean
  contactId?: string // matched contact
}

interface DomainMapping {
  id: string
  domain: string
  entityType: 'venue' | 'operator' | 'concessionaire'
  entityId: string
  isPrimary: boolean
}

interface CalendarEvent {
  id: string
  googleEventId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  attendeeEmails: string[]
  // Associated entity
  entityType?: 'venue' | 'operator' | 'concessionaire'
  entityId?: string
  contactIds: string[]
}

interface PendingAttribution {
  id: string
  email: Email
  suggestedEntities: {
    venues: Array<{ id: string; name: string; confidence: number }>
    operators: Array<{ id: string; name: string; confidence: number }>
    concessionaires: Array<{ id: string; name: string; confidence: number }>
  }
  status: 'pending' | 'resolved' | 'skipped'
}
```

---

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `DELETE /api/auth/google` - Disconnect Google account
- `GET /api/auth/google/status` - Check connection status

### Emails
- `GET /api/emails` - List emails (with filters)
- `GET /api/emails/thread/:threadId` - Get thread with all emails
- `GET /api/emails/venue/:venueId` - Emails for a venue
- `POST /api/emails/send` - Send email from CRM
- `POST /api/emails/:id/associate` - Associate email with entities
- `GET /api/emails/pending` - Get emails needing attribution

### Calendar
- `GET /api/calendar/events` - List events (with filters)
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `POST /api/calendar/events/:id/associate` - Associate with entity

### Domain Mappings
- `GET /api/domain-mappings` - List all mappings
- `POST /api/domain-mappings` - Create mapping
- `DELETE /api/domain-mappings/:id` - Delete mapping

### Sync
- `POST /api/sync/trigger` - Manually trigger sync
- `GET /api/sync/status` - Get sync status

---

## UI Components

### New Components Needed

1. **Google Connect Button** (Settings page)
   - Shows connection status
   - Connect/disconnect functionality

2. **Email Compose Modal**
   - Rich text editor
   - Recipient autocomplete from contacts
   - Attach to venue/operator/concessionaire
   - Template support (future)

3. **Email Thread View**
   - Expandable email thread
   - Show all emails in conversation
   - Entity association badges
   - Reply inline

4. **Attribution Modal**
   - Multi-select entities
   - Contact creation option
   - "Remember for contact" checkbox

5. **Calendar Event Modal**
   - Date/time picker
   - Attendee selection from contacts
   - Entity association
   - Google Calendar sync indicator

6. **Pending Attributions Widget** (Dashboard)
   - Count of emails needing attention
   - Quick access to resolve

### Updated Components

- **InteractionTimeline** - Show email threads grouped, calendar events
- **InsightsPanel** - Email response time metrics
- **Contact Cards** - Quick email/calendar actions
- **Dashboard** - Upcoming meetings, pending attributions

---

## Sync Strategy

### Initial Sync
- Fetch last 90 days of emails
- Fetch calendar events for past 30 days + future 90 days
- Run attribution on all emails
- Queue unmatched emails for user review

### Real-time Sync
- Use Google Pub/Sub push notifications
- Gmail watch on INBOX and SENT labels
- Calendar webhook for event changes
- Process within seconds of change

### Periodic Sync (Backup)
- Every 15 minutes, check for missed updates
- Reconcile any gaps from webhook failures

---

## Security Considerations

1. **Token Storage** - Encrypt refresh tokens at rest (AWS KMS)
2. **API Access** - Validate user owns the Google account
3. **Email Content** - PII handling, access logging
4. **Audit Trail** - Log who accessed what emails
5. **Data Retention** - Define email storage duration
6. **Google Compliance** - Follow Limited Use requirements

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up backend infrastructure on AWS
- [ ] Database schema and migrations
- [ ] Google OAuth flow
- [ ] Basic sync (one-time pull)

### Phase 2: Email Read
- [ ] Email fetching and storage
- [ ] Contact matching
- [ ] Domain mapping system
- [ ] Attribution UI
- [ ] Thread grouping in InteractionTimeline

### Phase 3: Email Send
- [ ] Compose modal
- [ ] Send via Gmail API
- [ ] Thread tracking for replies
- [ ] Sent email attribution

### Phase 4: Calendar
- [ ] Calendar event sync
- [ ] Event creation from CRM
- [ ] Meeting display in timeline
- [ ] Attendee matching to contacts

### Phase 5: Real-time & Polish
- [ ] Pub/Sub webhooks
- [ ] Real-time UI updates
- [ ] Pending attributions dashboard
- [ ] Email templates
- [ ] Analytics (response times, engagement)

---

## Open Questions

1. **Email storage duration** - How long to keep email content? (suggest: 2 years)
2. **Attachment handling** - Store attachments or just links? (suggest: links only)
3. **Shared mailboxes** - Support team email addresses? (e.g., sales@listo.com)
4. **Email templates** - Pre-built templates for common outreach?
5. **Mobile access** - PWA or native app for on-the-go?
