import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  waVerify,
  waLogin,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected user routes
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);
router.delete('/account', requireAuth, deleteAccount);

// Bot-Ready Turnkey Routes (Protected by X-Bot-Secret header in controller)
router.post('/wa-verify', waVerify);
router.post('/wa-login', waLogin);

export default router;
