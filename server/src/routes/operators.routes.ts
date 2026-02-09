import { Router, type Router as RouterType } from 'express';
import { operatorsController } from '../controllers/operators.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createOperatorSchema, updateOperatorSchema } from '../schemas/operator.schema.js';

const router: RouterType = Router();

// All operator routes require authentication
router.use(authenticate);

// GET /operators - List all operators
router.get('/', operatorsController.list);

// GET /operators/:id - Get operator by ID
router.get('/:id', operatorsController.getById);

// POST /operators - Create operator
router.post('/', validateBody(createOperatorSchema), operatorsController.create);

// PUT /operators/:id - Update operator
router.put('/:id', validateBody(updateOperatorSchema), operatorsController.update);

// DELETE /operators/:id - Delete operator
router.delete('/:id', operatorsController.delete);

// GET /operators/:id/venues - Get venues for operator
router.get('/:id/venues', operatorsController.getVenues);

// GET /operators/:id/contacts - Get contacts for operator
router.get('/:id/contacts', operatorsController.getContacts);

// GET /operators/:id/interactions - Get interactions for operator
router.get('/:id/interactions', operatorsController.getInteractions);

export default router;
