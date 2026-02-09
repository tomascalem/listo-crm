import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiResponse.js';
import { ImportStatus, VenueType, VenueStage, VenueStatus } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

interface ImportJobUpdate {
  status?: ImportStatus;
  processedRows?: number;
  successRows?: number;
  errorRows?: number;
  errors?: Prisma.InputJsonValue;
  completedAt?: Date;
}

export const importExportService = {
  // Get CSV template for entity type
  getTemplate(type: 'venues' | 'contacts') {
    const templates = {
      venues: 'name,address,city,state,type,capacity,stage,status,dealValue,operatorName,notes\n"Example Stadium","123 Main St","New York","NY","stadium",50000,"lead","prospect",100000,"Operator Name","Notes here"',
      contacts: 'name,email,phone,role,isPrimary,venueName,linkedIn\n"John Doe","john@example.com","+1234567890","VP of Operations",true,"Example Stadium","https://linkedin.com/in/johndoe"',
    };

    return templates[type];
  },

  // Create import job
  async createImportJob(userId: string, type: string, fileName: string, totalRows: number) {
    return prisma.importJob.create({
      data: {
        userId,
        type,
        status: 'pending',
        fileName,
        totalRows,
        processedRows: 0,
        successRows: 0,
        errorRows: 0,
      },
    });
  },

  // Get import job by ID
  async getImportJob(jobId: string) {
    const job = await prisma.importJob.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, 'Import job not found');
    }
    return job;
  },

  // Update import job
  async updateImportJob(jobId: string, data: ImportJobUpdate) {
    return prisma.importJob.update({
      where: { id: jobId },
      data,
    });
  },

  // Process venue import
  async processVenueImport(jobId: string, csvContent: string, userId: string) {
    const job = await this.getImportJob(jobId);

    try {
      await this.updateImportJob(jobId, { status: 'processing' });

      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const errors: { row: number; field: string; error: string }[] = [];
      let successCount = 0;

      // Get all operators for name lookup
      const operators = await prisma.operator.findMany({ select: { id: true, name: true } });
      const operatorMap = new Map(operators.map(o => [o.name.toLowerCase(), o.id]));

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNum = i + 2; // +2 for 1-indexed and header row

        try {
          // Validate required fields
          if (!row.name) {
            errors.push({ row: rowNum, field: 'name', error: 'Name is required' });
            continue;
          }
          if (!row.address) {
            errors.push({ row: rowNum, field: 'address', error: 'Address is required' });
            continue;
          }
          if (!row.city) {
            errors.push({ row: rowNum, field: 'city', error: 'City is required' });
            continue;
          }
          if (!row.state) {
            errors.push({ row: rowNum, field: 'state', error: 'State is required' });
            continue;
          }

          // Validate type
          const validTypes = ['stadium', 'arena', 'amphitheater', 'theater', 'convention_center', 'other'];
          const type = row.type?.toLowerCase().replace('-', '_') || 'other';
          if (!validTypes.includes(type)) {
            errors.push({ row: rowNum, field: 'type', error: `Invalid venue type: ${row.type}` });
            continue;
          }

          // Validate stage
          const validStages = ['lead', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
          const stage = row.stage?.toLowerCase().replace('-', '_') || 'lead';
          if (!validStages.includes(stage)) {
            errors.push({ row: rowNum, field: 'stage', error: `Invalid stage: ${row.stage}` });
            continue;
          }

          // Validate status
          const validStatuses = ['client', 'prospect', 'churned', 'negotiating'];
          const status = row.status?.toLowerCase() || 'prospect';
          if (!validStatuses.includes(status)) {
            errors.push({ row: rowNum, field: 'status', error: `Invalid status: ${row.status}` });
            continue;
          }

          // Find operator
          const operatorId = row.operatorName
            ? operatorMap.get(row.operatorName.toLowerCase())
            : null;

          if (row.operatorName && !operatorId) {
            errors.push({ row: rowNum, field: 'operatorName', error: `Operator not found: ${row.operatorName}` });
            continue;
          }

          // Create venue
          await prisma.venue.create({
            data: {
              name: row.name,
              address: row.address,
              city: row.city,
              state: row.state,
              type: type as VenueType,
              capacity: row.capacity ? parseInt(row.capacity, 10) : null,
              stage: stage as VenueStage,
              status: status as VenueStatus,
              dealValue: row.dealValue ? parseFloat(row.dealValue) : null,
              operatorId: operatorId!,
              notes: row.notes || null,
            },
          });

          successCount++;
        } catch (error) {
          errors.push({ row: rowNum, field: 'general', error: (error as Error).message });
        }

        // Update progress every 10 rows
        if (i % 10 === 0) {
          await this.updateImportJob(jobId, {
            processedRows: i + 1,
            successRows: successCount,
            errorRows: errors.length,
          });
        }
      }

      // Final update
      await this.updateImportJob(jobId, {
        status: errors.length > 0 && successCount === 0 ? 'failed' : 'completed',
        processedRows: records.length,
        successRows: successCount,
        errorRows: errors.length,
        errors: errors as Prisma.InputJsonValue,
        completedAt: new Date(),
      });

      return { processed: records.length, success: successCount, errors: errors.length };
    } catch (error) {
      await this.updateImportJob(jobId, {
        status: 'failed',
        errors: [{ error: (error as Error).message }] as Prisma.InputJsonValue,
        completedAt: new Date(),
      });
      throw error;
    }
  },

  // Process contact import
  async processContactImport(jobId: string, csvContent: string, userId: string) {
    const job = await this.getImportJob(jobId);

    try {
      await this.updateImportJob(jobId, { status: 'processing' });

      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const errors: { row: number; field: string; error: string }[] = [];
      let successCount = 0;

      // Get all venues for name lookup
      const venues = await prisma.venue.findMany({ select: { id: true, name: true } });
      const venueMap = new Map(venues.map(v => [v.name.toLowerCase(), v.id]));

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNum = i + 2;

        try {
          // Validate required fields
          if (!row.name) {
            errors.push({ row: rowNum, field: 'name', error: 'Name is required' });
            continue;
          }
          if (!row.email) {
            errors.push({ row: rowNum, field: 'email', error: 'Email is required' });
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row.email)) {
            errors.push({ row: rowNum, field: 'email', error: 'Invalid email format' });
            continue;
          }

          // Find venue if specified
          const venueId = row.venueName
            ? venueMap.get(row.venueName.toLowerCase())
            : null;

          if (row.venueName && !venueId) {
            errors.push({ row: rowNum, field: 'venueName', error: `Venue not found: ${row.venueName}` });
            continue;
          }

          // Create contact
          const contact = await prisma.contact.create({
            data: {
              name: row.name,
              email: row.email,
              phone: row.phone || null,
              role: row.role || null,
              isPrimary: row.isPrimary === 'true',
              linkedIn: row.linkedIn || null,
              avatar: row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            },
          });

          // Link to venue if specified
          if (venueId) {
            await prisma.contactVenue.create({
              data: { contactId: contact.id, venueId },
            });
          }

          successCount++;
        } catch (error) {
          errors.push({ row: rowNum, field: 'general', error: (error as Error).message });
        }

        if (i % 10 === 0) {
          await this.updateImportJob(jobId, {
            processedRows: i + 1,
            successRows: successCount,
            errorRows: errors.length,
          });
        }
      }

      await this.updateImportJob(jobId, {
        status: errors.length > 0 && successCount === 0 ? 'failed' : 'completed',
        processedRows: records.length,
        successRows: successCount,
        errorRows: errors.length,
        errors: errors as Prisma.InputJsonValue,
        completedAt: new Date(),
      });

      return { processed: records.length, success: successCount, errors: errors.length };
    } catch (error) {
      await this.updateImportJob(jobId, {
        status: 'failed',
        errors: [{ error: (error as Error).message }] as Prisma.InputJsonValue,
        completedAt: new Date(),
      });
      throw error;
    }
  },

  // Export venues to CSV
  async exportVenues(query: { status?: string; stage?: string; operatorId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.stage) where.stage = query.stage;
    if (query.operatorId) where.operatorId = query.operatorId;

    const venues = await prisma.venue.findMany({
      where,
      include: { operator: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });

    const records = venues.map(v => ({
      name: v.name,
      address: v.address,
      city: v.city,
      state: v.state,
      type: v.type,
      capacity: v.capacity || '',
      stage: v.stage,
      status: v.status,
      dealValue: v.dealValue || '',
      operatorName: v.operator?.name || '',
      notes: v.notes || '',
      createdAt: v.createdAt.toISOString(),
    }));

    return stringify(records, { header: true });
  },

  // Export contacts to CSV
  async exportContacts(query: { venueId?: string; operatorId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.venueId) {
      where.venues = { some: { venueId: query.venueId } };
    }
    if (query.operatorId) {
      where.operatorId = query.operatorId;
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        venues: { include: { venue: { select: { name: true } } } },
      },
      orderBy: { name: 'asc' },
    });

    const records = contacts.map(c => ({
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      role: c.role || '',
      isPrimary: c.isPrimary,
      venueName: c.venues.map(v => v.venue.name).join('; '),
      linkedIn: c.linkedIn || '',
      createdAt: c.createdAt.toISOString(),
    }));

    return stringify(records, { header: true });
  },
};
