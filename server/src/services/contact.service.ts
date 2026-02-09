import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import type { CreateContactInput, UpdateContactInput, BulkDeleteContactsInput } from '../schemas/contact.schema.js';

// Generate initials from name
function generateAvatar(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const contactService = {
  // Get all contacts with filters and pagination
  async findAll(query: {
    search?: string;
    venueId?: string;
    operatorId?: string;
    concessionaireId?: string;
    isPrimary?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { role: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.venueId) {
      where.venues = { some: { venueId: query.venueId } };
    }

    if (query.operatorId) {
      where.operatorId = query.operatorId;
    }

    if (query.concessionaireId) {
      where.concessionaireId = query.concessionaireId;
    }

    if (query.isPrimary === 'true') {
      where.isPrimary = true;
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
        include: {
          operator: { select: { id: true, name: true } },
          concessionaire: { select: { id: true, name: true } },
          venues: {
            include: { venue: { select: { id: true, name: true } } },
          },
          _count: { select: { interactions: true } },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    const items = contacts.map((c) => ({
      ...c,
      venues: c.venues.map((cv) => cv.venue),
      interactionCount: c._count.interactions,
      _count: undefined,
    }));

    return paginatedResponse(items, total, page, limit);
  },

  // Get contact by ID
  async findById(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        operator: true,
        concessionaire: true,
        venues: {
          include: { venue: true },
        },
        _count: { select: { interactions: true, todos: true } },
      },
    });

    if (!contact) {
      throw new ApiError(404, 'Contact not found');
    }

    return {
      ...contact,
      venues: contact.venues.map((cv) => cv.venue),
      interactionCount: contact._count.interactions,
      todoCount: contact._count.todos,
      _count: undefined,
    };
  },

  // Create contact
  async create(input: CreateContactInput) {
    const { venueIds, ...contactData } = input;

    // Generate avatar if not provided
    if (!contactData.avatar) {
      contactData.avatar = generateAvatar(input.name);
    }

    return prisma.contact.create({
      data: {
        ...contactData,
        venues: venueIds?.length
          ? { create: venueIds.map((id) => ({ venueId: id })) }
          : undefined,
      },
      include: {
        operator: true,
        concessionaire: true,
        venues: { include: { venue: true } },
      },
    });
  },

  // Update contact
  async update(id: string, input: UpdateContactInput) {
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Contact not found');
    }

    const { venueIds, ...contactData } = input;

    // Update avatar if name changed
    if (contactData.name && !contactData.avatar) {
      contactData.avatar = generateAvatar(contactData.name);
    }

    return prisma.$transaction(async (tx) => {
      // Update venue associations if provided
      if (venueIds !== undefined) {
        await tx.contactVenue.deleteMany({ where: { contactId: id } });
        if (venueIds.length > 0) {
          await tx.contactVenue.createMany({
            data: venueIds.map((vId) => ({ contactId: id, venueId: vId })),
          });
        }
      }

      return tx.contact.update({
        where: { id },
        data: contactData,
        include: {
          operator: true,
          concessionaire: true,
          venues: { include: { venue: true } },
        },
      });
    });
  },

  // Delete contact
  async delete(id: string) {
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Contact not found');
    }

    return prisma.contact.delete({ where: { id } });
  },

  // Bulk delete contacts
  async bulkDelete(input: BulkDeleteContactsInput) {
    const result = await prisma.contact.deleteMany({
      where: { id: { in: input.ids } },
    });
    return { deleted: result.count };
  },

  // Link contact to venue
  async linkToVenue(contactId: string, venueId: string) {
    const [contact, venue] = await Promise.all([
      prisma.contact.findUnique({ where: { id: contactId } }),
      prisma.venue.findUnique({ where: { id: venueId } }),
    ]);

    if (!contact) throw new ApiError(404, 'Contact not found');
    if (!venue) throw new ApiError(404, 'Venue not found');

    // Check if already linked
    const existing = await prisma.contactVenue.findUnique({
      where: { contactId_venueId: { contactId, venueId } },
    });

    if (existing) {
      throw new ApiError(409, 'Contact is already linked to this venue');
    }

    await prisma.contactVenue.create({
      data: { contactId, venueId },
    });

    return { linked: true };
  },

  // Unlink contact from venue
  async unlinkFromVenue(contactId: string, venueId: string) {
    const existing = await prisma.contactVenue.findUnique({
      where: { contactId_venueId: { contactId, venueId } },
    });

    if (!existing) {
      throw new ApiError(404, 'Contact is not linked to this venue');
    }

    await prisma.contactVenue.delete({
      where: { contactId_venueId: { contactId, venueId } },
    });

    return { unlinked: true };
  },
};
