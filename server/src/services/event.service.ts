import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import { ScheduledEventType } from '@prisma/client';

interface CreateEventInput {
  type: ScheduledEventType;
  title: string;
  startTime: string;
  endTime?: string | null;
  venueId?: string | null;
  contactId?: string | null;
}

interface UpdateEventInput {
  type?: ScheduledEventType;
  title?: string;
  startTime?: string;
  endTime?: string | null;
  venueId?: string | null;
  contactId?: string | null;
}

export const eventService = {
  // Get all events with filters
  async findAll(query: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    venueId?: string;
    page?: string;
    limit?: string;
  }, currentUserId: string) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    // Filter by user (default to current user)
    where.userId = query.userId || currentUserId;

    // Date range filter
    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) {
        (where.startTime as Record<string, unknown>).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.startTime as Record<string, unknown>).lte = new Date(query.endDate);
      }
    }

    if (query.venueId) where.venueId = query.venueId;

    const [events, total] = await Promise.all([
      prisma.scheduledEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          venue: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.scheduledEvent.count({ where }),
    ]);

    return paginatedResponse(events, total, page, limit);
  },

  // Get event by ID
  async findById(id: string) {
    const event = await prisma.scheduledEvent.findUnique({
      where: { id },
      include: {
        venue: true,
        contact: true,
        user: { select: { id: true, name: true, avatar: true, email: true } },
      },
    });

    if (!event) {
      throw new ApiError(404, 'Scheduled event not found');
    }

    return event;
  },

  // Create event
  async create(input: CreateEventInput, userId: string) {
    // Verify venue exists if provided
    if (input.venueId) {
      const venue = await prisma.venue.findUnique({ where: { id: input.venueId } });
      if (!venue) throw new ApiError(400, 'Invalid venue ID');
    }

    // Verify contact exists if provided
    if (input.contactId) {
      const contact = await prisma.contact.findUnique({ where: { id: input.contactId } });
      if (!contact) throw new ApiError(400, 'Invalid contact ID');
    }

    return prisma.scheduledEvent.create({
      data: {
        type: input.type,
        title: input.title,
        startTime: new Date(input.startTime),
        endTime: input.endTime ? new Date(input.endTime) : undefined,
        userId,
        venueId: input.venueId || undefined,
        contactId: input.contactId || undefined,
      },
      include: {
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  // Update event
  async update(id: string, input: UpdateEventInput, userId: string) {
    const existing = await prisma.scheduledEvent.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Scheduled event not found');
    }

    // Check ownership
    if (existing.userId !== userId) {
      throw new ApiError(403, 'Not authorized to update this event');
    }

    const updateData: Record<string, unknown> = {};

    if (input.type !== undefined) updateData.type = input.type;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.startTime !== undefined) updateData.startTime = new Date(input.startTime);
    if (input.endTime !== undefined) updateData.endTime = input.endTime ? new Date(input.endTime) : null;
    if (input.venueId !== undefined) updateData.venueId = input.venueId;
    if (input.contactId !== undefined) updateData.contactId = input.contactId;

    return prisma.scheduledEvent.update({
      where: { id },
      data: updateData,
      include: {
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  // Delete event
  async delete(id: string, userId: string) {
    const existing = await prisma.scheduledEvent.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Scheduled event not found');
    }

    // Check ownership
    if (existing.userId !== userId) {
      throw new ApiError(403, 'Not authorized to delete this event');
    }

    return prisma.scheduledEvent.delete({ where: { id } });
  },
};
