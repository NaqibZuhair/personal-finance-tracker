import cron from 'node-cron';
import prisma from '../lib/prisma';
import {
  generateAndSendMorningBriefing,
  generateAndSendWeekendGuard,
  generateAndSendMonthlyReport,
} from '../services/notification.service';

export function initFinancialAlertCronJobs() {
  console.log('[Cron] Initializing Financial Alert & Briefing Cron Jobs...');

  cron.schedule('0 7 * * *', async () => {
    console.log('[Cron] Running Proactive Morning Briefing...');
    try {
      const users = await prisma.user.findMany({
        where: {
          waPhone: { not: null },
        },
        select: { id: true, name: true },
      });

      console.log(`[Cron] Found ${users.length} users with WhatsApp linked for Morning Briefing.`);
      for (const user of users) {
        await generateAndSendMorningBriefing(user.id);
      }
    } catch (error) {
      console.error('[Cron] Error running Proactive Morning Briefing:', error);
    }
  });

  cron.schedule('0 17 * * 5', async () => {
    console.log('[Cron] Running Weekend Spending Guard...');
    try {
      const users = await prisma.user.findMany({
        where: {
          waPhone: { not: null },
        },
        select: { id: true },
      });

      for (const user of users) {
        await generateAndSendWeekendGuard(user.id);
      }
    } catch (error) {
      console.error('[Cron] Error running Weekend Spending Guard:', error);
    }
  });

  cron.schedule('0 9 1 * *', async () => {
    console.log('[Cron] Running Monthly Executive Summary...');
    try {
      const users = await prisma.user.findMany({
        where: {
          waPhone: { not: null },
        },
        select: { id: true },
      });

      for (const user of users) {
        await generateAndSendMonthlyReport(user.id);
      }
    } catch (error) {
      console.error('[Cron] Error running Monthly Executive Summary:', error);
    }
  });

  console.log('[Cron] All Financial Alert & Briefing schedules registered successfully! 🚀');
}
