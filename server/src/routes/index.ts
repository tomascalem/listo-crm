import { Router, type Router as RouterType } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import operatorRoutes from './operators.routes.js';
import concessionaireRoutes from './concessionaires.routes.js';
import venueRoutes from './venues.routes.js';
import contactRoutes from './contacts.routes.js';
import interactionRoutes from './interactions.routes.js';
import todoRoutes from './todos.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import searchRoutes from './search.routes.js';
import eventsRoutes from './events.routes.js';
import notificationsRoutes from './notifications.routes.js';
import filesRoutes from './files.routes.js';
import auditRoutes from './audit.routes.js';
import importExportRoutes from './import-export.routes.js';
import googleRoutes from './google.routes.js';
import apiKeyRoutes from './api-key.routes.js';

const router: RouterType = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/operators', operatorRoutes);
router.use('/concessionaires', concessionaireRoutes);
router.use('/venues', venueRoutes);
router.use('/contacts', contactRoutes);
router.use('/interactions', interactionRoutes);
router.use('/todos', todoRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/search', searchRoutes);
router.use('/events', eventsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/files', filesRoutes);
router.use('/audit', auditRoutes);
router.use('/import-export', importExportRoutes);
router.use('/google', googleRoutes);
router.use('/api-keys', apiKeyRoutes);

// Routes to be added:
// router.use('/contracts', contractRoutes);

export default router;
