import { Request, Response, NextFunction } from 'express';
import { importExportService } from '../services/import-export.service.js';
import { successResponse, ApiError } from '../utils/apiResponse.js';

export const importExportController = {
  // Download CSV template
  async getTemplate(req: Request<{ type: string }>, res: Response, next: NextFunction) {
    try {
      const type = req.params.type as 'venues' | 'contacts';
      if (!['venues', 'contacts'].includes(type)) {
        throw new ApiError(400, 'Invalid template type. Use "venues" or "contacts"');
      }

      const csv = importExportService.getTemplate(type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-template.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  // Start import job
  async startImport(req: Request<{ type: string }>, res: Response, next: NextFunction) {
    try {
      const type = req.params.type as 'venues' | 'contacts';
      if (!['venues', 'contacts'].includes(type)) {
        throw new ApiError(400, 'Invalid import type. Use "venues" or "contacts"');
      }

      const { csvContent, fileName } = req.body;
      if (!csvContent) {
        throw new ApiError(400, 'CSV content is required');
      }

      // Count rows (excluding header)
      const lines = csvContent.trim().split('\n');
      const totalRows = lines.length - 1;

      if (totalRows < 1) {
        throw new ApiError(400, 'CSV file must contain at least one data row');
      }

      // Create import job
      const job = await importExportService.createImportJob(
        req.user!.id,
        type,
        fileName || `${type}-import.csv`,
        totalRows
      );

      // Process import in background (don't await)
      if (type === 'venues') {
        importExportService.processVenueImport(job.id, csvContent, req.user!.id)
          .catch(err => console.error('Venue import failed:', err));
      } else {
        importExportService.processContactImport(job.id, csvContent, req.user!.id)
          .catch(err => console.error('Contact import failed:', err));
      }

      res.status(202).json(successResponse({
        jobId: job.id,
        status: 'pending',
        totalRows,
        message: 'Import started. Poll the job status endpoint for progress.',
      }));
    } catch (error) {
      next(error);
    }
  },

  // Get import job status
  async getImportStatus(req: Request<{ jobId: string }>, res: Response, next: NextFunction) {
    try {
      const job = await importExportService.getImportJob(req.params.jobId);
      res.json(successResponse(job));
    } catch (error) {
      next(error);
    }
  },

  // Get import job errors
  async getImportErrors(req: Request<{ jobId: string }>, res: Response, next: NextFunction) {
    try {
      const job = await importExportService.getImportJob(req.params.jobId);
      res.json(successResponse({
        jobId: job.id,
        errors: job.errors || [],
        errorCount: job.errorRows,
      }));
    } catch (error) {
      next(error);
    }
  },

  // Export entities to CSV
  async exportEntities(req: Request<{ type: string }>, res: Response, next: NextFunction) {
    try {
      const type = req.params.type as 'venues' | 'contacts';
      if (!['venues', 'contacts'].includes(type)) {
        throw new ApiError(400, 'Invalid export type. Use "venues" or "contacts"');
      }

      let csv: string;
      if (type === 'venues') {
        csv = await importExportService.exportVenues(req.query as Record<string, string>);
      } else {
        csv = await importExportService.exportContacts(req.query as Record<string, string>);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },
};
