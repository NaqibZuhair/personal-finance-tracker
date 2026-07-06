import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import type { Prisma } from '../generated/prisma/client.js';
import { ZodError } from 'zod';
import ExcelJS from 'exceljs';
import prisma from '../lib/prisma';
import { transactionQuerySchema } from '../validations/transaction.validation';

function getExportFilename(
  transactions: { transactionDate: Date }[],
  queryMonth?: string,
  ext: 'csv' | 'xlsx' = 'xlsx',
): string {
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

    if (query.tag) {
      where.tags = {
        has: query.tag,
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
      let csv = 'Date,Type,Category,Account,To Account,Amount,Tags,Description\n';
      for (const t of transactions) {
        const date = t.transactionDate.toISOString().split('T')[0];
        const type = t.type;
        const category = t.category?.name || '';
        const account = t.account?.name || '';
        const toAccount = t.toAccount?.name || '';
        const amount = t.amount;
        const tags = (t.tags || []).join(', ');
        const description = (t.description || '').replace(/"/g, '""');

        csv += `"${date}","${type}","${category}","${account}","${toAccount}","${amount}","${tags}","${description}"\n`;
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
      { header: 'Tags', key: 'tags', width: 20 },
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
      const type =
        t.type === 'income'
          ? 'Pemasukan'
          : t.type === 'expense'
          ? 'Pengeluaran'
          : 'Transfer';
      const category = t.category?.name || '-';
      const account = t.account?.name || '-';
      const toAccount = t.toAccount?.name || '-';
      const amount = Number(t.amount);
      const tags = (t.tags || []).map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(', ');
      const description = t.description || '';

      const row = worksheet.addRow({
        date,
        type,
        category,
        account,
        toAccount,
        amount,
        tags,
        description,
      });

      row.height = 20;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: 'FF334155' } };
        cell.alignment = {
          vertical: 'middle',
          horizontal:
            colNumber === 1 || colNumber === 2
              ? 'center'
              : colNumber === 6
              ? 'right'
              : 'left',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
        if (colNumber === 6) {
          cell.numFmt = '#,##0';
          const fontColor =
            t.type === 'income'
              ? 'FF16A34A'
              : t.type === 'expense'
              ? 'FFDC2626'
              : 'FF4F46E5';
          cell.font = {
            name: 'Arial',
            size: 10,
            bold: true,
            color: { argb: fontColor },
          };
        }
      });
    }

    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
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
