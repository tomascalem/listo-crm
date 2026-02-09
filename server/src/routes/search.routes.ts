import { Router, type Router as RouterType } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

// Global search
router.get('/', searchController.globalSearch);

// Entity-specific search
router.get('/venues', searchController.searchVenues);
router.get('/contacts', searchController.searchContacts);
router.get('/operators', searchController.searchOperators);
router.get('/concessionaires', searchController.searchConcessionaires);

export default router;
