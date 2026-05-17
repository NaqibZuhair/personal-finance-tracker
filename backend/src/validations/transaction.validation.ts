import * as z from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category id'),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category id'),
});

export const transactionIdParamSchema = z.object({
  id: z.string().uuid('Invalid transaction id'),
});