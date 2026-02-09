/**
 * Listo CRM Gmail Add-on
 *
 * This add-on allows you to send email threads to your Listo CRM
 * with a single click.
 *
 * Setup:
 * 1. Set your CRM API URL in the Settings
 * 2. Generate an API token in Listo CRM Settings
 * 3. Save the token in the add-on Settings
 */

// ============================================
// Configuration
// ============================================

/**
 * Get user properties (stored settings)
 */
function getUserSettings() {
  const userProperties = PropertiesService.getUserProperties();
  return {
    apiUrl: userProperties.getProperty('CRM_API_URL') || '',
    apiToken: userProperties.getProperty('CRM_API_TOKEN') || '',
  };
}

/**
 * Save user settings
 */
function saveUserSettings(apiUrl, apiToken) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('CRM_API_URL', apiUrl);
  userProperties.setProperty('CRM_API_TOKEN', apiToken);
}

// ============================================
// Main Entry Points
// ============================================

/**
 * Triggered when a Gmail message is opened
 * This is the main entry point for the add-on
 */
function onGmailMessageOpen(e) {
  const settings = getUserSettings();

  // If not configured, show setup card
  if (!settings.apiUrl || !settings.apiToken) {
    return buildSetupCard();
  }

  // Get the current message and thread
  const messageId = e.gmail.messageId;
  const accessToken = e.gmail.accessToken;

  GmailApp.setCurrentMessageAccessToken(accessToken);

  const message = GmailApp.getMessageById(messageId);
  const thread = message.getThread();
  const threadId = thread.getId();

  // Check if thread is already in CRM
  const status = checkThreadStatus(threadId, settings);

  if (status.error) {
    return buildErrorCard(status.error);
  }

  // Build the appropriate card based on status
  if (status.imported) {
    return buildImportedCard(thread, status, settings);
  } else {
    return buildImportCard(thread, settings);
  }
}

// ============================================
// Card Builders
// ============================================

/**
 * Build the setup card for first-time configuration
 */
function buildSetupCard() {
  const card = CardService.newCardBuilder();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Listo CRM Setup')
      .setSubtitle('Configure your connection')
  );

  const section = CardService.newCardSection();

  section.addWidget(
    CardService.newTextParagraph()
      .setText('Enter your Listo CRM API details to get started.')
  );

  section.addWidget(
    CardService.newTextInput()
      .setFieldName('apiUrl')
      .setTitle('API URL')
      .setHint('e.g., https://your-crm.com/api/v1')
  );

  section.addWidget(
    CardService.newTextInput()
      .setFieldName('apiToken')
      .setTitle('API Token')
      .setHint('From CRM Settings > Integrations')
  );

  section.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Save Settings')
          .setOnClickAction(
            CardService.newAction().setFunctionName('handleSaveSettings')
          )
      )
  );

  card.addSection(section);

  return card.build();
}

/**
 * Build the card for importing a thread (not yet in CRM)
 */
function buildImportCard(thread, settings) {
  const card = CardService.newCardBuilder();
  const messages = thread.getMessages();
  const subject = thread.getFirstMessageSubject();
  const participants = getThreadParticipants(messages);

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Send to Listo CRM')
      .setSubtitle(subject.length > 40 ? subject.substring(0, 40) + '...' : subject)
  );

  // Thread info section
  const infoSection = CardService.newCardSection();

  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Messages')
      .setText(messages.length.toString())
      .setStartIcon(
        CardService.newIconImage()
          .setIcon(CardService.Icon.EMAIL)
      )
  );

  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Participants')
      .setText(participants.map(p => p.name || p.email).join(', '))
      .setWrapText(true)
      .setStartIcon(
        CardService.newIconImage()
          .setIcon(CardService.Icon.PERSON)
      )
  );

  card.addSection(infoSection);

  // Action section
  const actionSection = CardService.newCardSection();

  actionSection.addWidget(
    CardService.newTextParagraph()
      .setText('This thread will be linked to a matching contact in your CRM.')
  );

  actionSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Send to CRM')
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor('#0d9488')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('handleImportThread')
              .setParameters({ threadId: thread.getId() })
          )
      )
  );

  card.addSection(actionSection);

  // Settings link
  const settingsSection = CardService.newCardSection();
  settingsSection.addWidget(
    CardService.newTextButton()
      .setText('Settings')
      .setOnClickAction(
        CardService.newAction().setFunctionName('showSettings')
      )
  );
  card.addSection(settingsSection);

  return card.build();
}

/**
 * Build the card for a thread that's already in CRM
 */
