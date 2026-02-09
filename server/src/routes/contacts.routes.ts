import { Router, type Router as RouterType } from 'express';
import { contactsController } from '../controllers/contacts.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createContactSchema, updateContactSchema, bulkDeleteContactsSchema } from '../schemas/contact.schema.js';

const router: RouterType = Router();

router.use(authenticate);

// Bulk operations
router.post('/bulk/delete', validateBody(bulkDeleteContactsSchema), contactsController.bulkDelete);

// CRUD routes
router.get('/', contactsController.list);
router.get('/:id', contactsController.getById);
router.post('/', validateBody(createContactSchema), contactsController.create);
router.put('/:id', validateBody(updateContactSchema), contactsController.update);
router.delete('/:id', contactsController.delete);

// Venue linking
router.post('/:id/venues/:venueId', contactsController.linkToVenue);
router.delete('/:id/venues/:venueId', contactsController.unlinkFromVenue);

export default router;
