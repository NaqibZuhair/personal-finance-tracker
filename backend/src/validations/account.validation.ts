import * as z from 'zod';

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required').max(100),
  type: z.enum(['bank', 'ewallet', 'cash']),
  initialBalance: z.coerce
    .number()
    .min(0, 'Initial balance cannot be negative')
    .default(0),
  isActive: z.boolean().optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required').max(100),
  type: z.enum(['bank', 'ewallet', 'cash']),
  initialBalance: z.coerce
    .number()
    .min(0, 'Initial balance cannot be negative'),
  isActive: z.boolean(),
});

export const accountIdParamSchema = z.object({
  id: z.string().uuid('Invalid account id'),
});