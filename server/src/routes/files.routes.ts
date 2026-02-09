import { Router, type Router as RouterType } from 'express';
import { filesController } from '../controllers/files.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { getUploadUrlSchema, createFileSchema, updateFileSchema } from '../schemas/file.schema.js';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', filesController.listByEntity);
router.get('/:id', filesController.getById);
router.post('/upload-url', validateBody(getUploadUrlSchema), filesController.getUploadUrl);
router.post('/', validateBody(createFileSchema), filesController.create);
router.put('/:id', validateBody(updateFileSchema), filesController.update);
router.delete('/:id', filesController.delete);
router.get('/:id/download', filesController.getDownloadUrl);

export default router;
