# Listo CRM Gmail Add-on

A Gmail add-on that lets you send email threads directly to your Listo CRM with one click.

## Features

- **Send Thread to CRM** - Import entire email conversations into your CRM
- **Status Indicator** - See if a thread is already tracked in CRM
- **Update Threads** - Sync new messages in existing threads
- **Remove from CRM** - Delete tracked threads from your CRM
- **Contact Matching** - Automatically links emails to matching contacts

## Installation

### Option 1: Deploy as a Test Add-on (Development)

1. **Create Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - Click "New project"
   - Name it "Listo CRM Gmail Add-on"

2. **Copy the Code**
   - Replace the contents of `Code.gs` with the code from this folder's `Code.gs`
   - Go to Project Settings (gear icon) → "Show 'appsscript.json' manifest file in editor"
   - Click on `appsscript.json` in the sidebar
   - Replace its contents with this folder's `appsscript.json`

3. **Deploy as Test**
   - Click "Deploy" → "Test deployments"
   - Under "Gmail", click "Install"
   - Authorize the add-on when prompted

4. **Configure**
   - Open Gmail in your browser
   - Open any email
   - Click the Listo CRM icon in the right sidebar
   - Enter your CRM API URL and API token

### Option 2: Deploy for Organization (Google Workspace)

1. Create a Google Cloud Project
2. Set up OAuth consent screen
3. Publish the add-on for your organization
4. Users install from Google Workspace Marketplace

## Configuration

### API URL

The base URL of your Listo CRM API:
- **Local development with ngrok**: `https://abc123.ngrok.io/api/v1`
- **Production**: `https://your-crm.com/api/v1`

### API Token

Currently uses JWT tokens from the CRM. To get your token:

1. Open your browser's Developer Tools (F12)
2. Go to Application → Local Storage → your CRM URL
3. Copy the `accessToken` value
4. Paste it into the add-on settings

> **Note**: JWT tokens expire. For a better experience, implement API keys in your CRM that don't expire.

## Local Development with ngrok

To test the add-on with your local CRM:

1. **Start your CRM server**
   ```bash
   cd server && pnpm dev
   ```

2. **Start ngrok tunnel**
   ```bash
   ngrok http 4000
   ```

3. **Use the ngrok URL**
   - Copy the `https://xxx.ngrok.io` URL
   - In add-on settings, enter: `https://xxx.ngrok.io/api/v1`

## How It Works

1. **Opening an Email**
   - The add-on activates when you open any email
   - It checks if the thread is already in your CRM

2. **Not in CRM**
   - Shows "Send to CRM" button
   - Displays thread info (messages, participants)

3. **Already in CRM**
   - Shows linked contact and venue
   - "View in CRM" link to open the interaction
   - "Update" button if there are new messages
   - "Remove from CRM" button

4. **Importing**
   - Extracts all messages from the thread
   - Sends to CRM API
   - Auto-matches to contacts by email address
   - Creates an Interaction in the CRM

## Troubleshooting

### "Invalid API token"
- Your JWT may have expired
- Get a fresh token from Local Storage
- Consider implementing non-expiring API keys

### "No matching contact found"
- The email participants don't match any contacts in your CRM
- Add the contact to your CRM first, then try again

### Add-on not appearing
- Refresh Gmail
- Check that the add-on is installed in Test Deployments
- Try uninstalling and reinstalling

### CORS errors
- The CRM backend must allow requests from Google's servers
- This typically isn't CORS since Apps Script makes server-side requests

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/google/gmail/thread-status` | Check if thread is imported |
| POST | `/google/gmail/import-thread` | Import a thread |
| DELETE | `/google/gmail/thread/:threadId` | Remove thread from CRM |
| GET | `/google/gmail/contacts/search` | Search contacts (future use) |

## Privacy & Security

- The add-on only reads emails you explicitly choose to send
- Email content is sent to your own CRM server
- No data is sent to third parties
- OAuth scopes are read-only (gmail.readonly)
