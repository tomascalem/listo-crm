import { Router } from 'express';
import { googleController } from '../controllers/google.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// OAuth routes
router.get('/auth-url', authenticate, googleController.getAuthUrl);
router.get('/callback', googleController.handleCallback); // No auth - this is the OAuth redirect
router.post('/disconnect', authenticate, googleController.disconnect);
router.get('/status', authenticate, googleController.getConnectionStatus);

// Gmail Add-on routes
router.get('/gmail/thread-status', authenticate, googleController.getThreadStatus);
router.post('/gmail/import-thread', authenticate, googleController.importThread);
router.delete('/gmail/thread/:threadId', authenticate, googleController.removeThread);
router.get('/gmail/contacts/search', authenticate, googleController.searchContacts);

// Calendar routes
router.post('/calendar/sync', authenticate, googleController.syncCalendar);

export default router;
