import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  accountIdParamSchema,
  createAccountSchema,
  updateAccountSchema,
} from '../validations/account.validation';

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

export async function getAccounts(_req: Request, res: Response) {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    res.status(200).json({
      data: accounts,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch accounts',
    });
  }
}

export async function getAccountBalances(_req: Request, res: Response) {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    const transactionTotals = await prisma.transaction.groupBy({
      by: ['accountId', 'type'],
      where: {
        accountId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const balanceMap = new Map<
      string,
      {
        totalIncome: number;
        totalExpense: number;
      }
    >();

    for (const total of transactionTotals) {
      if (!total.accountId) continue;

      const existing = balanceMap.get(total.accountId) ?? {
        totalIncome: 0,
        totalExpense: 0,
      };

      const amount = Number(total._sum.amount ?? 0);

      if (total.type === 'income') {
        existing.totalIncome += amount;
      }

      if (total.type === 'expense') {
        existing.totalExpense += amount;
      }

      balanceMap.set(total.accountId, existing);
    }

    const data = accounts.map((account) => {
      const totals = balanceMap.get(account.id) ?? {
        totalIncome: 0,
        totalExpense: 0,
      };

      const initialBalance = Number(account.initialBalance);
      const currentBalance =
        initialBalance + totals.totalIncome - totals.totalExpense;

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        initialBalance,
        totalIncome: totals.totalIncome,
        totalExpense: totals.totalExpense,
        currentBalance,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      };
    });

    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch account balances',
    });
  }
}

export async function createAccount(req: Request, res: Response) {
  try {
    const validatedData = createAccountSchema.parse(req.body);

    const account = await prisma.account.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        initialBalance: validatedData.initialBalance,
        isActive: validatedData.isActive ?? true,
      },
    });

    res.status(201).json({
      message: 'Account created successfully',
      data: account,
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
        message: 'Account already exists',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to create account',
    });
  }
}

export async function updateAccount(req: Request, res: Response) {
  try {
    const { id } = accountIdParamSchema.parse(req.params);
    const validatedData = updateAccountSchema.parse(req.body);

    const account = await prisma.account.update({
      where: { id },
      data: {
        name: validatedData.name,
        type: validatedData.type,
        initialBalance: validatedData.initialBalance,
        isActive: validatedData.isActive,
      },
    });

    res.status(200).json({
      message: 'Account updated successfully',
      data: account,
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
        message: 'Account already exists',
      });
      return;
    }

    if (isRecordNotFoundError(error)) {
      res.status(404).json({
        message: 'Account not found',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to update account',
    });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const { id } = accountIdParamSchema.parse(req.params);

    await prisma.account.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Account deleted successfully',
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
        message: 'Account not found',
      });
      return;
    }

    if (isForeignKeyConstraintError(error)) {
      res.status(409).json({
        message: 'Account cannot be deleted because it is used by transactions',
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to delete account',
    });
  }
}