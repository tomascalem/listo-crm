import { Router, type Router as RouterType } from 'express';
import { concessionairesController } from '../controllers/concessionaires.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createConcessionaireSchema,
  updateConcessionaireSchema,
} from '../schemas/concessionaire.schema.js';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', concessionairesController.list);
router.get('/:id', concessionairesController.getById);
router.post('/', validateBody(createConcessionaireSchema), concessionairesController.create);
router.put('/:id', validateBody(updateConcessionaireSchema), concessionairesController.update);
router.delete('/:id', concessionairesController.delete);
router.get('/:id/venues', concessionairesController.getVenues);
router.get('/:id/contacts', concessionairesController.getContacts);

export default router;
