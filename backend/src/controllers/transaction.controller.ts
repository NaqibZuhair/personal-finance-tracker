import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import type { Prisma } from '../generated/prisma/client.js';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import {
  createTransactionSchema,
  transactionIdParamSchema,
  transactionQuerySchema,
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

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const query = transactionQuerySchema.parse(req.query);

    const where: Prisma.TransactionWhereInput = {
      userId: req.userId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.search) {
      where.description = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.month) {
      const startDate = new Date(`${query.month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);

      where.transactionDate = {
        gte: startDate,
        lt: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    res.status(200).json({
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
      message: 'Failed to fetch transactions',
    });
  }
}

export async function getTransactionById(req: AuthRequest, res: Response) {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
    });

    if (!transaction || transaction.userId !== req.userId) {
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

export async function createTransaction(req: AuthRequest, res: Response) {
  try {
    const validatedData = createTransactionSchema.parse(req.body);

    if (validatedData.type !== 'transfer' && validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: req.userId,
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
    }

    const account = await prisma.account.findFirst({
      where: {
        id: validatedData.accountId,
        userId: req.userId,
      },
    });

    if (!account) {
      res.status(404).json({
        message: 'Account not found',
      });
      return;
    }

    if (!account.isActive) {
      res.status(400).json({
        message: 'Account is inactive',
      });
      return;
    }

    if (validatedData.type === 'transfer' && validatedData.toAccountId) {
      const toAccount = await prisma.account.findFirst({
        where: { id: validatedData.toAccountId, userId: req.userId },
      });

      if (!toAccount) {
        res.status(404).json({ message: 'Destination account not found' });
        return;
      }

      if (!toAccount.isActive) {
        res.status(400).json({ message: 'Destination account is inactive' });
        return;
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        transactionDate: validatedData.transactionDate,
        categoryId: validatedData.type === 'transfer' ? null : validatedData.categoryId,
        accountId: validatedData.accountId,
        toAccountId: validatedData.type === 'transfer' ? validatedData.toAccountId : null,
        userId: req.userId!,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
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

export async function updateTransaction(req: AuthRequest, res: Response) {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);
    const validatedData = updateTransactionSchema.parse(req.body);

    const existingTransaction = await prisma.transaction.findUnique({ where: { id } });
    if (!existingTransaction || existingTransaction.userId !== req.userId) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    if (validatedData.type !== 'transfer' && validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: req.userId,
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
    }

    const account = await prisma.account.findFirst({
      where: {
        id: validatedData.accountId,
        userId: req.userId,
      },
    });

    if (!account) {
      res.status(404).json({
        message: 'Account not found',
      });
      return;
    }

    if (!account.isActive) {
      res.status(400).json({
        message: 'Account is inactive',
      });
      return;
    }

    if (validatedData.type === 'transfer' && validatedData.toAccountId) {
      const toAccount = await prisma.account.findFirst({
        where: { id: validatedData.toAccountId, userId: req.userId },
      });

      if (!toAccount) {
        res.status(404).json({ message: 'Destination account not found' });
        return;
      }

      if (!toAccount.isActive) {
        res.status(400).json({ message: 'Destination account is inactive' });
        return;
      }
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
        categoryId: validatedData.type === 'transfer' ? null : validatedData.categoryId,
        accountId: validatedData.accountId,
        toAccountId: validatedData.type === 'transfer' ? validatedData.toAccountId : null,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
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

export async function deleteTransaction(req: AuthRequest, res: Response) {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);

    const existingTransaction = await prisma.transaction.findUnique({ where: { id } });
    if (!existingTransaction || existingTransaction.userId !== req.userId) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

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

export async function exportTransactions(req: AuthRequest, res: Response) {
  try {
    const query = transactionQuerySchema.parse(req.query);

    const where: Prisma.TransactionWhereInput = {
      userId: req.userId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.search) {
      where.description = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.month) {
      const startDate = new Date(`${query.month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);

      where.transactionDate = {
        gte: startDate,
        lt: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    let csv = 'Date,Type,Category,Account,To Account,Amount,Description\n';
    for (const t of transactions) {
      const date = t.transactionDate.toISOString().split('T')[0];
      const type = t.type;
      const category = t.category?.name || '';
      const account = t.account?.name || '';
      const toAccount = t.toAccount?.name || '';
      const amount = t.amount;
      const description = (t.description || '').replace(/"/g, '""');
      
      csv += `"${date}","${type}","${category}","${account}","${toAccount}","${amount}","${description}"\n`;
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`transactions-${query.month || 'all'}.csv`);
    return res.send(csv);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to export transactions',
    });
  }
}