import * as z from 'zod';

export const routineItemSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Transfer amount must be greater than 0'),
  description: z.string().trim().max(200).optional(),
  accountId: z.string().uuid('Invalid source account id'),
  toAccountId: z.string().uuid('Invalid destination account id'),
});

export const createRoutineSchema = z.object({
  name: z.string().trim().min(1, 'Routine name is required').max(100),
  description: z.string().trim().max(255).optional(),
  items: z.array(routineItemSchema).min(1, 'At least one transfer item is required'),
});

export const updateRoutineSchema = z.object({
  name: z.string().trim().min(1, 'Routine name is required').max(100),
  description: z.string().trim().max(255).optional(),
  items: z.array(routineItemSchema).min(1, 'At least one transfer item is required'),
});

export const routineIdParamSchema = z.object({
  id: z.string().uuid('Invalid routine id'),
});
