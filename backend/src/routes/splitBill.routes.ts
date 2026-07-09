import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  handleCreateSplitBill,
  handleGetSplitBills,
  handleGetDebts,
  handleMarkDebtPaid,
  handleDeleteDebt,
  handleDeleteSplitBill,
} from '../controllers/splitBill.controller';

const router = Router();

router.use(requireAuth);

// Split bills endpoints
router.post('/split-bills', handleCreateSplitBill);
router.get('/split-bills', handleGetSplitBills);
router.delete('/split-bills/:id', handleDeleteSplitBill);

// Debts endpoints
router.get('/debts', handleGetDebts);
router.patch('/debts/:id/pay', handleMarkDebtPaid);
router.delete('/debts/:id', handleDeleteDebt);

export default router;
