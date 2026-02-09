import { Router, type Router as RouterType } from 'express';
import { apiKeyController } from '../controllers/api-key.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

// All routes require authentication
router.use(authenticate);

// List all API keys
router.get('/', apiKeyController.listKeys);

// Create a new API key
router.post('/', apiKeyController.createKey);

// Revoke an API key
router.delete('/:id', apiKeyController.revokeKey);

// Permanently delete an API key
router.delete('/:id/permanent', apiKeyController.deleteKey);

export default router;
