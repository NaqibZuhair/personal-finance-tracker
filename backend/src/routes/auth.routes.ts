import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  requestDeleteAccountOtp,
  forgotPassword,
  resetPassword,
  waVerify,
  waLogin,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);
router.post('/account/delete-otp', requireAuth, authLimiter, requestDeleteAccountOtp);
router.delete('/account', requireAuth, deleteAccount);

router.post('/wa-verify', authLimiter, waVerify);
router.post('/wa-login', authLimiter, waLogin);

export default router;
