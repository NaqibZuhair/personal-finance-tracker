import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import type { Prisma } from '../generated/prisma/client.js';
import { ZodError } from 'zod';
import ExcelJS from 'exceljs';
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

function getExportFilename(transactions: { transactionDate: Date }[], queryMonth?: string, ext: 'csv' | 'xlsx' = 'xlsx'): string {
  const fmt = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  if (transactions.length > 0) {
    const latest = transactions[0].transactionDate;
    const earliest = transactions[transactions.length - 1].transactionDate;
    return `${fmt(earliest)}_${fmt(latest)}.${ext}`;
  }

  if (queryMonth) {
    const [y, m] = queryMonth.split('-');
    const year = y.slice(-2);
    const lastDay = new Date(Number(y), Number(m), 0).getDate();
    return `01-${m}-${year}_${String(lastDay).padStart(2, '0')}-${m}-${year}.${ext}`;
  }

  const now = new Date();
  return `export_${fmt(now)}.${ext}`;
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
      const [year, month] = query.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

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

    if (query.format === 'csv') {
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
      res.attachment(getExportFilename(transactions, query.month, 'csv'));
      return res.send(csv);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Personal Finance Tracker';
    const worksheet = workbook.addWorksheet('Transactions', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 14 },
      { header: 'Tipe', key: 'type', width: 14 },
      { header: 'Kategori', key: 'category', width: 22 },
      { header: 'Akun Asal', key: 'account', width: 22 },
      { header: 'Akun Tujuan', key: 'toAccount', width: 22 },
      { header: 'Jumlah (IDR)', key: 'amount', width: 18 },
      { header: 'Deskripsi', key: 'description', width: 35 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    for (const t of transactions) {
      const date = t.transactionDate.toISOString().split('T')[0];
      const type = t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer';
      const category = t.category?.name || '-';
      const account = t.account?.name || '-';
      const toAccount = t.toAccount?.name || '-';
      const amount = Number(t.amount);
      const description = t.description || '';

      const row = worksheet.addRow({
        date,
        type,
        category,
        account,
        toAccount,
        amount,
        description,
      });

      row.height = 20;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: 'FF334155' } };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 || colNumber === 2 ? 'center' : colNumber === 6 ? 'right' : 'left',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
        if (colNumber === 6) {
          cell.numFmt = '#,##0';
          const fontColor = t.type === 'income' ? 'FF16A34A' : t.type === 'expense' ? 'FFDC2626' : 'FF4F46E5';
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: fontColor } };
        }
      });
    }

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(getExportFilename(transactions, query.month, 'xlsx'));
    await workbook.xlsx.write(res);
    return res.end();
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