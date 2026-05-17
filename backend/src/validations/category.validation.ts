import * as z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense']),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense']),
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid category id'),
});