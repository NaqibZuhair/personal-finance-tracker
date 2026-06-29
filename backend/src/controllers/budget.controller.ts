import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import { getBudgetsQuerySchema, upsertBudgetSchema } from '../validations/budget.validation';

export async function getBudgets(req: AuthRequest, res: Response) {
  try {
    const { month } = getBudgetsQuerySchema.parse(req.query);
    const [yearStr, monthStr] = month.split('-');
    const yearNum = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    // Fetch budgets for the requested month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.userId,
        month: monthNum,
        year: yearNum,
      },
      include: {
        category: true,
      },
      orderBy: { amount: 'desc' },
    });

    // Determine date range for the requested month to fetch expenses
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch all expenses in this month for the user
    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.userId,
        type: 'expense',
        transactionDate: {
          gte: startDate,
          lt: endDate,
        },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    });

    const expenseMap = new Map<string, number>();
    for (const exp of expenses) {
      if (exp.categoryId) {
        expenseMap.set(exp.categoryId, Number(exp._sum.amount ?? 0));
      }
    }

    const data = budgets.map((budget) => {
      const spentAmount = expenseMap.get(budget.categoryId) ?? 0;
      return {
        id: budget.id,
        amount: Number(budget.amount),
        month: budget.month,
        year: budget.year,
        categoryId: budget.categoryId,
        category: budget.category,
        spentAmount,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
}

export async function upsertBudget(req: AuthRequest, res: Response) {
  try {
    const validatedData = upsertBudgetSchema.parse(req.body);

    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId: validatedData.categoryId,
          month: validatedData.month,
          year: validatedData.year,
        },
      },
      update: {
        amount: validatedData.amount,
      },
      create: {
        amount: validatedData.amount,
        month: validatedData.month,
        year: validatedData.year,
        categoryId: validatedData.categoryId,
        userId: req.userId!,
      },
      include: {
        category: true,
      }
    });

    res.status(200).json({
      message: 'Budget saved successfully',
      data: {
        ...budget,
        amount: Number(budget.amount),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    // E.g. Category doesn't exist
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2003') {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }
    res.status(500).json({ message: 'Failed to save budget' });
  }
}
