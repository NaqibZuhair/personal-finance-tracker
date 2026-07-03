import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  waVerifySchema,
  waLoginSchema,
  deleteAccountOtpSchema,
  deleteAccountConfirmSchema,
} from '../validations/auth.validation';
import { AuthRequest } from '../middleware/auth.middleware';
import { normalizeWaPhone } from '../lib/phone';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL || 'http://localhost:3000';
const BOT_SECRET = process.env.VERCEL_SECRET_TOKEN || process.env.JWT_SECRET || 'fallback-secret-for-dev';

function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, waPhone } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const cleanedPhone = normalizeWaPhone(waPhone);
    if (cleanedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { waPhone: cleanedPhone },
      });
      if (existingPhone) {
        res.status(409).json({ message: 'WhatsApp number is already registered to another account' });
        return;
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        waPhone: cleanedPhone,
        accounts: {
          create: {
            name: 'Cash',
            type: 'cash',
            initialBalance: 0,
          },
        },
        categories: {
          createMany: {
            data: [
              { name: 'Food', type: 'expense' },
              { name: 'Transport', type: 'expense' },
              { name: 'Shopping', type: 'expense' },
              { name: 'Bills', type: 'expense' },
              { name: 'Entertainment', type: 'expense' },
              { name: 'Ciggarate', type: 'expense' },
              { name: 'Education', type: 'expense' },
              { name: 'Beauty', type: 'expense' },
              { name: 'Nabung', type: 'expense' },
              { name: 'Gift', type: 'expense' },
              { name: 'Health', type: 'expense' },
              { name: 'Parkir', type: 'expense' },
              { name: 'Other Expense', type: 'expense' },
              { name: 'From Parents', type: 'income' },
              { name: 'Salary', type: 'income' },
              { name: 'Freelance', type: 'income' },
              { name: 'Bonus', type: 'income' },
              { name: 'Allowance', type: 'income' },
              { name: 'Gift', type: 'income' },
              { name: 'Other Income', type: 'income' },
            ],
          },
        },
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        waPhone: user.waPhone,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    setAuthCookie(res, token);

    res.status(200).json({
      message: 'Logged in successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        waPhone: user.waPhone,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        waPhone: user.waPhone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, waPhone } = updateProfileSchema.parse(req.body);
    const cleanedPhone = normalizeWaPhone(waPhone);

    if (cleanedPhone) {
      const existing = await prisma.user.findFirst({
        where: {
          waPhone: cleanedPhone,
          NOT: { id: userId },
        },
      });
      if (existing) {
        res.status(409).json({ message: 'WhatsApp number is already linked to another account' });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(waPhone !== undefined && { waPhone: cleanedPhone }),
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        waPhone: updated.waPhone,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ message: 'Incorrect current password' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function requestDeleteAccountOtp(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { password } = deleteAccountOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid current password' });
      return;
    }

    if (!user.waPhone) {
      res.status(400).json({
        message: 'WhatsApp number required. Please link a WhatsApp number in Edit Profile before requesting account deletion.',
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    try {
      const waMsg = `⚠️ *KONFIRMASI PENGHAPUSAN AKUN - Personal Finance Tracker*\n\nHalo ${user.name},\nAnda meminta penghapusan akun permanen. Kode verifikasi Anda adalah:\n\n*${otp}*\n\nBerlaku 5 menit. Jika ini bukan Anda, SEGERA ganti password Anda!`;
      await fetch(`${WA_GATEWAY_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: user.waPhone,
          message: waMsg,
        }),
      });
    } catch (sendErr) {
      console.error('Failed to send Account Deletion WhatsApp OTP:', sendErr);
    }

    res.status(200).json({
      message: 'Verification OTP sent to your WhatsApp.',
      waPhone: user.waPhone.replace(/^(\d{4})\d+(\d{2})$/, '$1****$2'),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { password, otp } = deleteAccountConfirmSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid current password' });
      return;
    }

    const validOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      res.status(400).json({ message: 'Invalid or expired verification OTP code.' });
      return;
    }

    await prisma.passwordResetOtp.deleteMany({
      where: { userId: user.id },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie('token');
    res.status(200).json({ message: 'Account permanently deleted' });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { identifier } = forgotPasswordSchema.parse(req.body);
    const cleanedPhone = normalizeWaPhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          ...(cleanedPhone ? [{ waPhone: cleanedPhone }] : []),
        ],
      },
    });

    if (!user || !user.waPhone) {
      res.status(404).json({
        message: 'Akun tidak ditemukan atau belum menautkan Nomor WhatsApp untuk pemulihan OTP.',
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    // Try sending via WhatsApp Gateway
    try {
      const waMsg = `🔐 *Kode Reset Password - Personal Finance Tracker*\n\nHalo ${user.name},\nKode OTP kamu adalah: *${otp}*\n\nBerlaku selama 5 menit. Jangan berikan kode ini kepada siapapun!`;
      await fetch(`${WA_GATEWAY_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: user.waPhone,
          message: waMsg,
        }),
      });
    } catch (sendErr) {
      console.error('Failed to send WhatsApp OTP:', sendErr);
      // In development or if bot is offline, we still return success or log it
    }

    res.status(200).json({
      message: 'Kode OTP telah dikirimkan ke nomor WhatsApp terdaftar Anda.',
      waPhone: user.waPhone.replace(/^(\d{4})\d+(\d{2})$/, '$1****$2'),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { otp, newPassword } = resetPasswordSchema.parse(req.body);

    const resetRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        otp,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!resetRecord) {
      res.status(400).json({ message: 'Kode OTP tidak valid atau sudah kedaluwarsa.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    // Clean up all reset OTPs for this user
    await prisma.passwordResetOtp.deleteMany({
      where: { userId: resetRecord.userId },
    });

    res.status(200).json({ message: 'Password berhasil diubah. Silakan login kembali.' });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ==========================================
// BOT-READY ENDPOINTS (For Future Multi-User Bot)
// ==========================================

function verifyBotSecret(req: Request): boolean {
  const secretHeader = req.headers['x-bot-secret'] || req.headers['authorization'];
  if (!secretHeader) return false;
  return secretHeader === BOT_SECRET || secretHeader === `Bearer ${BOT_SECRET}`;
}

export async function waVerify(req: Request, res: Response) {
  try {
    if (!verifyBotSecret(req)) {
      res.status(401).json({ message: 'Unauthorized Bot Gateway' });
      return;
    }

    const { waPhone } = waVerifySchema.parse(req.body);
    const cleanedPhone = normalizeWaPhone(waPhone);

    if (!cleanedPhone) {
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { waPhone: cleanedPhone },
    });

    if (!user) {
      res.status(404).json({ message: 'WhatsApp number not linked to any account' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        waPhone: user.waPhone,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function waLogin(req: Request, res: Response) {
  try {
    if (!verifyBotSecret(req)) {
      res.status(401).json({ message: 'Unauthorized Bot Gateway' });
      return;
    }

    const { email, password, waPhone } = waLoginSchema.parse(req.body);
    const cleanedPhone = normalizeWaPhone(waPhone);

    if (!cleanedPhone) {
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: 'Email atau password salah.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email atau password salah.' });
      return;
    }

    // Check if phone already linked to someone else
    const existingPhone = await prisma.user.findFirst({
      where: {
        waPhone: cleanedPhone,
        NOT: { id: user.id },
      },
    });

    if (existingPhone) {
      res.status(409).json({ message: 'Nomor WhatsApp ini sudah terhubung ke akun lain.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { waPhone: cleanedPhone },
    });

    const token = jwt.sign({ userId: updatedUser.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        waPhone: updatedUser.waPhone,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
