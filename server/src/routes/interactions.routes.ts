import { Router, type Router as RouterType } from 'express';
import { interactionsController } from '../controllers/interactions.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createInteractionSchema, updateInteractionSchema } from '../schemas/interaction.schema.js';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', interactionsController.list);
router.get('/:id', interactionsController.getById);
router.post('/', validateBody(createInteractionSchema), interactionsController.create);
router.put('/:id', validateBody(updateInteractionSchema), interactionsController.update);
router.delete('/:id', interactionsController.delete);

export default router;
