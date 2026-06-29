import { z } from 'zod';

const recurringBaseSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  nextRunDate: z.string().datetime(),
  categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  accountId: z.string().uuid('Invalid account ID'),
  toAccountId: z.string().uuid('Invalid destination account ID').optional().nullable(),
});

export const createRecurringSchema = recurringBaseSchema.refine(
  (data) => {
    if (data.type === 'transfer') {
      return !!data.toAccountId && data.accountId !== data.toAccountId;
    }
    return !!data.categoryId;
  },
  {
    message: 'Transfers require a valid destination account. Others require a category.',
    path: ['categoryId'],
  }
);

export const updateRecurringSchema = recurringBaseSchema.extend({
  isActive: z.boolean().optional(),
}).partial();

export const recurringIdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
