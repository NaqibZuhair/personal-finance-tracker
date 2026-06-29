import { Router } from 'express';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
} from '../controllers/recurring.controller';

const router = Router();

router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);

export default router;
