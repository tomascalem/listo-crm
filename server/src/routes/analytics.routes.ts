import { Router, type Router as RouterType } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

// Pipeline metrics
router.get('/pipeline', analyticsController.getPipelineMetrics);
router.get('/pipeline/trends', analyticsController.getPipelineTrends);

// Revenue metrics
router.get('/revenue', analyticsController.getRevenueMetrics);
router.get('/revenue/forecast', analyticsController.getRevenueForecast);

// Activity metrics
router.get('/activity', analyticsController.getActivityMetrics);
router.get('/activity/by-user', analyticsController.getActivityByUser);

// Performance metrics
router.get('/performance', analyticsController.getPerformanceMetrics);

// Venue distributions
router.get('/venues/by-type', analyticsController.getVenuesByType);
router.get('/venues/by-status', analyticsController.getVenuesByStatus);

export default router;
