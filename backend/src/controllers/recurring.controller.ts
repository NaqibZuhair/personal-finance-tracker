import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  createRecurringSchema,
  updateRecurringSchema,
  recurringIdParamSchema,
} from '../validations/recurring.validation';

export async function getRecurringTransactions(req: AuthRequest, res: Response) {
  try {
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId: req.userId },
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
      orderBy: { nextRunDate: 'asc' },
    });

    res.status(200).json({ data: recurring });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recurring transactions' });
  }
}

export async function createRecurringTransaction(req: AuthRequest, res: Response) {
  try {
    const validatedData = createRecurringSchema.parse(req.body);

    const recurring = await prisma.recurringTransaction.create({
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        frequency: validatedData.frequency,
        nextRunDate: new Date(validatedData.nextRunDate),
        categoryId: validatedData.categoryId,
        accountId: validatedData.accountId,
        toAccountId: validatedData.toAccountId,
        userId: req.userId!,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
    });

    res.status(201).json({ message: 'Recurring transaction created successfully', data: recurring });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Failed to create recurring transaction' });
  }
}

export async function updateRecurringTransaction(req: AuthRequest, res: Response) {
  try {
    const { id } = recurringIdParamSchema.parse(req.params);
    const validatedData = updateRecurringSchema.parse(req.body);

    const existing = await prisma.recurringTransaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ message: 'Recurring transaction not found' });
      return;
    }

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        frequency: validatedData.frequency,
        nextRunDate: validatedData.nextRunDate ? new Date(validatedData.nextRunDate) : undefined,
        isActive: validatedData.isActive,
        categoryId: validatedData.categoryId,
        accountId: validatedData.accountId,
        toAccountId: validatedData.toAccountId,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
    });

    res.status(200).json({ message: 'Recurring transaction updated', data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Failed to update recurring transaction' });
  }
}

export async function deleteRecurringTransaction(req: AuthRequest, res: Response) {
  try {
    const { id } = recurringIdParamSchema.parse(req.params);

    const existing = await prisma.recurringTransaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ message: 'Recurring transaction not found' });
      return;
    }

    await prisma.recurringTransaction.delete({ where: { id } });

    res.status(200).json({ message: 'Recurring transaction deleted' });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Failed to delete recurring transaction' });
  }
}
