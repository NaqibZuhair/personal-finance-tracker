import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from '../controllers/transaction.controller';
import { exportTransactions } from '../controllers/transaction.export.controller';
import { getUniqueTags } from '../controllers/transaction.tag.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/export', exportTransactions);
router.get('/meta/tags', getUniqueTags);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;