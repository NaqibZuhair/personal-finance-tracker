import prisma from '../lib/prisma';
import { sendWhatsAppMessage } from './wa.service';

export async function checkAndNotifyBudgetAlert(
  userId: string,
  categoryId: string | null
): Promise<void> {
  if (!categoryId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, waPhone: true },
    });

    if (!user || !user.waPhone) return;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budget = await prisma.budget.findUnique({
      where: {
        categoryId_month_year: {
          categoryId,
          month: currentMonth,
          year: currentYear,
        },
      },
      include: { category: true },
    });

    if (!budget) return;

    const budgetAmount = Number(budget.amount);
    if (budgetAmount <= 0) return;

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const agg = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: 'expense',
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    const totalSpent = Number(agg._sum.amount || 0);
    const percentage = Math.round((totalSpent / budgetAmount) * 100);

    if (percentage >= 80) {
      const remaining = Math.max(0, budgetAmount - totalSpent);
      let statusIcon = '⚠️';
      let statusTitle = 'PERINGATAN BUDGET OVERSPEND (80% LIMIT)';
      if (percentage >= 100) {
        statusIcon = '🚨';
        statusTitle = 'BUDGET BULANAN HABIS / JEBOL!';
      }

      const message = `${statusIcon} *${statusTitle}*\n\nHalo ${user.name},\nPengeluaranmu untuk kategori *"${budget.category.name}"* bulan ini sudah mencapai *${percentage}%* dari batas budget!\n\n• Budget Bulanan: Rp ${budgetAmount.toLocaleString('id-ID')}\n• Terpakai: Rp ${totalSpent.toLocaleString('id-ID')}\n• Sisa Budget: Rp ${remaining.toLocaleString('id-ID')}\n\nYuk rem dulu pengeluaran di kategori ini agar target keuanganmu tetap aman!`;

      await sendWhatsAppMessage(user.waPhone, message);
    }
  } catch (error) {
    console.error('[Notification Engine] Error in checkAndNotifyBudgetAlert:', error);
  }
}

export async function checkAndNotifyGoalMilestone(
  userId: string,
  accountId: string
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, waPhone: true },
    });

    if (!user || !user.waPhone) return;

    const goal = await prisma.savingsGoal.findUnique({
      where: { accountId },
      include: { account: true },
    });

    if (!goal) return;

    const aggIn = await prisma.transaction.aggregate({
      where: { toAccountId: accountId, userId },
      _sum: { amount: true },
    });
    const aggOut = await prisma.transaction.aggregate({
      where: { accountId, userId },
      _sum: { amount: true },
    });

    const currentBalance = Number(aggIn._sum.amount || 0) - Number(aggOut._sum.amount || 0);
    const targetAmount = Number(goal.targetAmount);
    if (targetAmount <= 0) return;

    const percentage = Math.round((currentBalance / targetAmount) * 100);

    if (percentage >= 100 || percentage === 80 || percentage === 50) {
      let icon = '🎉';
      let title = 'MILESTONE GOAL TERCAPAI!';
      if (percentage >= 100) {
        icon = '🏆';
        title = 'GOAL SEPENUHNYA TERCAPAI (100%)!';
      }

      const message = `${icon} *${title}*\n\nHalo ${user.name},\nTarget tabungan *"${goal.name}"* baru saja menyentuh *${percentage}%*!\n\n• Terkumpul: Rp ${currentBalance.toLocaleString('id-ID')}\n• Target: Rp ${targetAmount.toLocaleString('id-ID')}\n\nKonsistensimu luar biasa! Pertahankan kebiasaan menabung yang hebat ini! 💪✨`;

      await sendWhatsAppMessage(user.waPhone, message);
    }
  } catch (error) {
    console.error('[Notification Engine] Error in checkAndNotifyGoalMilestone:', error);
  }
}

