import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import type { CreateConcessionaireInput, UpdateConcessionaireInput } from '../schemas/concessionaire.schema.js';

export const concessionaireService = {
  // Get all concessionaires with pagination and search
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

    const [concessionaires, total] = await Promise.all([
      prisma.concessionaire.findMany({
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
      prisma.concessionaire.count({ where }),
    ]);

    const items = concessionaires.map((c) => ({
      ...c,
      venueCount: c._count.venues,
      contactCount: c._count.contacts,
      _count: undefined,
    }));

    return paginatedResponse(items, total, page, limit);
  },

  // Get concessionaire by ID
  async findById(id: string) {
    const concessionaire = await prisma.concessionaire.findUnique({
      where: { id },
      include: {
        _count: {
          select: { venues: true, contacts: true },
        },
      },
    });

    if (!concessionaire) {
      throw new ApiError(404, 'Concessionaire not found');
    }

    return {
      ...concessionaire,
      venueCount: concessionaire._count.venues,
      contactCount: concessionaire._count.contacts,
      _count: undefined,
    };
  },

  // Create concessionaire
  async create(input: CreateConcessionaireInput) {
    return prisma.concessionaire.create({ data: input });
  },

  // Update concessionaire
  async update(id: string, input: UpdateConcessionaireInput) {
    const existing = await prisma.concessionaire.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Concessionaire not found');
    }

    return prisma.concessionaire.update({ where: { id }, data: input });
  },

  // Delete concessionaire
  async delete(id: string) {
    const existing = await prisma.concessionaire.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Concessionaire not found');
    }

    const venueCount = await prisma.venueConcessionaire.count({
      where: { concessionaireId: id },
    });
    if (venueCount > 0) {
      throw new ApiError(400, `Cannot delete concessionaire with ${venueCount} associated venues`);
    }

    return prisma.concessionaire.delete({ where: { id } });
  },

  // Get venues for concessionaire
  async getVenues(concessionaireId: string) {
    const concessionaire = await prisma.concessionaire.findUnique({
      where: { id: concessionaireId },
    });
    if (!concessionaire) {
      throw new ApiError(404, 'Concessionaire not found');
    }

    const venueRelations = await prisma.venueConcessionaire.findMany({
      where: { concessionaireId },
      include: {
        venue: true,
      },
    });

    return venueRelations.map((r) => r.venue);
  },

  // Get contacts for concessionaire
  async getContacts(concessionaireId: string) {
    const concessionaire = await prisma.concessionaire.findUnique({
      where: { id: concessionaireId },
    });
    if (!concessionaire) {
      throw new ApiError(404, 'Concessionaire not found');
    }

    return prisma.contact.findMany({
      where: { concessionaireId },
      orderBy: { name: 'asc' },
    });
  },
};