function buildImportedCard(thread, status, settings) {
  const card = CardService.newCardBuilder();
  const subject = thread.getFirstMessageSubject();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Already in CRM')
      .setSubtitle(subject.length > 40 ? subject.substring(0, 40) + '...' : subject)
  );

  // Status section
  const statusSection = CardService.newCardSection();

  statusSection.addWidget(
    CardService.newDecoratedText()
      .setText('This thread is tracked in Listo CRM')
      .setStartIcon(
        CardService.newIconImage()
          .setIcon(CardService.Icon.INVITE)
      )
  );

  if (status.contact) {
    statusSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('Contact')
        .setText(status.contact.name)
        .setBottomLabel(status.contact.email)
        .setStartIcon(
          CardService.newIconImage()
            .setIcon(CardService.Icon.PERSON)
        )
    );
  }

  if (status.venue) {
    statusSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('Venue')
        .setText(status.venue.name)
        .setStartIcon(
          CardService.newIconImage()
            .setIcon(CardService.Icon.BOOKMARK)
        )
    );
  }

  statusSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Messages synced')
      .setText(status.messageCount.toString())
      .setStartIcon(
        CardService.newIconImage()
          .setIcon(CardService.Icon.EMAIL)
      )
  );

  card.addSection(statusSection);

  // Actions section
  const actionSection = CardService.newCardSection();

  // Check if there are new messages to sync
  const threadMessages = thread.getMessages();
  if (threadMessages.length > status.messageCount) {
    actionSection.addWidget(
      CardService.newTextParagraph()
        .setText('There are ' + (threadMessages.length - status.messageCount) + ' new message(s) to sync.')
    );

    actionSection.addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText('Update in CRM')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor('#0d9488')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('handleImportThread')
                .setParameters({ threadId: thread.getId() })
            )
        )
    );
  }

  actionSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('View in CRM')
          .setOpenLink(
            CardService.newOpenLink()
              .setUrl(settings.apiUrl.replace('/api/v1', '') + '/interactions/' + status.interactionId)
              .setOpenAs(CardService.OpenAs.FULL_SIZE)
          )
      )
      .addButton(
        CardService.newTextButton()
          .setText('Remove from CRM')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('handleRemoveThread')
              .setParameters({ threadId: thread.getId() })
          )
      )
  );

  card.addSection(actionSection);

  return card.build();
}

/**
 * Build an error card
 */
function buildErrorCard(errorMessage) {
  const card = CardService.newCardBuilder();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Error')
  );

  const section = CardService.newCardSection();

  section.addWidget(
    CardService.newTextParagraph()
      .setText(errorMessage)
  );

  section.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Settings')
          .setOnClickAction(
            CardService.newAction().setFunctionName('showSettings')
          )
      )
  );

  card.addSection(section);

  return card.build();
}

/**
 * Build a success notification card
 */
function buildSuccessCard(title, message) {
  const card = CardService.newCardBuilder();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle(title)
  );

  const section = CardService.newCardSection();

  section.addWidget(
    CardService.newDecoratedText()
      .setText(message)
      .setStartIcon(
        CardService.newIconImage()
          .setIcon(CardService.Icon.INVITE)
      )
  );

  card.addSection(section);

  return card.build();
}

// ============================================
// Action Handlers
// ============================================

/**
 * Handle saving settings
 */
function handleSaveSettings(e) {
  const apiUrl = e.formInput.apiUrl;
  const apiToken = e.formInput.apiToken;
  const currentSettings = getUserSettings();

  if (!apiUrl) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('Please enter an API URL')
      )
      .build();
  }

  // Use existing token if new one not provided
  const tokenToSave = apiToken || currentSettings.apiToken;

  if (!tokenToSave) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('Please enter an API token')
      )
      .build();
  }

  saveUserSettings(apiUrl, tokenToSave);

  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification()
        .setText('Settings saved! Please reopen the add-on.')
    )
    .build();
}

/**
 * Handle importing a thread
 */
function handleImportThread(e) {
  const settings = getUserSettings();
  const threadId = e.parameters.threadId;

  const thread = GmailApp.getThreadById(threadId);
  const messages = thread.getMessages();
  const subject = thread.getFirstMessageSubject();
  const participants = getThreadParticipants(messages);

  // Prepare message data
  const messageData = messages.map(msg => ({
    id: msg.getId(),
    from: parseEmailAddress(msg.getFrom()),
    to: msg.getTo().split(',').map(e => parseEmailAddress(e.trim())),
    cc: msg.getCc() ? msg.getCc().split(',').map(e => parseEmailAddress(e.trim())) : [],
    subject: msg.getSubject(),
    body: msg.getPlainBody().substring(0, 10000), // Limit size
    date: msg.getDate().toISOString(),
    isInbound: !isOwnEmail(msg.getFrom()),
  }));

  // Call CRM API
  const payload = {
    threadId: threadId,
    subject: subject,
    messages: messageData,
    participants: participants,
  };

  try {
    const response = callCrmApi('/google/gmail/import-thread', 'POST', payload, settings);

    if (response.success) {
      if (response.data.needsContact) {
        // Need to select a contact - show contact selection card
        return CardService.newActionResponseBuilder()
          .setNotification(
            CardService.newNotification()
              .setText('No matching contact found. Please add this contact to your CRM first.')
          )
          .build();
      }

      const message = response.data.updated
        ? 'Updated! ' + response.data.newMessagesCount + ' new message(s) added.'
        : 'Sent to CRM! Linked to ' + response.data.contact.name;

      return CardService.newActionResponseBuilder()
        .setNotification(
          CardService.newNotification()
            .setText(message)
        )
        .setNavigation(
          CardService.newNavigation()
            .updateCard(buildImportedCard(thread, {
              imported: true,
              interactionId: response.data.interactionId,
              contact: response.data.contact,
              venue: response.data.venue,
              messageCount: response.data.totalMessages || messageData.length,
            }, settings))
        )
        .build();
    } else {
      throw new Error(response.error || 'Unknown error');
    }
  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('Error: ' + error.message)
      )
      .build();
  }
}

