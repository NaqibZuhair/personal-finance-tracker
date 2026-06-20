import { Router } from 'express';
import {
  createAccount,
  deleteAccount,
  getAccountBalances,
  getAccounts,
  updateAccount,
} from '../controllers/account.controller';

const router = Router();

router.get('/', getAccounts);
router.get('/balances', getAccountBalances);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;