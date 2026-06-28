import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import { monthlySummaryQuerySchema } from '../validations/summary.validation';

export async function getMonthlySummary(req: AuthRequest, res: Response) {
  try {
    const query = monthlySummaryQuerySchema.parse(req.query);

    const startDate = new Date(`${query.month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    const dateFilter = {
      gte: startDate,
      lt: endDate,
    };

    const [incomeAggregate, expenseAggregate, transactionCount] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: {
            type: 'income',
            transactionDate: dateFilter,
            userId: req.userId,
          },
          _sum: {
            amount: true,
          },
        }),

        prisma.transaction.aggregate({
          where: {
            type: 'expense',
            transactionDate: dateFilter,
            userId: req.userId,
          },
          _sum: {
            amount: true,
          },
        }),

        prisma.transaction.count({
          where: {
            transactionDate: dateFilter,
            userId: req.userId,
          },
        }),
      ]);

    const totalIncome = Number(incomeAggregate._sum.amount ?? 0);
    const totalExpense = Number(expenseAggregate._sum.amount ?? 0);
    const balance = totalIncome - totalExpense;

    res.status(200).json({
      data: {
        month: query.month,
        totalIncome,
        totalExpense,
        balance,
        transactionCount,
      },
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
      message: 'Failed to fetch monthly summary',
    });
  }
}

export async function getCategorySummary(req: AuthRequest, res: Response) {
  try {
    const query = monthlySummaryQuerySchema.parse(req.query);

    const startDate = new Date(`${query.month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    const dateFilter = {
      gte: startDate,
      lt: endDate,
    };

    const groupedExpenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'expense',
        transactionDate: dateFilter,
        userId: req.userId,
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpense = groupedExpenses.reduce((total, item) => {
      return total + Number(item._sum.amount ?? 0);
    }, 0);

    const categoryIds = groupedExpenses
      .map((item) => item.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    const categorySummary = groupedExpenses
      .map((item) => {
        const category = categories.find(
          (currentCategory) => currentCategory.id === item.categoryId,
        );

        const total = Number(item._sum.amount ?? 0);

        return {
          categoryId: item.categoryId,
          categoryName: category?.name ?? 'Unknown Category',
          total,
          percentage:
            totalExpense > 0 ? Number(((total / totalExpense) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      data: {
        month: query.month,
        totalExpense,
        categories: categorySummary,
      },
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
      message: 'Failed to fetch category summary',
    });
  }
}

export async function getRecentTransactions(req: AuthRequest, res: Response) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      take: 5,
      include: {
        category: true,
      },
      orderBy: [
        {
          transactionDate: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    res.status(200).json({
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch recent transactions',
    });
  }
}