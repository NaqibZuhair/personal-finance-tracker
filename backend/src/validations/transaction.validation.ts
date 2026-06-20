import * as z from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category id'),
  accountId: z.string().uuid('Invalid account id'),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category id'),
  accountId: z.string().uuid('Invalid account id'),
});

export const transactionIdParamSchema = z.object({
  id: z.string().uuid('Invalid transaction id'),
});

export const transactionQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid('Invalid category id').optional(),
  accountId: z.string().uuid('Invalid account id').optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must use YYYY-MM format')
    .optional(),
  search: z.string().optional(),
});