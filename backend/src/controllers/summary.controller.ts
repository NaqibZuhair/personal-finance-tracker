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

    const [groupedExpenses, groupedIncomes] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          type: 'expense',
          transactionDate: dateFilter,
          userId: req.userId,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          type: 'income',
          transactionDate: dateFilter,
          userId: req.userId,
        },
        _sum: { amount: true },
      }),
    ]);

    const totalExpense = groupedExpenses.reduce((total, item) => total + Number(item._sum.amount ?? 0), 0);
    const totalIncome = groupedIncomes.reduce((total, item) => total + Number(item._sum.amount ?? 0), 0);

    const expenseCategoryIds = groupedExpenses.map((item) => item.categoryId).filter((id): id is string => id !== null);
    const incomeCategoryIds = groupedIncomes.map((item) => item.categoryId).filter((id): id is string => id !== null);
    const allCategoryIds = Array.from(new Set([...expenseCategoryIds, ...incomeCategoryIds]));

    const categories = await prisma.category.findMany({
      where: { id: { in: allCategoryIds } },
    });

    const expenseSummary = groupedExpenses
      .map((item) => {
        const category = categories.find((c) => c.id === item.categoryId);
        const total = Number(item._sum.amount ?? 0);
        return {
          categoryId: item.categoryId,
          categoryName: category?.name ?? 'Unknown Category',
          total,
          percentage: totalExpense > 0 ? Number(((total / totalExpense) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    const incomeSummary = groupedIncomes
      .map((item) => {
        const category = categories.find((c) => c.id === item.categoryId);
        const total = Number(item._sum.amount ?? 0);
        return {
          categoryId: item.categoryId,
          categoryName: category?.name ?? 'Unknown Category',
          total,
          percentage: totalIncome > 0 ? Number(((total / totalIncome) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      data: {
        month: query.month,
        totalExpense,
        categories: expenseSummary,
        totalIncome,
        incomeCategories: incomeSummary,
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

export async function getHistoricalSummary(req: AuthRequest, res: Response) {
  try {
    const query = monthlySummaryQuerySchema.parse(req.query);
    
    // Target end month
    const endDate = new Date(`${query.month}-01T00:00:00.000Z`);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    // Target start month (6 months ago)
    const startDate = new Date(`${query.month}-01T00:00:00.000Z`);
    startDate.setUTCMonth(startDate.getUTCMonth() - 5);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        transactionDate: {
          gte: startDate,
          lt: endDate,
        },
        type: {
          in: ['income', 'expense']
        }
      },
      select: {
        type: true,
        amount: true,
        transactionDate: true
      }
    });

    // Initialize the last 6 months buckets
    const months: Record<string, { income: number; expense: number }> = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(startDate);
      d.setUTCMonth(d.getUTCMonth() + i);
      const monthStr = d.toISOString().substring(0, 7); // YYYY-MM
      months[monthStr] = { income: 0, expense: 0 };
    }

    // Bucket the transactions
    for (const t of transactions) {
      const monthStr = t.transactionDate.toISOString().substring(0, 7);
      if (months[monthStr]) {
        if (t.type === 'income') {
          months[monthStr].income += Number(t.amount);
        } else if (t.type === 'expense') {
          months[monthStr].expense += Number(t.amount);
        }
      }
    }

    const data = Object.keys(months).sort().map(month => ({
      month,
      income: months[month].income,
      expense: months[month].expense,
    }));

    res.status(200).json({
      data,
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
      message: 'Failed to fetch historical summary',
    });
  }
}

export async function getDailySummary(req: AuthRequest, res: Response) {
  try {
    const query = monthlySummaryQuerySchema.parse(req.query);
    const startDate = new Date(`${query.month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    const [yearStr, monthStr] = query.month.split('-');
    const daysInMonth = new Date(Date.UTC(Number(yearStr), Number(monthStr), 0)).getUTCDate();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        transactionDate: {
          gte: startDate,
          lt: endDate,
        },
        type: {
          in: ['income', 'expense'],
        },
      },
      select: {
        type: true,
        amount: true,
        transactionDate: true,
      },
    });

    const days: Record<string, { income: number; expense: number }> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${query.month}-${String(i).padStart(2, '0')}`;
      days[dayStr] = { income: 0, expense: 0 };
    }

    for (const t of transactions) {
      const dayStr = t.transactionDate.toISOString().substring(0, 10);
      if (days[dayStr]) {
        if (t.type === 'income') {
          days[dayStr].income += Number(t.amount);
        } else if (t.type === 'expense') {
          days[dayStr].expense += Number(t.amount);
        }
      }
    }

    const data = Object.keys(days).sort().map((day) => ({
      day,
      income: days[day].income,
      expense: days[day].expense,
    }));

    res.status(200).json({
      data,
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
      message: 'Failed to fetch daily summary',
    });
  }
}