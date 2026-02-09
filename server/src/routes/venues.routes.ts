import { Router, type Router as RouterType } from 'express';
import { venuesController } from '../controllers/venues.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createVenueSchema,
  updateVenueSchema,
  updateVenueStageSchema,
  bulkUpdateVenuesSchema,
  bulkDeleteVenuesSchema,
} from '../schemas/venue.schema.js';

const router: RouterType = Router();

router.use(authenticate);

// Bulk operations (must be before /:id routes)
router.post('/bulk/update', validateBody(bulkUpdateVenuesSchema), venuesController.bulkUpdate);
router.post('/bulk/delete', validateBody(bulkDeleteVenuesSchema), venuesController.bulkDelete);

// CRUD routes
router.get('/', venuesController.list);
router.get('/:id', venuesController.getById);
router.post('/', validateBody(createVenueSchema), venuesController.create);
router.put('/:id', validateBody(updateVenueSchema), venuesController.update);
router.patch('/:id/stage', validateBody(updateVenueStageSchema), venuesController.updateStage);
router.delete('/:id', venuesController.delete);

// Related resources
router.get('/:id/contacts', venuesController.getContacts);
router.get('/:id/interactions', venuesController.getInteractions);
router.get('/:id/todos', venuesController.getTodos);
router.get('/:id/files', venuesController.getFiles);
router.get('/:id/contracts', venuesController.getContracts);

export default router;
