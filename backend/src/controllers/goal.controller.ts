import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import { createGoalSchema, goalIdParamSchema, updateGoalSchema } from '../validations/goal.validation';

function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002';
}

function isRecordNotFoundError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025';
}

export async function getGoals(req: AuthRequest, res: Response) {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        account: true,
      },
    });

    // Calculate current amount for each goal by aggregating transactions
    const goalIds = goals.map((g) => g.accountId);
    
    // In a double-entry system, a goal account receives money via transfers (toAccountId)
    // and loses money via transfers/expenses (accountId)
    const transferInTotals = await prisma.transaction.groupBy({
      by: ['toAccountId'],
      where: {
        toAccountId: { in: goalIds },
        userId: req.userId,
      },
      _sum: { amount: true },
    });

    const transferOutTotals = await prisma.transaction.groupBy({
      by: ['accountId'],
      where: {
        accountId: { in: goalIds },
        userId: req.userId,
      },
      _sum: { amount: true },
    });

    const balanceMap = new Map<string, number>();
    
    // Add all ins
    for (const total of transferInTotals) {
      if (total.toAccountId) {
        balanceMap.set(total.toAccountId, Number(total._sum.amount ?? 0));
      }
    }
    
    // Subtract all outs
    for (const total of transferOutTotals) {
      const current = balanceMap.get(total.accountId) ?? 0;
      balanceMap.set(total.accountId, current - Number(total._sum.amount ?? 0));
    }

    const data = goals.map((goal) => {
      const currentAmount = balanceMap.get(goal.accountId) ?? 0;
      return {
        id: goal.id,
        name: goal.name,
        targetAmount: Number(goal.targetAmount),
        currentAmount,
        deadline: goal.deadline,
        color: goal.color,
        accountId: goal.accountId,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
}

export async function createGoal(req: AuthRequest, res: Response) {
  try {
    const validatedData = createGoalSchema.parse(req.body);

    const goal = await prisma.$transaction(async (tx) => {
      // 1. Create an underlying 'goal' account
      const account = await tx.account.create({
        data: {
          name: `Goal: ${validatedData.name}`,
          type: 'goal',
          initialBalance: 0,
          isActive: true,
          userId: req.userId!,
        },
      });

      // 2. Create the SavingsGoal linked to the account
      return await tx.savingsGoal.create({
        data: {
          name: validatedData.name,
          targetAmount: validatedData.targetAmount,
          deadline: validatedData.deadline,
          color: validatedData.color,
          accountId: account.id,
          userId: req.userId!,
        },
      });
    });

    res.status(201).json({
      message: 'Goal created successfully',
      data: {
        ...goal,
        targetAmount: Number(goal.targetAmount),
        currentAmount: 0,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    if (isUniqueConstraintError(error)) {
      res.status(409).json({ message: 'A goal with this account already exists' });
      return;
    }
    res.status(500).json({ message: 'Failed to create goal' });
  }
}

export async function updateGoal(req: AuthRequest, res: Response) {
  try {
    const { id } = goalIdParamSchema.parse(req.params);
    const validatedData = updateGoalSchema.parse(req.body);

    const existingGoal = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!existingGoal || existingGoal.userId !== req.userId) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    const goal = await prisma.$transaction(async (tx) => {
      if (validatedData.name && validatedData.name !== existingGoal.name) {
        await tx.account.update({
          where: { id: existingGoal.accountId },
          data: { name: `Goal: ${validatedData.name}` },
        });
      }

      return await tx.savingsGoal.update({
        where: { id },
        data: {
          name: validatedData.name,
          targetAmount: validatedData.targetAmount,
          deadline: validatedData.deadline,
          color: validatedData.color,
        },
      });
    });

    res.status(200).json({
      message: 'Goal updated successfully',
      data: {
        ...goal,
        targetAmount: Number(goal.targetAmount),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Failed to update goal' });
  }
}

export async function deleteGoal(req: AuthRequest, res: Response) {
  try {
    const { id } = goalIdParamSchema.parse(req.params);

    const existingGoal = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!existingGoal || existingGoal.userId !== req.userId) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    // Because SavingsGoal has onDelete: Cascade for account, deleting the Account deletes the SavingsGoal.
    // However, the schema says: SavingsGoal -> Account (onDelete: Cascade).
    // Wait, let's check schema: Account doesn't cascade to SavingsGoal?
    // In schema.prisma:
    // model SavingsGoal { account Account @relation(fields: [accountId], references: [id], onDelete: Cascade) }
    // This means if Account is deleted, SavingsGoal is deleted!
    
    // Check if account has transactions
    const txCount = await prisma.transaction.count({
      where: {
        OR: [
          { accountId: existingGoal.accountId },
          { toAccountId: existingGoal.accountId }
        ]
      }
    });

    if (txCount > 0) {
      res.status(409).json({ message: 'Cannot delete goal that has transactions/funds in it.' });
      return;
    }

    await prisma.account.delete({
      where: { id: existingGoal.accountId },
    });

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    if (isRecordNotFoundError(error)) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }
    res.status(500).json({ message: 'Failed to delete goal' });
  }
}
