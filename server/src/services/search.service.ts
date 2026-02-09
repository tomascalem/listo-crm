import { prisma } from '../config/database.js';
import { parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import { VenueStage, VenueStatus, VenueType } from '@prisma/client';

export const searchService = {
  // Global search across all entities
  async globalSearch(query: {
    q: string;
    type?: 'venue' | 'contact' | 'operator' | 'concessionaire';
    limit?: string;
    offset?: string;
  }) {
    const searchTerm = query.q.trim();
    if (!searchTerm) {
      return { results: [], total: 0 };
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    const searchPattern = `%${searchTerm}%`;

    // If specific type is requested, search only that type
    if (query.type) {
      switch (query.type) {
        case 'venue':
          return this.searchVenues({ q: searchTerm, limit: limit.toString() });
        case 'contact':
          return this.searchContacts({ q: searchTerm, limit: limit.toString() });
        case 'operator':
          return this.searchOperators({ q: searchTerm, limit: limit.toString() });
        case 'concessionaire':
          return this.searchConcessionaires({ q: searchTerm, limit: limit.toString() });
      }
    }

    // Search all entity types
    const [venues, contacts, operators, concessionaires] = await Promise.all([
      prisma.venue.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, city: true, state: true, type: true },
      }),
      prisma.contact.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { role: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.operator.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { headquarters: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 3,
        select: { id: true, name: true, headquarters: true },
      }),
      prisma.concessionaire.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { headquarters: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 3,
        select: { id: true, name: true, headquarters: true },
      }),
    ]);

    const results = [
      ...venues.map(v => ({ type: 'venue' as const, data: v })),
      ...contacts.map(c => ({ type: 'contact' as const, data: c })),
      ...operators.map(o => ({ type: 'operator' as const, data: o })),
      ...concessionaires.map(c => ({ type: 'concessionaire' as const, data: c })),
    ];

    return {
      results: results.slice(offset, offset + limit),
      total: results.length,
    };
  },

  // Advanced venue search
  async searchVenues(query: {
    q?: string;
    status?: string;
    stage?: string;
    type?: string;
    operatorId?: string;
    assignedTo?: string;
    city?: string;
    state?: string;
    minDealValue?: string;
    maxDealValue?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { address: { contains: query.q, mode: 'insensitive' } },
        { city: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.status) where.status = query.status as VenueStatus;
    if (query.stage) where.stage = query.stage as VenueStage;
    if (query.type) where.type = query.type as VenueType;
    if (query.operatorId) where.operatorId = query.operatorId;
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.state) where.state = { contains: query.state, mode: 'insensitive' };

    if (query.assignedTo) {
      where.assignedUsers = { some: { userId: query.assignedTo } };
    }

    if (query.minDealValue || query.maxDealValue) {
      where.dealValue = {};
      if (query.minDealValue) {
        (where.dealValue as Record<string, unknown>).gte = parseInt(query.minDealValue, 10);
      }
      if (query.maxDealValue) {
        (where.dealValue as Record<string, unknown>).lte = parseInt(query.maxDealValue, 10);
      }
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          operator: { select: { id: true, name: true } },
          assignedUsers: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      }),
      prisma.venue.count({ where }),
    ]);

    return paginatedResponse(venues, total, page, limit);
  },

  // Advanced contact search
  async searchContacts(query: {
    q?: string;
    venueId?: string;
    operatorId?: string;
    concessionaireId?: string;
    isPrimary?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { role: { contains: query.q, mode: 'insensitive' } },
        { phone: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.venueId) {
      where.venues = { some: { venueId: query.venueId } };
    }
    if (query.operatorId) where.operatorId = query.operatorId;
    if (query.concessionaireId) where.concessionaireId = query.concessionaireId;
    if (query.isPrimary !== undefined) where.isPrimary = query.isPrimary === 'true';

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          venues: {
            include: { venue: { select: { id: true, name: true } } },
          },
          operator: { select: { id: true, name: true } },
          concessionaire: { select: { id: true, name: true } },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    return paginatedResponse(contacts, total, page, limit);
  },

  // Search operators
  async searchOperators(query: {
    q?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { headquarters: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [operators, total] = await Promise.all([
      prisma.operator.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { venues: true, contacts: true } },
        },
      }),
      prisma.operator.count({ where }),
    ]);

    return paginatedResponse(operators, total, page, limit);
  },

  // Search concessionaires
  async searchConcessionaires(query: {
    q?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = {};

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { headquarters: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [concessionaires, total] = await Promise.all([
      prisma.concessionaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { venues: true, contacts: true } },
        },
      }),
      prisma.concessionaire.count({ where }),
    ]);

    return paginatedResponse(concessionaires, total, page, limit);
  },
};
