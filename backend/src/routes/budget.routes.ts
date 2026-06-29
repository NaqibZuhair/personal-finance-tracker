import { Router } from 'express';
import { getBudgets, upsertBudget } from '../controllers/budget.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getBudgets);
router.post('/', upsertBudget); // Note: we use POST for upsert in this design, or could use PUT

export default router;
