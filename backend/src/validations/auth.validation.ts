import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  waPhone: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  waPhone: z.string().optional().nullable(),
  aiMemory: z.string().max(1000, 'AI Memory cannot exceed 1000 characters').optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or WhatsApp number is required'),
});

export const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const waVerifySchema = z.object({
  waPhone: z.string().min(5, 'WhatsApp phone number is required'),
});

export const waLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  waPhone: z.string().min(5, 'WhatsApp phone number is required'),
});

export const deleteAccountOtpSchema = z.object({
  password: z.string().min(1, 'Current password is required'),
});

export const deleteAccountConfirmSchema = z.object({
  password: z.string().min(1, 'Current password is required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});
