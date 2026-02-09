import { Router, type Router as RouterType } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../schemas/auth.schema.js';

const router: RouterType = Router();

// Apply stricter rate limiting to auth routes
router.use(authRateLimiter);

// POST /auth/register - Register a new user
router.post('/register', validateBody(registerSchema), authController.register);

// POST /auth/login - Login user
router.post('/login', validateBody(loginSchema), authController.login);

// POST /auth/refresh - Refresh access token
router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);

// POST /auth/logout - Logout user
router.post('/logout', validateBody(refreshTokenSchema), authController.logout);

// GET /auth/me - Get current user (protected)
router.get('/me', authenticate, authController.me);

export default router;
