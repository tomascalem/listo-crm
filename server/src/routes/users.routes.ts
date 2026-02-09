import { Router, type Router as RouterType } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
} from '../schemas/user.schema.js';

const router: RouterType = Router();

// All user routes require authentication
router.use(authenticate);

// GET /users - List all users (for assignment dropdowns)
router.get('/', usersController.list);

// GET /users/me/preferences - Get current user preferences
router.get('/me/preferences', usersController.getPreferences);

// PUT /users/me/preferences - Update current user preferences
router.put(
  '/me/preferences',
  validateBody(updatePreferencesSchema),
  usersController.updatePreferences
);

// PUT /users/me - Update current user profile
router.put('/me', validateBody(updateProfileSchema), usersController.updateProfile);

// PUT /users/me/password - Change password
router.put(
  '/me/password',
  validateBody(changePasswordSchema),
  usersController.changePassword
);

// POST /users/me/avatar - Upload avatar
router.post('/me/avatar', usersController.uploadAvatar);

// DELETE /users/me/avatar - Remove avatar
router.delete('/me/avatar', usersController.removeAvatar);

// GET /users/:id - Get user by ID
router.get('/:id', usersController.getById);

export default router;
