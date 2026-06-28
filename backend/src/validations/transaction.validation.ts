import * as z from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category id').optional(),
  accountId: z.string().uuid('Invalid account id'),
  toAccountId: z.string().uuid('Invalid to-account id').optional(),
}).refine(data => {
  if ((data.type === 'income' || data.type === 'expense') && !data.categoryId) return false;
  return true;
}, { message: "Category is required for income and expense transactions", path: ["categoryId"] })
.refine(data => {
  if (data.type === 'transfer' && !data.toAccountId) return false;
  return true;
}, { message: "Destination account is required for transfers", path: ["toAccountId"] })
.refine(data => {
  if (data.type === 'transfer' && data.accountId === data.toAccountId) return false;
  return true;
}, { message: "Source and destination accounts must be different", path: ["toAccountId"] });

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category id').optional(),
  accountId: z.string().uuid('Invalid account id'),
  toAccountId: z.string().uuid('Invalid to-account id').optional(),
}).refine(data => {
  if ((data.type === 'income' || data.type === 'expense') && !data.categoryId) return false;
  return true;
}, { message: "Category is required for income and expense transactions", path: ["categoryId"] })
.refine(data => {
  if (data.type === 'transfer' && !data.toAccountId) return false;
  return true;
}, { message: "Destination account is required for transfers", path: ["toAccountId"] })
.refine(data => {
  if (data.type === 'transfer' && data.accountId === data.toAccountId) return false;
  return true;
}, { message: "Source and destination accounts must be different", path: ["toAccountId"] });

export const transactionIdParamSchema = z.object({
  id: z.string().uuid('Invalid transaction id'),
});

export const transactionQuerySchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  categoryId: z.string().uuid('Invalid category id').optional(),
  accountId: z.string().uuid('Invalid account id').optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must use YYYY-MM format')
    .optional(),
  search: z.string().optional(),
});