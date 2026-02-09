import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import type {
  CreateVenueInput,
  UpdateVenueInput,
  UpdateVenueStageInput,
  BulkUpdateVenuesInput,
  BulkDeleteVenuesInput,
} from '../schemas/venue.schema.js';
import { VenueStage, VenueStatus, VenueType } from '@prisma/client';

export const venueService = {
  // Get all venues with filters and pagination
  async findAll(query: {
    status?: string;
    type?: string;
    stage?: string;
    search?: string;
    operatorId?: string;
    assignedTo?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status as VenueStatus;
    }
    if (query.type) {
      where.type = query.type as VenueType;
    }
    if (query.stage) {
      where.stage = query.stage as VenueStage;
    }
    if (query.operatorId) {
      where.operatorId = query.operatorId;
    }
    if (query.assignedTo) {
      where.assignedUsers = {
        some: { userId: query.assignedTo },
      };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { state: { contains: query.search, mode: 'insensitive' } },
        { teamName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastActivity: 'desc' }, { name: 'asc' }],
        include: {
          operator: { select: { id: true, name: true, logo: true } },
          concessionaires: {
            include: {
              concessionaire: { select: { id: true, name: true, logo: true } },
            },
          },
          assignedUsers: {
            include: {
              user: { select: { id: true, name: true, avatar: true, avatarUrl: true } },
            },
          },
          _count: {
            select: { contacts: true, interactions: true, todos: true },
          },
        },
      }),
      prisma.venue.count({ where }),
    ]);

    // Transform data
    const items = venues.map((venue) => ({
      ...venue,
      concessionaires: venue.concessionaires.map((vc) => vc.concessionaire),
      assignedUsers: venue.assignedUsers.map((va) => va.user),
      contactCount: venue._count.contacts,
      interactionCount: venue._count.interactions,
      todoCount: venue._count.todos,
      _count: undefined,
    }));

    return paginatedResponse(items, total, page, limit);
  },

  // Get venue by ID
  async findById(id: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        operator: true,
        concessionaires: {
          include: { concessionaire: true },
        },
        assignedUsers: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { contacts: true, interactions: true, todos: true, files: true, contracts: true },
        },
      },
    });

    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    return {
      ...venue,
      concessionaires: venue.concessionaires.map((vc) => vc.concessionaire),
      assignedUsers: venue.assignedUsers.map((va) => va.user),
      _count: undefined,
      contactCount: venue._count.contacts,
      interactionCount: venue._count.interactions,
      todoCount: venue._count.todos,
      fileCount: venue._count.files,
      contractCount: venue._count.contracts,
    };
  },

  // Create venue
  async create(input: CreateVenueInput) {
    const { concessionaireIds, assignedUserIds, opportunity, ...venueData } = input;

    // Verify operator exists
    const operator = await prisma.operator.findUnique({
      where: { id: input.operatorId },
    });
    if (!operator) {
      throw new ApiError(400, 'Invalid operator ID');
    }

    return prisma.venue.create({
      data: {
        ...venueData,
        opportunity: opportunity ?? undefined,
        concessionaires: concessionaireIds?.length
          ? {
              create: concessionaireIds.map((id) => ({ concessionaireId: id })),
            }
          : undefined,
        assignedUsers: assignedUserIds?.length
          ? {
              create: assignedUserIds.map((id) => ({ userId: id })),
            }
          : undefined,
      },
      include: {
        operator: true,
        concessionaires: { include: { concessionaire: true } },
        assignedUsers: { include: { user: true } },
      },
    });
  },

  // Update venue
  async update(id: string, input: UpdateVenueInput) {
    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Venue not found');
    }

    const { concessionaireIds, assignedUserIds, opportunity, operatorId, ...venueData } = input;

    // Update venue with relations
    return prisma.$transaction(async (tx) => {
      // Update concessionaires if provided
      if (concessionaireIds !== undefined) {
        await tx.venueConcessionaire.deleteMany({ where: { venueId: id } });
        if (concessionaireIds.length > 0) {
          await tx.venueConcessionaire.createMany({
            data: concessionaireIds.map((cId) => ({ venueId: id, concessionaireId: cId })),
          });
        }
      }

      // Update assigned users if provided
      if (assignedUserIds !== undefined) {
        await tx.venueAssignment.deleteMany({ where: { venueId: id } });
        if (assignedUserIds.length > 0) {
          await tx.venueAssignment.createMany({
            data: assignedUserIds.map((uId) => ({ venueId: id, userId: uId })),
          });
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        ...venueData,
        lastActivity: new Date(),
      };

      if (operatorId !== undefined) {
        updateData.operatorId = operatorId;
      }

      if (opportunity !== undefined) {
        updateData.opportunity = opportunity ?? undefined;
      }

      // Update venue
      return tx.venue.update({
        where: { id },
        data: updateData,
        include: {
          operator: true,
          concessionaires: { include: { concessionaire: true } },
          assignedUsers: { include: { user: true } },
        },
      });
    });
  },

  // Update venue stage (for pipeline drag-drop)
  async updateStage(id: string, input: UpdateVenueStageInput) {
    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Venue not found');
    }

    return prisma.venue.update({
      where: { id },
      data: {
        stage: input.stage as VenueStage,
        lastActivity: new Date(),
      },
    });
  },

  // Delete venue
  async delete(id: string) {
    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Venue not found');
    }

    return prisma.venue.delete({ where: { id } });
  },

  // Bulk update venues
  async bulkUpdate(input: BulkUpdateVenuesInput) {
    const { ids, stage, status, assignedUserIds } = input;

    return prisma.$transaction(async (tx) => {
      // Update assignments if provided
      if (assignedUserIds !== undefined) {
        await tx.venueAssignment.deleteMany({
          where: { venueId: { in: ids } },
        });
        if (assignedUserIds.length > 0) {
          const assignments = ids.flatMap((venueId) =>
            assignedUserIds.map((userId) => ({ venueId, userId }))
          );
          await tx.venueAssignment.createMany({ data: assignments });
        }
      }

      // Update venues
      const updateData: Record<string, unknown> = { lastActivity: new Date() };
      if (stage) updateData.stage = stage as VenueStage;
      if (status) updateData.status = status as VenueStatus;

      const result = await tx.venue.updateMany({
        where: { id: { in: ids } },
        data: updateData,
      });

      return { updated: result.count };
    });
  },

  // Bulk delete venues
  async bulkDelete(input: BulkDeleteVenuesInput) {
    const result = await prisma.venue.deleteMany({
      where: { id: { in: input.ids } },
    });

    return { deleted: result.count };
  },

  // Get contacts for venue
  async getContacts(venueId: string) {
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    const contactVenues = await prisma.contactVenue.findMany({
      where: { venueId },
      include: { contact: true },
      orderBy: { contact: { isPrimary: 'desc' } },
    });

    return contactVenues.map((cv) => cv.contact);
  },

  // Get interactions for venue
  async getInteractions(venueId: string) {
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    return prisma.interaction.findMany({
      where: { venueId },
      orderBy: { date: 'desc' },
      include: {
        contact: { select: { id: true, name: true, avatar: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  // Get todos for venue
  async getTodos(venueId: string) {
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    return prisma.todo.findMany({
      where: { venueId },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
        contact: { select: { id: true, name: true } },
      },
    });
  },

  // Get files for venue (including inherited)
  async getFiles(venueId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        concessionaires: true,
      },
    });
    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    const concessionaireIds = venue.concessionaires.map((vc) => vc.concessionaireId);

    // Get venue files + inherited from operator + inherited from concessionaires
    const files = await prisma.venueFile.findMany({
      where: {
        OR: [
          { venueId },
          { operatorId: venue.operatorId, isInheritable: true },
          { concessionaireId: { in: concessionaireIds }, isInheritable: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return files;
  },

  // Get contracts for venue (including inherited)
  async getContracts(venueId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        concessionaires: true,
      },
    });
    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    const concessionaireIds = venue.concessionaires.map((vc) => vc.concessionaireId);

    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { venueId },
          { operatorId: venue.operatorId, isInheritable: true },
          { concessionaireId: { in: concessionaireIds }, isInheritable: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts;
  },
};
