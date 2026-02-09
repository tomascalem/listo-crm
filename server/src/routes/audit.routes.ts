import { Router, type Router as RouterType } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', auditController.list);
router.get('/entity/:type/:id', auditController.getByEntity);
router.get('/user/:id', auditController.getByUser);

export default router;
