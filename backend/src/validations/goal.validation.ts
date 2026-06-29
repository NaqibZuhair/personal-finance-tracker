import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().datetime().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const goalIdParamSchema = z.object({
  id: z.string().uuid('Invalid Goal ID'),
});
