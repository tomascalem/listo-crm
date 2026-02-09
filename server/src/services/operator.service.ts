import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import type { CreateOperatorInput, UpdateOperatorInput } from '../schemas/operator.schema.js';

export const operatorService = {
  // Get all operators with pagination and search
  async findAll(query: { search?: string; page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { headquarters: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [operators, total] = await Promise.all([
      prisma.operator.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { venues: true, contacts: true },
          },
        },
      }),
      prisma.operator.count({ where }),
    ]);

    // Transform to include venueCount
    const items = operators.map((op) => ({
      ...op,
      venueCount: op._count.venues,
      contactCount: op._count.contacts,
      _count: undefined,
    }));

    return paginatedResponse(items, total, page, limit);
  },

  // Get operator by ID
  async findById(id: string) {
    const operator = await prisma.operator.findUnique({
      where: { id },
      include: {
        _count: {
          select: { venues: true, contacts: true },
        },
      },
    });

    if (!operator) {
      throw new ApiError(404, 'Operator not found');
    }

    return {
      ...operator,
      venueCount: operator._count.venues,
      contactCount: operator._count.contacts,
      _count: undefined,
    };
  },

  // Create operator
  async create(input: CreateOperatorInput) {
    return prisma.operator.create({
      data: input,
    });
  },

  // Update operator
  async update(id: string, input: UpdateOperatorInput) {
    // Check if operator exists
    const existing = await prisma.operator.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Operator not found');
    }

    return prisma.operator.update({
      where: { id },
      data: input,
    });
  },

  // Delete operator
  async delete(id: string) {
    // Check if operator exists
    const existing = await prisma.operator.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Operator not found');
    }

    // Check if operator has venues
    const venueCount = await prisma.venue.count({ where: { operatorId: id } });
    if (venueCount > 0) {
      throw new ApiError(400, `Cannot delete operator with ${venueCount} associated venues`);
    }

    return prisma.operator.delete({ where: { id } });
  },

  // Get venues for operator
  async getVenues(operatorId: string) {
    const operator = await prisma.operator.findUnique({ where: { id: operatorId } });
    if (!operator) {
      throw new ApiError(404, 'Operator not found');
    }

    return prisma.venue.findMany({
      where: { operatorId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    });
  },

  // Get contacts for operator
  async getContacts(operatorId: string) {
    const operator = await prisma.operator.findUnique({ where: { id: operatorId } });
    if (!operator) {
      throw new ApiError(404, 'Operator not found');
    }

    return prisma.contact.findMany({
      where: { operatorId },
      orderBy: { name: 'asc' },
    });
  },

  // Get interactions for operator (via venues)
  async getInteractions(operatorId: string) {
    const operator = await prisma.operator.findUnique({ where: { id: operatorId } });
    if (!operator) {
      throw new ApiError(404, 'Operator not found');
    }

    return prisma.interaction.findMany({
      where: {
        venue: { operatorId },
      },
      orderBy: { date: 'desc' },
      include: {
        contact: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });
  },
};
