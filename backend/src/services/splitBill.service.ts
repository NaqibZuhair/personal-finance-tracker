import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client.js';

export interface SplitItemInput {
  item: string;
  price: number;
  assignedTo: string[]; // names of participants sharing this item
}

export interface CreateSplitBillDTO {
  title: string;
  totalAmount: number;
  taxServicePercent?: number; // e.g. 15 for 15%
  splitMethod: 'equal' | 'itemized' | 'custom';
  participants: {
    name: string;
    shareAmount?: number;
  }[];
  items?: SplitItemInput[];
  accountId?: string;
  categoryId?: string;
  transactionDate?: string;
}

export function calculateItemizedShares(
  items: SplitItemInput[],
  taxServicePercent: number = 0
): Record<string, number> {
  const subtotalByPerson: Record<string, number> = {};
  let totalSubtotal = 0;

  for (const row of items) {
    if (!row.assignedTo || row.assignedTo.length === 0) continue;
    const sharePerPerson = row.price / row.assignedTo.length;
    for (const person of row.assignedTo) {
      subtotalByPerson[person] = (subtotalByPerson[person] || 0) + sharePerPerson;
    }
    totalSubtotal += row.price;
  }

  const result: Record<string, number> = {};
  for (const [person, subtotal] of Object.entries(subtotalByPerson)) {
    const taxShare = totalSubtotal > 0 ? (subtotal / totalSubtotal) * (totalSubtotal * (taxServicePercent / 100)) : 0;
    result[person] = Math.round(subtotal + taxShare);
  }

  return result;
}

export async function createSplitBill(userId: string, data: CreateSplitBillDTO) {
  const taxPercent = data.taxServicePercent || 0;
  let participantShares: { name: string; shareAmount: number }[] = [];

  if (data.splitMethod === 'equal') {
    const count = data.participants.length;
    if (count === 0) throw new Error('Minimal 1 participant dibutuhkan untuk split bill');
    const equalShare = Math.round(data.totalAmount / count);
    participantShares = data.participants.map(p => ({
      name: p.name,
      shareAmount: equalShare,
    }));
  } else if (data.splitMethod === 'itemized' && data.items && data.items.length > 0) {
    const calculated = calculateItemizedShares(data.items, taxPercent);
    participantShares = Object.entries(calculated).map(([name, shareAmount]) => ({
      name,
      shareAmount,
    }));
  } else {

    participantShares = data.participants.map(p => ({
      name: p.name,
      shareAmount: p.shareAmount || 0,
    }));
  }

  const myShareEntry = participantShares.find(
    p => p.name.toLowerCase() === 'saya' || p.name.toLowerCase() === 'me' || p.name.toLowerCase() === 'self'
  );
  const myShareAmount = myShareEntry ? myShareEntry.shareAmount : 0;

  const splitBill = await prisma.$transaction(async (tx) => {
    let transactionId: string | null = null;

    if (data.accountId && myShareAmount > 0) {
      const trx = await tx.transaction.create({
        data: {
          userId,
          amount: new Prisma.Decimal(myShareAmount),
          type: 'expense',
          description: `[Split-Bill Share] ${data.title}`,
          accountId: data.accountId,
          categoryId: data.categoryId || null,
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
          tags: ['split-bill'],
        },
      });
      transactionId = trx.id;
    }

    const createdBill = await tx.splitBill.create({
      data: {
        userId,
        title: data.title,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        myShare: new Prisma.Decimal(myShareAmount),
        taxServicePercent: new Prisma.Decimal(taxPercent),
        splitMethod: data.splitMethod,
        transactionId,
        participants: {
          create: participantShares.map(p => ({
            name: p.name,
            shareAmount: new Prisma.Decimal(p.shareAmount),
            isPaid: p.name.toLowerCase() === 'saya' || p.name.toLowerCase() === 'me',
          })),
        },
      },
      include: { participants: true },
    });

    for (const part of createdBill.participants) {
      const isMe = part.name.toLowerCase() === 'saya' || part.name.toLowerCase() === 'me';
      if (!isMe && Number(part.shareAmount) > 0) {
        await tx.debt.create({
          data: {
            userId,
            friendName: part.name,
            amount: part.shareAmount,
            type: 'receivable',
            description: `Patungan: ${data.title}`,
            splitBillId: createdBill.id,
          },
        });
      }
    }

    return createdBill;
  });

  return splitBill;
}

export async function getSplitBills(userId: string) {
  return prisma.splitBill.findMany({
    where: { userId },
    include: {
      participants: true,
      debts: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDebts(userId: string, filter?: { type?: string; isPaid?: boolean }) {
  return prisma.debt.findMany({
    where: {
      userId,
      type: filter?.type,
      isPaid: filter?.isPaid,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markDebtPaid(userId: string, debtId: string) {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });
  if (!debt) throw new Error('Catatan utang tidak ditemukan atau bukan milik pengguna');

  return prisma.debt.update({
    where: { id: debtId },
    data: {
      isPaid: true,
      paidAt: new Date(),
    },
  });
}

export async function deleteDebt(userId: string, debtId: string) {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });
  if (!debt) throw new Error('Catatan utang tidak ditemukan atau bukan milik pengguna');

  return prisma.debt.delete({ where: { id: debtId } });
}

export async function deleteSplitBill(userId: string, splitBillId: string) {
  const bill = await prisma.splitBill.findFirst({
    where: { id: splitBillId, userId },
  });
  if (!bill) throw new Error('Split bill tidak ditemukan atau bukan milik pengguna');

  return prisma.splitBill.delete({ where: { id: splitBillId } });
}
