import { Router, type Router as RouterType } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

// Schedule
router.get('/schedule', dashboardController.getSchedule);

// Todos
router.get('/todos', dashboardController.getTodos);

// Recommended Actions
router.get('/recommended-actions', dashboardController.getRecommendedActions);
router.patch('/recommended-actions/:id/dismiss', dashboardController.dismissAction);
router.patch('/recommended-actions/:id/complete', dashboardController.completeAction);

// Business Insights
router.get('/insights', dashboardController.getInsights);
router.patch('/insights/:id/read', dashboardController.markInsightRead);

// Quick Stats
router.get('/stats', dashboardController.getStats);

export default router;
