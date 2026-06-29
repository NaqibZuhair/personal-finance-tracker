import cron from 'node-cron';
import prisma from '../lib/prisma';

export function initCronJobs() {
  // Run every day at 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('Running recurring transactions cron job...');
    try {
      const today = new Date();
      // find active recurring transactions where nextRunDate <= today
      const dueTransactions = await prisma.recurringTransaction.findMany({
        where: {
          isActive: true,
          nextRunDate: {
            lte: today,
          },
        },
      });

      for (const recurring of dueTransactions) {
        // Create the actual transaction
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

        // Calculate next run date based on frequency
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

        // Update the recurring transaction
        await prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: { nextRunDate: nextDate },
        });
      }
      
      if (dueTransactions.length > 0) {
        console.log(`Processed ${dueTransactions.length} recurring transactions.`);
      }
    } catch (error) {
      console.error('Error running recurring transactions cron job:', error);
    }
  });
}
