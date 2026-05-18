import * as z from 'zod';

export const monthlySummaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must use YYYY-MM format'),
});