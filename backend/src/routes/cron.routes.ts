import { Router } from 'express';
import prisma from '../lib/prisma';
import {
  generateAndSendMorningBriefing,
  generateAndSendWeekendGuard,
  generateAndSendMonthlyReport,
} from '../services/notification.service';

const router = Router();

const verifyCronSecret = (req: any, res: any, next: any) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return next();

  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${secret}` || req.query.secret === secret) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized Cron Request' });
};

router.get('/morning-briefing', verifyCronSecret, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { waPhone: { not: null } },
      select: { id: true, name: true, waPhone: true },
    });

    for (const user of users) {
      await generateAndSendMorningBriefing(user.id);
    }

    res.json({
      success: true,
      message: `Proactive Morning Briefing sent to ${users.length} users.`,
    });
  } catch (error: any) {
    console.error('[Cron Route] Morning Briefing Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recurring', verifyCronSecret, async (req, res) => {
  try {
    const today = new Date();
    const dueTransactions = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: today },
      },
    });

    let executedCount = 0;
    for (const recurring of dueTransactions) {
      await prisma.transaction.create({
        data: {
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          transactionDate: new Date(),
          categoryId: recurring.categoryId,
          accountId: recurring.accountId,
          toAccountId: recurring.toAccountId,
          userId: recurring.userId,
        },
      });

      const nextDate = new Date(recurring.nextRunDate);
      switch (recurring.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          nextDate.setMonth(nextDate.getMonth() + 1);
      }

      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: { nextRunDate: nextDate },
      });
      executedCount++;
    }

    res.json({
      success: true,
      message: `Executed ${executedCount} recurring transactions.`,
    });
  } catch (error: any) {
    console.error('[Cron Route] Recurring Transactions Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/weekend-guard', verifyCronSecret, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { waPhone: { not: null } },
      select: { id: true },
    });

    for (const user of users) {
      await generateAndSendWeekendGuard(user.id);
    }

    res.json({
      success: true,
      message: `Weekend Spending Guard sent to ${users.length} users.`,
    });
  } catch (error: any) {
    console.error('[Cron Route] Weekend Guard Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monthly-report', verifyCronSecret, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { waPhone: { not: null } },
      select: { id: true },
    });

    for (const user of users) {
      await generateAndSendMonthlyReport(user.id);
    }

    res.json({
      success: true,
      message: `Monthly Executive Summary sent to ${users.length} users.`,
    });
  } catch (error: any) {
    console.error('[Cron Route] Monthly Report Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/daily-master', verifyCronSecret, async (req, res) => {
  try {
    console.log('[Cron Route] Running Daily Master Job...');
    const now = new Date();
    const dayOfWeek = now.getDay(); // 5 = Friday
    const dateOfMonth = now.getDate(); // 1 = 1st of month

    const dueTransactions = await prisma.recurringTransaction.findMany({
      where: { isActive: true, nextRunDate: { lte: now } },
    });
    for (const recurring of dueTransactions) {
      await prisma.transaction.create({
        data: {
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          transactionDate: new Date(),
          categoryId: recurring.categoryId,
          accountId: recurring.accountId,
          toAccountId: recurring.toAccountId,
          userId: recurring.userId,
        },
      });
      const nextDate = new Date(recurring.nextRunDate);
      switch (recurring.frequency) {
        case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        default: nextDate.setMonth(nextDate.getMonth() + 1);
      }
      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: { nextRunDate: nextDate },
      });
    }

    const users = await prisma.user.findMany({
      where: { waPhone: { not: null } },
      select: { id: true },
    });
    for (const user of users) {
      await generateAndSendMorningBriefing(user.id);
    }

    if (dayOfWeek === 5) {
      for (const user of users) {
        await generateAndSendWeekendGuard(user.id);
      }
    }

    if (dateOfMonth === 1) {
      for (const user of users) {
        await generateAndSendMonthlyReport(user.id);
      }
    }

    res.json({
      success: true,
      message: `Master Daily Cron executed successfully for ${users.length} users and ${dueTransactions.length} recurring transactions.`,
    });
  } catch (error: any) {
    console.error('[Cron Route] Master Daily Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
