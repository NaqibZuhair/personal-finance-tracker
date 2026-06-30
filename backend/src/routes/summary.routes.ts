import { Router } from 'express';
import {
  getCategorySummary,
  getMonthlySummary,
  getRecentTransactions,
  getHistoricalSummary,
} from '../controllers/summary.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/monthly', getMonthlySummary);
router.get('/categories', getCategorySummary);
router.get('/recent', getRecentTransactions);
router.get('/historical', getHistoricalSummary);

export default router;