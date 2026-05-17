import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  createTransactionSchema,
  transactionIdParamSchema,
  updateTransactionSchema,
} from '../validations/transaction.validation';

function isRecordNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2025'
  );
}

export async function getTransactions(_req: Request, res: Response) {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    res.status(200).json({
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch transactions',
    });
  }
}

export async function getTransactionById(req: Request, res: Response) {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      res.status(404).json({
        message: 'Transaction not found',
      });
      return;
    }

    res.status(200).json({
      data: transaction,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to fetch transaction',
    });
  }
}

export async function createTransaction(req: Request, res: Response) {
  try {
    const validatedData = createTransactionSchema.parse(req.body);

    const category = await prisma.category.findUnique({
      where: {
        id: validatedData.categoryId,
      },
    });

    if (!category) {
      res.status(404).json({
        message: 'Category not found',
      });
      return;
    }

    if (category.type !== validatedData.type) {
      res.status(400).json({
        message: 'Transaction type must match category type',
      });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        transactionDate: validatedData.transactionDate,
        categoryId: validatedData.categoryId,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to create transaction',
    });
  }
}

export async function updateTransaction(req: Request, res: Response) {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);
    const validatedData = updateTransactionSchema.parse(req.body);

    const category = await prisma.category.findUnique({
      where: {
        id: validatedData.categoryId,
      },
    });

    if (!category) {
      res.status(404).json({
        message: 'Category not found',
      });
      return;
    }

    if (category.type !== validatedData.type) {
      res.status(400).json({
        message: 'Transaction type must match category type',
      });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        transactionDate: validatedData.transactionDate,
        categoryId: validatedData.categoryId,
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      message: 'Transaction updated successfully',
      data: transaction,
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
        message: 'Transaction not found',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to update transaction',
    });
  }
}

export async function deleteTransaction(req: Request, res: Response) {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: 'Transaction deleted successfully',
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
        message: 'Transaction not found',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to delete transaction',
    });
  }
}