import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  createRoutineSchema,
  updateRoutineSchema,
  routineIdParamSchema,
} from '../validations/routine.validation';

export async function getRoutines(req: AuthRequest, res: Response) {
  try {
    const routines = await prisma.allocationRoutine.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            account: true,
            toAccount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: routines,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch allocation routines',
    });
  }
}

export async function createRoutine(req: AuthRequest, res: Response) {
  try {
    const validatedData = createRoutineSchema.parse(req.body);

    const routine = await prisma.allocationRoutine.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        userId: req.userId!,
        items: {
          create: validatedData.items.map((item) => ({
            amount: item.amount,
            description: item.description,
            accountId: item.accountId,
            toAccountId: item.toAccountId,
          })),
        },
      },
      include: {
        items: {
          include: {
            account: true,
            toAccount: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Allocation routine created successfully',
      data: routine,
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
      message: 'Failed to create allocation routine',
    });
  }
}

export async function updateRoutine(req: AuthRequest, res: Response) {
  try {
    const { id } = routineIdParamSchema.parse(req.params);
    const validatedData = updateRoutineSchema.parse(req.body);

    const existingRoutine = await prisma.allocationRoutine.findUnique({
      where: { id },
    });
    if (!existingRoutine || existingRoutine.userId !== req.userId) {
      res.status(404).json({ message: 'Allocation routine not found' });
      return;
    }

    const routine = await prisma.$transaction(async (tx) => {
      await tx.allocationRoutineItem.deleteMany({
        where: { routineId: id },
      });

      return tx.allocationRoutine.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          items: {
            create: validatedData.items.map((item) => ({
              amount: item.amount,
              description: item.description,
              accountId: item.accountId,
              toAccountId: item.toAccountId,
            })),
          },
        },
        include: {
          items: {
            include: {
              account: true,
              toAccount: true,
            },
          },
        },
      });
    });

    res.status(200).json({
      message: 'Allocation routine updated successfully',
      data: routine,
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
      message: 'Failed to update allocation routine',
    });
  }
}

export async function deleteRoutine(req: AuthRequest, res: Response) {
  try {
    const { id } = routineIdParamSchema.parse(req.params);

    const existingRoutine = await prisma.allocationRoutine.findUnique({
      where: { id },
    });
    if (!existingRoutine || existingRoutine.userId !== req.userId) {
      res.status(404).json({ message: 'Allocation routine not found' });
      return;
    }

    await prisma.allocationRoutine.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Allocation routine deleted successfully',
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
      message: 'Failed to delete allocation routine',
    });
  }
}

export async function executeRoutine(req: AuthRequest, res: Response) {
  try {
    const { id } = routineIdParamSchema.parse(req.params);

    const routine = await prisma.allocationRoutine.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!routine || routine.userId !== req.userId) {
      res.status(404).json({ message: 'Allocation routine not found' });
      return;
    }

    if (routine.items.length === 0) {
      res.status(400).json({ message: 'Routine has no items to execute' });
      return;
    }

    const now = new Date();

    const transactions = await prisma.$transaction(
      routine.items.map((item) =>
        prisma.transaction.create({
          data: {
            type: 'transfer',
            amount: item.amount,
            description: item.description || `[Routine] ${routine.name}`,
            transactionDate: now,
            accountId: item.accountId,
            toAccountId: item.toAccountId,
            userId: req.userId!,
          },
        })
      )
    );

    res.status(200).json({
      message: `Successfully executed routine: ${routine.name} (${transactions.length} transfers created)`,
      data: transactions,
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
      message: 'Failed to execute allocation routine',
    });
  }
}
