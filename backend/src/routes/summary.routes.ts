import { Router } from 'express';
import { getCategorySummary, getMonthlySummary, getRecentTransactions } from '../controllers/summary.controller';

const router = Router();

router.get('/monthly', getMonthlySummary);
router.get('/categories', getCategorySummary);
router.get('/recent', getRecentTransactions)

export default router;