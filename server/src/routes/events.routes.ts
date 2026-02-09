import { Router, type Router as RouterType } from 'express';
import { eventsController } from '../controllers/events.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createEventSchema, updateEventSchema } from '../schemas/event.schema.js';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', eventsController.list);
router.get('/:id', eventsController.getById);
router.post('/', validateBody(createEventSchema), eventsController.create);
router.put('/:id', validateBody(updateEventSchema), eventsController.update);
router.delete('/:id', eventsController.delete);

export default router;
