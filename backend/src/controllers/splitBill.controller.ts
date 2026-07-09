import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createSplitBill,
  getSplitBills,
  getDebts,
  markDebtPaid,
  deleteDebt,
  deleteSplitBill,
} from '../services/splitBill.service';
import { z } from 'zod';

const createSplitBillSchema = z.object({
  title: z.string().min(1, 'Judul split bill wajib diisi'),
  totalAmount: z.number().positive(),
  taxServicePercent: z.number().min(0).optional(),
  splitMethod: z.enum(['equal', 'itemized', 'custom']),
  participants: z.array(
    z.object({
      name: z.string().min(1),
      shareAmount: z.number().optional(),
    })
  ),
  items: z.array(
    z.object({
      item: z.string(),
      price: z.number(),
      assignedTo: z.array(z.string()),
    })
  ).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  transactionDate: z.string().optional(),
});

export async function handleCreateSplitBill(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const body = createSplitBillSchema.parse(req.body);

    const splitBill = await createSplitBill(userId, body);
    res.status(201).json({
      message: 'Split bill berhasil disimpan',
      data: splitBill,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validasi gagal', errors: err.issues });
      return;
    }
    res.status(500).json({ message: err.message || 'Gagal menyimpan split bill' });
  }
}

export async function handleGetSplitBills(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const bills = await getSplitBills(userId);
    res.status(200).json({ data: bills });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Gagal mengambil data split bill' });
  }
}

export async function handleGetDebts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { type, isPaid } = req.query;
    const filter = {
      type: typeof type === 'string' ? type : undefined,
      isPaid: isPaid !== undefined ? isPaid === 'true' : undefined,
    };

    const debts = await getDebts(userId, filter);
    res.status(200).json({ data: debts });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Gagal mengambil data utang piutang' });
  }
}

export async function handleMarkDebtPaid(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const debtId = String(req.params.id);

    const updated = await markDebtPaid(userId, debtId);
    res.status(200).json({
      message: 'Status utang berhasil ditandai lunas',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Gagal mengubah status utang' });
  }
}

export async function handleDeleteDebt(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const debtId = String(req.params.id);

    await deleteDebt(userId, debtId);
    res.status(200).json({ message: 'Catatan utang berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Gagal menghapus catatan utang' });
  }
}

export async function handleDeleteSplitBill(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const splitBillId = String(req.params.id);

    await deleteSplitBill(userId, splitBillId);
    res.status(200).json({ message: 'Split bill berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Gagal menghapus split bill' });
  }
}
