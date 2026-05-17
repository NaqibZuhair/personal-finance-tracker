import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validations/category.validation';

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

function isRecordNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2025'
  );
}

function isForeignKeyConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2003'
  );
}

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        {
          type: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    res.status(200).json({
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch categories',
    });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    if (isUniqueConstraintError(error)) {
      res.status(409).json({
        message: 'Category already exists',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to create category',
    });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: validatedData,
    });

    res.status(200).json({
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    if (isUniqueConstraintError(error)) {
      res.status(409).json({
        message: 'Category already exists',
      });
      return;
    }

    if (isRecordNotFoundError(error)) {
      res.status(404).json({
        message: 'Category not found',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to update category',
    });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);

    await prisma.category.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    if (isRecordNotFoundError(error)) {
      res.status(404).json({
        message: 'Category not found',
      });
      return;
    }

    if (isForeignKeyConstraintError(error)) {
      res.status(409).json({
        message: 'Category cannot be deleted because it is used by transactions',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to delete category',
    });
  }
}