/**
 * Handle removing a thread from CRM
 */
function handleRemoveThread(e) {
  const settings = getUserSettings();
  const threadId = e.parameters.threadId;

  try {
    const response = callCrmApi('/google/gmail/thread/' + encodeURIComponent(threadId), 'DELETE', null, settings);

    if (response.success) {
      const thread = GmailApp.getThreadById(threadId);

      return CardService.newActionResponseBuilder()
        .setNotification(
          CardService.newNotification()
            .setText('Removed from CRM')
        )
        .setNavigation(
          CardService.newNavigation()
            .updateCard(buildImportCard(thread, settings))
        )
        .build();
    } else {
      throw new Error(response.error || 'Unknown error');
    }
  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('Error: ' + error.message)
      )
      .build();
  }
}

/**
 * Show settings card
 */
function showSettings() {
  const settings = getUserSettings();

  const card = CardService.newCardBuilder();

  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Listo CRM Settings')
  );

  const section = CardService.newCardSection();

  section.addWidget(
    CardService.newTextInput()
      .setFieldName('apiUrl')
      .setTitle('API URL')
      .setValue(settings.apiUrl)
      .setHint('e.g., https://your-crm.com/api/v1')
  );

  section.addWidget(
    CardService.newTextInput()
      .setFieldName('apiToken')
      .setTitle('API Token')
      .setHint(settings.apiToken ? 'Token saved. Leave blank to keep current.' : 'From CRM Settings > Integrations')
  );

  section.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Save Settings')
          .setOnClickAction(
            CardService.newAction().setFunctionName('handleSaveSettings')
          )
      )
  );

  card.addSection(section);

  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .pushCard(card.build())
    )
    .build();
}

// ============================================
// API Communication
// ============================================

/**
 * Check if a thread is already in CRM
 */
function checkThreadStatus(threadId, settings) {
  try {
    const response = callCrmApi('/google/gmail/thread-status?threadId=' + encodeURIComponent(threadId), 'GET', null, settings);

    if (response.success) {
      return response.data;
    } else {
      return { error: response.error || 'Failed to check status' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Make an API call to the CRM
 */
function callCrmApi(endpoint, method, payload, settings) {
  const url = settings.apiUrl + endpoint;

  const options = {
    method: method,
    headers: {
      'Authorization': 'Bearer ' + settings.apiToken,
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  };

  if (payload && method !== 'GET') {
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (statusCode === 401) {
    throw new Error('Invalid API token. Please check your settings.');
  }

  if (statusCode === 403) {
    throw new Error('Access denied. Please check your permissions.');
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    throw new Error('Invalid response from CRM: ' + responseText.substring(0, 100));
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Parse an email address string like "John Doe <john@example.com>"
 */
function parseEmailAddress(raw) {
  if (!raw) return { name: '', email: '' };

  const match = raw.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
  if (match) {
    return {
      name: (match[1] || '').trim() || match[2],
      email: match[2].toLowerCase(),
    };
  }
  return { name: raw, email: raw.toLowerCase() };
}

/**
 * Get all unique participants from a thread
 */
function getThreadParticipants(messages) {
  const seen = new Set();
  const participants = [];

  for (const msg of messages) {
    const from = parseEmailAddress(msg.getFrom());
    if (from.email && !seen.has(from.email)) {
      seen.add(from.email);
      participants.push(from);
    }

    for (const to of msg.getTo().split(',')) {
      const parsed = parseEmailAddress(to.trim());
      if (parsed.email && !seen.has(parsed.email)) {
        seen.add(parsed.email);
        participants.push(parsed);
      }
    }
  }

  return participants;
}

/**
 * Check if an email address belongs to the current user
 */
function isOwnEmail(emailStr) {
  const userEmail = Session.getActiveUser().getEmail().toLowerCase();
  const parsed = parseEmailAddress(emailStr);
  return parsed.email === userEmail;
}
