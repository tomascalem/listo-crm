import { Router, type Router as RouterType } from 'express';
import { importExportController } from '../controllers/import-export.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

// Templates
router.get('/templates/:type', importExportController.getTemplate);

// Import
router.post('/import/:type', importExportController.startImport);
router.get('/import/:jobId', importExportController.getImportStatus);
router.get('/import/:jobId/errors', importExportController.getImportErrors);

// Export
router.get('/export/:type', importExportController.exportEntities);

export default router;
