import { z } from 'zod';

export const upsertBudgetSchema = z.object({
  amount: z.number().positive('Budget amount must be positive'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const getBudgetsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});