export async function generateAndSendMorningBriefing(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, waPhone: true, aiMemory: true },
    });

    if (!user || !user.waPhone) return;

    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    const transactionTotals = await prisma.transaction.groupBy({
      by: ['accountId', 'type'],
      where: { userId },
      _sum: { amount: true },
    });

    const transferInTotals = await prisma.transaction.groupBy({
      by: ['toAccountId'],
      where: {
        type: 'transfer',
        toAccountId: { not: null },
        userId,
      },
      _sum: { amount: true },
    });

    const balanceMap = new Map<string, { income: number; expense: number; transferOut: number; transferIn: number }>();
    for (const total of transactionTotals) {
      const existing = balanceMap.get(total.accountId) ?? { income: 0, expense: 0, transferOut: 0, transferIn: 0 };
      const amt = Number(total._sum?.amount ?? 0);
      if (total.type === 'income') existing.income += amt;
      if (total.type === 'expense') existing.expense += amt;
      if (total.type === 'transfer') existing.transferOut += amt;
      balanceMap.set(total.accountId, existing);
    }
    for (const total of transferInTotals) {
      if (!total.toAccountId) continue;
      const existing = balanceMap.get(total.toAccountId) ?? { income: 0, expense: 0, transferOut: 0, transferIn: 0 };
      existing.transferIn += Number(total._sum?.amount ?? 0);
      balanceMap.set(total.toAccountId, existing);
    }

    // Daily Spending Balance: sum of currentBalance where includeInTotal !== false
    let dailySpendingBalance = 0;
    const accountCurrentBalanceMap = new Map<string, number>();

    for (const account of accounts) {
      const totals = balanceMap.get(account.id) ?? { income: 0, expense: 0, transferOut: 0, transferIn: 0 };
      const currentBal = Number(account.initialBalance) + totals.income - totals.expense - totals.transferOut + totals.transferIn;
      accountCurrentBalanceMap.set(account.id, currentBal);

      if (account.includeInTotal !== false) {
        dailySpendingBalance += currentBal;
      }
    }

    // 2. Fetch Savings Goals
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      include: { account: true },
    });

    let goalsNote = '• 🎯 *Daftar Goal Tabungan:* Belum ada goal aktif. Yuk buat goal pertamamu!';
    if (savingsGoals.length > 0) {
      const goalLines = savingsGoals.map((goal) => {
        const currentSaved = accountCurrentBalanceMap.get(goal.accountId) ?? 0;
        const target = Number(goal.targetAmount);
        const percent = target > 0 ? Math.round((currentSaved / target) * 100) : 0;
        return `   - *${goal.name}*: Rp ${currentSaved.toLocaleString('id-ID')} / Rp ${target.toLocaleString('id-ID')} (${percent}%)`;
      });
      goalsNote = `• 🎯 *Daftar Goal Tabungan Kamu:*\n${goalLines.join('\n')}`;
    }

    // 3. Due Routines / Tagihan
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const dueRoutines = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextRunDate: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(tomorrow.setHours(23, 59, 59, 999)),
        },
      },
    });

    let routineNote = '• 🔔 *Tagihan Rutin:* Tidak ada yang jatuh tempo hari ini.';
    if (dueRoutines.length > 0) {
      const names = dueRoutines.map((r) => `${r.description || 'Tagihan'} (Rp ${Number(r.amount).toLocaleString('id-ID')})`).join(', ');
      routineNote = `• ⚠️ *Tagihan Jatuh Tempo:* ${names}`;
    }

    const memoryNote = user.aiMemory ? `\n\n🧠 *Catatan AI untukmu:* "${user.aiMemory.slice(0, 150)}..."` : '';

    const message = `☀️ *PROACTIVE MORNING BRIEFING*\n\nSelamat pagi ${user.name}! Semoga harimu menyenangkan dan produktif.\n\n• 💰 *Saldo Harian Siap Pakai (Daily Spending):* Rp ${dailySpendingBalance.toLocaleString('id-ID')}\n• 💡 *Saran Pengeluaran Hari Ini:* Maksimal *Rp 50.000* hari ini untuk segala kebutuhanmu.\n• 🌱 *Ingatan Menabung:* Jangan lupa untuk menyisihkan sebagian uangmu untuk masa depan!\n${goalsNote}\n${routineNote}${memoryNote}\n\nKetik langsung di sini jika ingin mencatat transaksi atau konsultasi keuangan hari ini! 🚀`;

    await sendWhatsAppMessage(user.waPhone, message);
  } catch (error) {
    console.error('[Notification Engine] Error in generateAndSendMorningBriefing:', error);
  }
}

export async function generateAndSendWeekendGuard(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, waPhone: true },
    });

    if (!user || !user.waPhone) return;

    const now = new Date();

    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const aggWeek = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        transactionDate: { gte: monday, lte: now },
      },
      _sum: { amount: true },
    });
    const spentWeek = Number(aggWeek._sum.amount || 0);

    const message = `🎉 *WEEKEND SPENDING GUARD*\n\nHappy Friday sore ${user.name}! 🌅\nSebelum menikmati liburan akhir pekan, ingat ya pengeluaranmu dari Senin sampai Jumat ini sudah mencapai *Rp ${spentWeek.toLocaleString('id-ID')}*.\n\n💡 *Tips Akhir Pekan:* Tetapkan batas maksimal jajan akhir pekan ini agar target tabunganmu tidak terganggu oleh pengeluaran impulsif! Selamat berlibur! ✨`;

    await sendWhatsAppMessage(user.waPhone, message);
  } catch (error) {
    console.error('[Notification Engine] Error in generateAndSendWeekendGuard:', error);
  }
}

export async function generateAndSendMonthlyReport(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, waPhone: true },
    });

    if (!user || !user.waPhone) return;

    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastYear = lastMonthDate.getFullYear();
    const monthName = lastMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const startOfLastMonth = new Date(lastYear, lastMonth - 1, 1);
    const endOfLastMonth = new Date(lastYear, lastMonth, 0, 23, 59, 59, 999);

    const aggIn = await prisma.transaction.aggregate({
      where: { userId, type: 'income', transactionDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    });
    const aggOut = await prisma.transaction.aggregate({
      where: { userId, type: 'expense', transactionDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    });

    const totalIncome = Number(aggIn._sum.amount || 0);
    const totalExpense = Number(aggOut._sum.amount || 0);
    const netSavings = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    let evalNote = '📈 Performa bulan lalu luar biasa karena kamu berhasil menabung!';
    if (netSavings < 0) {
      evalNote = '⚠️ Bulan lalu pengeluaranmu melebihi pemasukan (Defisit). Yuk lebih disiplin bulan ini!';
    }

    const message = `📊 *MONTHLY EXECUTIVE SUMMARY*\n\nHalo ${user.name}! Berikut adalah evaluasi performa keuanganmu untuk bulan *${monthName}*:\n\n• 📥 Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}\n• 📤 Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}\n• 💰 Bersih Disimpan: Rp ${netSavings.toLocaleString('id-ID')} (${savingRate}% Saving Rate)\n\n${evalNote}\n\nSelamat memasuki bulan yang baru! Mari susun budget dan capai target keuanganmu! 🚀`;

    await sendWhatsAppMessage(user.waPhone, message);
  } catch (error) {
    console.error('[Notification Engine] Error in generateAndSendMonthlyReport:', error);
  }
}
