import { prisma } from '../config/database.js';
import { ApiError } from '../utils/apiResponse.js';

interface EmailMessage {
  id: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  subject: string;
  body: string;
  date: string;
  isInbound: boolean;
}

interface ThreadData {
  threadId: string;
  subject: string;
  messages: EmailMessage[];
  participants: { name: string; email: string }[];
}

export const gmailAddonService = {
  /**
   * Check if a Gmail thread has been imported to the CRM
   */
  async getThreadStatus(userId: string, threadId: string) {
    // Find if this thread has been synced
    const syncedMessages = await prisma.syncedGmailMessage.findMany({
      where: {
        userId,
        gmailThreadId: threadId,
      },
    });

    if (syncedMessages.length === 0) {
      return {
        imported: false,
        interactionId: null,
        messageCount: 0,
      };
    }

    // Get the interaction if it exists
    const interactionId = syncedMessages.find((m) => m.interactionId)?.interactionId;

    let interaction = null;
    let contact = null;
    let venue = null;

    if (interactionId) {
      interaction = await prisma.interaction.findUnique({
        where: { id: interactionId },
        include: {
          contact: true,
          venue: true,
        },
      });
      contact = interaction?.contact;
      venue = interaction?.venue;
    }

    return {
      imported: true,
      interactionId,
      messageCount: syncedMessages.length,
      contact: contact
        ? {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            role: contact.role,
          }
        : null,
      venue: venue
        ? {
            id: venue.id,
            name: venue.name,
          }
        : null,
      lastSyncedAt: syncedMessages[0]?.syncedAt,
    };
  },

  /**
   * Import a Gmail thread into the CRM
   */
  async importThread(
    userId: string,
    threadData: ThreadData,
    contactId?: string
  ) {
    const { threadId, subject, messages, participants } = threadData;

    // Check if already imported
    const existingSync = await prisma.syncedGmailMessage.findFirst({
      where: {
        userId,
        gmailThreadId: threadId,
        interactionId: { not: null },
      },
    });

    if (existingSync?.interactionId) {
      // Thread already exists, update it with new messages
      return this.updateThread(userId, threadId, messages, existingSync.interactionId);
    }

    // Try to match a contact if not provided
    let matchedContact = null;
    let matchedVenue = null;

    if (contactId) {
      // Use provided contact
      matchedContact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          venues: {
            include: { venue: true },
          },
        },
      });

      if (matchedContact && matchedContact.venues.length > 0) {
        matchedVenue = matchedContact.venues[0].venue;
      }
    } else {
      // Try to auto-match from participants
      for (const participant of participants) {
        const contact = await prisma.contact.findFirst({
          where: {
            email: {
              equals: participant.email,
              mode: 'insensitive',
            },
          },
          include: {
            venues: {
              include: { venue: true },
            },
          },
        });

        if (contact && contact.venues.length > 0) {
          matchedContact = contact;
          matchedVenue = contact.venues[0].venue;
          break;
        }
      }
    }

    if (!matchedContact || !matchedVenue) {
      // Return info about participants so UI can let user choose/create
      return {
        success: false,
        needsContact: true,
        participants: participants.map((p) => ({
          name: p.name,
          email: p.email,
        })),
        message: 'No matching contact found. Please select or create a contact.',
      };
    }

    // Create the interaction
    const emailThread = messages.map((msg) => ({
      id: msg.id,
      from: msg.from,
      to: msg.to,
      cc: msg.cc,
      subject: msg.subject,
      body: msg.body,
      date: msg.date,
      isInbound: msg.isInbound,
    }));

    // Sort by date (newest first)
    emailThread.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const interaction = await prisma.interaction.create({
      data: {
        type: 'email',
        date: new Date(messages[0]?.date || Date.now()),
        summary: `Email: ${subject}`,
        gmailThreadId: threadId,
        contactId: matchedContact.id,
        venueId: matchedVenue.id,
        userId,
        highlights: [],
        wants: [],
        concerns: [],
        emailThread,
      },
    });

    // Record synced messages
    for (const msg of messages) {
      await prisma.syncedGmailMessage.upsert({
        where: { gmailMessageId: msg.id },
        create: {
          userId,
          gmailMessageId: msg.id,
          gmailThreadId: threadId,
          interactionId: interaction.id,
        },
        update: {
          interactionId: interaction.id,
        },
      });
    }

    // Update venue lastActivity
    await prisma.venue.update({
      where: { id: matchedVenue.id },
      data: { lastActivity: new Date() },
    });

    return {
      success: true,
      interactionId: interaction.id,
      contact: {
        id: matchedContact.id,
        name: matchedContact.name,
      },
      venue: {
        id: matchedVenue.id,
        name: matchedVenue.name,
      },
      messageCount: messages.length,
    };
  },

  /**
   * Update an existing thread with new messages
   */
  async updateThread(
    userId: string,
    threadId: string,
    messages: EmailMessage[],
    interactionId: string
  ) {
    const interaction = await prisma.interaction.findUnique({
      where: { id: interactionId },
      include: {
        contact: true,
        venue: true,
      },
    });

    if (!interaction) {
      throw new ApiError(404, 'Interaction not found');
    }

    const existingThread = (interaction.emailThread as any[]) || [];
    const existingIds = new Set(existingThread.map((e) => e.id));

    let newMessagesCount = 0;

    for (const msg of messages) {
      if (!existingIds.has(msg.id)) {
        existingThread.push({
          id: msg.id,
          from: msg.from,
          to: msg.to,
          cc: msg.cc,
          subject: msg.subject,
          body: msg.body,
          date: msg.date,
          isInbound: msg.isInbound,
        });
        newMessagesCount++;

        // Record the synced message
        await prisma.syncedGmailMessage.upsert({
          where: { gmailMessageId: msg.id },
          create: {
            userId,
            gmailMessageId: msg.id,
            gmailThreadId: threadId,
            interactionId,
          },
          update: {},
        });
      }
    }

    // Sort by date (newest first)
    existingThread.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Update interaction with newest date
    const newestDate = new Date(existingThread[0]?.date || interaction.date);

    await prisma.interaction.update({
      where: { id: interactionId },
      data: {
        emailThread: existingThread,
        date: newestDate > new Date(interaction.date) ? newestDate : interaction.date,
      },
    });

    return {
      success: true,
      updated: true,
      interactionId,
      newMessagesCount,
      totalMessages: existingThread.length,
      contact: {
        id: interaction.contact.id,
        name: interaction.contact.name,
      },
      venue: {
        id: interaction.venue.id,
        name: interaction.venue.name,
      },
    };
  },

  /**
   * Remove a thread from CRM (delete the interaction)
   */
  async removeThread(userId: string, threadId: string) {
    // Find the interaction for this thread
    const interaction = await prisma.interaction.findFirst({
      where: {
        gmailThreadId: threadId,
        userId,
      },
    });

    if (!interaction) {
      throw new ApiError(404, 'Thread not found in CRM');
    }

    // Delete synced message records
    await prisma.syncedGmailMessage.deleteMany({
      where: {
        gmailThreadId: threadId,
        userId,
      },
    });

    // Delete the interaction
    await prisma.interaction.delete({
      where: { id: interaction.id },
    });

    return {
      success: true,
      removed: true,
    };
  },

  /**
   * Get contacts for dropdown in add-on (search by email or name)
   */
  async searchContacts(query: string, limit = 10) {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        venues: {
          include: { venue: true },
        },
      },
      take: limit,
    });

    return contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      role: contact.role,
      venues: contact.venues.map((v) => ({
        id: v.venue.id,
        name: v.venue.name,
      })),
    }));
  },
};
