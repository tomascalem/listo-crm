import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import type { CreateInteractionInput, UpdateInteractionInput } from '../schemas/interaction.schema.js';
import { InteractionType } from '@prisma/client';

export const interactionService = {
  // Get all interactions with filters
  async findAll(query: {
    venueId?: string;
    contactId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
  }, userId: string) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.venueId) {
      where.venueId = query.venueId;
    }
    if (query.contactId) {
      where.contactId = query.contactId;
    }
    if (query.type) {
      where.type = query.type as InteractionType;
    }
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        (where.date as Record<string, unknown>).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.date as Record<string, unknown>).lte = new Date(query.endDate);
      }
    }

    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          contact: { select: { id: true, name: true, avatar: true, role: true } },
          venue: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.interaction.count({ where }),
    ]);

    return paginatedResponse(interactions, total, page, limit);
  },

  // Get interaction by ID
  async findById(id: string) {
    const interaction = await prisma.interaction.findUnique({
      where: { id },
      include: {
        contact: true,
        venue: true,
        user: { select: { id: true, name: true, avatar: true, email: true } },
      },
    });

    if (!interaction) {
      throw new ApiError(404, 'Interaction not found');
    }

    return interaction;
  },

  // Create interaction
  async create(input: CreateInteractionInput, userId: string) {
    // Verify contact and venue exist
    const [contact, venue] = await Promise.all([
      prisma.contact.findUnique({ where: { id: input.contactId } }),
      prisma.venue.findUnique({ where: { id: input.venueId } }),
    ]);

    if (!contact) throw new ApiError(400, 'Invalid contact ID');
    if (!venue) throw new ApiError(400, 'Invalid venue ID');

    const { emailThread, ...interactionData } = input;

    // Create interaction and update venue lastActivity
    const [interaction] = await prisma.$transaction([
      prisma.interaction.create({
        data: {
          ...interactionData,
          date: new Date(input.date),
          userId,
          emailThread: emailThread === null ? Prisma.DbNull : emailThread,
        },
        include: {
          contact: true,
          venue: true,
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.venue.update({
        where: { id: input.venueId },
        data: { lastActivity: new Date() },
      }),
    ]);

    return interaction;
  },

  // Update interaction
  async update(id: string, input: UpdateInteractionInput) {
    const existing = await prisma.interaction.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Interaction not found');
    }

    const { emailThread, ...restInput } = input;
    const updateData: Record<string, unknown> = { ...restInput };
    if (input.date) {
      updateData.date = new Date(input.date);
    }
    if (emailThread !== undefined) {
      updateData.emailThread = emailThread === null ? Prisma.DbNull : emailThread;
    }

    return prisma.interaction.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        venue: true,
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  // Delete interaction
  async delete(id: string) {
    const existing = await prisma.interaction.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Interaction not found');
    }

    return prisma.interaction.delete({ where: { id } });
  },
};
