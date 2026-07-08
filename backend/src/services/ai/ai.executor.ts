import prisma from '../../lib/prisma';

export async function getAccountsWithBalances(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    orderBy: { name: 'asc' },
  });

  const [txOut, txIn, trIn] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['accountId'],
      where: { userId, type: { in: ['expense', 'transfer'] } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['accountId'],
      where: { userId, type: 'income' },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['toAccountId'],
      where: { userId, type: 'transfer', toAccountId: { not: null } },
      _sum: { amount: true },
    }),
  ]);

  const outMap = new Map(txOut.map((t) => [t.accountId, Number(t._sum.amount || 0)]));
  const inMap = new Map(txIn.map((t) => [t.accountId, Number(t._sum.amount || 0)]));
  const trInMap = new Map(trIn.map((t) => [t.toAccountId!, Number(t._sum.amount || 0)]));

  return accounts.map((acc) => {
    const init = Number(acc.initialBalance);
    const inc = inMap.get(acc.id) || 0;
    const exp = outMap.get(acc.id) || 0;
    const tIn = trInMap.get(acc.id) || 0;
    const currentBalance = init + inc - exp + tIn;
    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      currentBalance,
      formattedBalance: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(currentBalance),
    };
  });
}

export async function getUserUniqueTags(userId: string): Promise<string[]> {
  const txs = await prisma.transaction.findMany({
    where: { userId, tags: { isEmpty: false } },
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  txs.forEach((tx) => {
    if (tx.tags && Array.isArray(tx.tags)) {
      tx.tags.forEach((t) => typeof t === 'string' && tagSet.add(t.toLowerCase().trim()));
    }
  });
  return Array.from(tagSet).sort();
}

export async function executeTool(userId: string, toolName: string, args: Record<string, any>) {
  switch (toolName) {
    // --- ACCOUNTS ---
    case 'get_accounts': {
      return await getAccountsWithBalances(userId);
    }
    case 'create_account': {
      return await prisma.account.create({
        data: {
          name: args.name,
          type: args.type,
          initialBalance: Number(args.initialBalance || 0),
          userId,
        },
      });
    }
    case 'update_account': {
      return await prisma.account.update({
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          type: args.type || undefined,
        },
      });
    }

    // --- CATEGORIES ---
    case 'get_categories': {
      return await prisma.category.findMany({
        where: { userId },
        select: { id: true, name: true, type: true },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });
    }
    case 'create_category': {
      return await prisma.category.create({
        data: { name: args.name, type: args.type, userId },
      });
    }
    case 'update_category': {
      return await prisma.category.update({
        where: { id: args.id },
        data: { name: args.name || undefined, type: args.type || undefined },
      });
    }
    case 'delete_category': {
      await prisma.category.delete({ where: { id: args.id } });
      return { message: 'Kategori berhasil dihapus' };
    }

    // --- TRANSACTIONS ---
    case 'record_transaction': {
      const { amount, type, categoryId, accountId, toAccountId, description, merchantName, lineItems, transactionDate, tags } = args;
      const parsedDate = transactionDate ? new Date(transactionDate) : new Date();

      const cleanTags = Array.isArray(tags)
        ? tags
            .map((t: any) => (typeof t === 'string' ? t.replace(/^#/, '').toLowerCase().trim() : ''))
            .filter(Boolean)
        : [];

      const trx = await prisma.transaction.create({
        data: {
          userId,
          amount: Number(amount),
          type,
          categoryId: type === 'transfer' ? null : categoryId || null,
          accountId,
          toAccountId: type === 'transfer' ? toAccountId || null : null,
          description: description || (type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : 'Transfer'),
          merchantName: merchantName || null,
          lineItems: lineItems || null,
          transactionDate: parsedDate,
          tags: cleanTags,
        },
        include: {
          category: { select: { name: true } },
          account: { select: { name: true } },
          toAccount: { select: { name: true } },
        },
      });

      let budgetStatus = null;
      if (type === 'expense' && categoryId) {
        const monthInput = parsedDate.toISOString().substring(0, 7);
        const [yearStr, monthStr] = monthInput.split('-');
        const yearNum = parseInt(yearStr, 10);
        const monthNum = parseInt(monthStr, 10);

        const budget = await prisma.budget.findFirst({
          where: { userId, categoryId, month: monthNum, year: yearNum },
        });

        if (budget) {
          const startDate = new Date(`${monthInput}-01T00:00:00.000Z`);
          const endDate = new Date(startDate);
          endDate.setUTCMonth(endDate.getUTCMonth() + 1);

          const spentAgg = await prisma.transaction.aggregate({
            where: { userId, categoryId, type: 'expense', transactionDate: { gte: startDate, lt: endDate } },
            _sum: { amount: true },
          });

          const spent = Number(spentAgg._sum.amount || 0);
          const limit = Number(budget.amount);
          const cat = await prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } });

          budgetStatus = {
            limit,
            spent,
            remaining: limit - spent,
            percentage: Math.round((spent / limit) * 100),
            categoryName: cat?.name || 'Kategori',
          };
        }
      }

      return { transaction: trx, budgetStatus };
    }
    case 'get_transactions': {
      const where: any = { userId };
      if (args.type) where.type = args.type;
      if (args.categoryId) where.categoryId = args.categoryId;
      if (args.search) where.description = { contains: args.search, mode: 'insensitive' };
      if (args.month) {
        const startDate = new Date(`${args.month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setUTCMonth(endDate.getUTCMonth() + 1);
        where.transactionDate = { gte: startDate, lt: endDate };
      }
      if (args.tag) {
        where.tags = { has: args.tag.replace(/^#/, '').toLowerCase().trim() };
      }

      return await prisma.transaction.findMany({
        where,
        include: {
          category: { select: { name: true } },
          account: { select: { name: true } },
        },
        orderBy: { transactionDate: 'desc' },
        take: 15,
      });
    }
    case 'update_transaction': {
      return await prisma.transaction.update({
        where: { id: args.id },
        data: {
          amount: args.amount ? Number(args.amount) : undefined,
          description: args.description || undefined,
        },
      });
    }
    case 'delete_transaction': {
      await prisma.transaction.delete({ where: { id: args.id } });
      return { message: 'Transaksi berhasil dihapus' };
    }

    // --- BUDGETS ---
    case 'get_budgets': {
      const monthInput = args.month || new Date().toISOString().substring(0, 7);
      const [yearStr, monthStr] = monthInput.split('-');
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      const budgets = await prisma.budget.findMany({
        where: { userId, month: monthNum, year: yearNum },
      });

      const categories = await prisma.category.findMany({
        where: { userId },
        select: { id: true, name: true },
      });
      const catMap = new Map(categories.map((c) => [c.id, c.name]));

      const startDate = new Date(`${monthInput}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);

      const expenses = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: 'expense', transactionDate: { gte: startDate, lt: endDate }, categoryId: { not: null } },
        _sum: { amount: true },
      });

      const spentMap = new Map<string, number>();
      expenses.forEach((e) => {
        if (e.categoryId) spentMap.set(e.categoryId, Number(e._sum.amount || 0));
      });

      return budgets.map((b) => {
        const spent = spentMap.get(b.categoryId) || 0;
        const limit = Number(b.amount);
        return {
          id: b.id,
          categoryName: catMap.get(b.categoryId) || 'Unknown',
          limit,
          spent,
          remaining: limit - spent,
          percentage: Math.round((spent / limit) * 100),
        };
      });
    }
    case 'upsert_budget': {
      return await prisma.budget.upsert({
        where: {
          categoryId_month_year: {
            categoryId: args.categoryId,
            month: Number(args.month),
            year: Number(args.year),
          },
        },
        update: { amount: Number(args.amount) },
        create: {
          categoryId: args.categoryId,
          month: Number(args.month),
          year: Number(args.year),
          amount: Number(args.amount),
          userId,
        },
      });
    }
    case 'delete_budget': {
      await prisma.budget.delete({ where: { id: args.id } });
      return { message: 'Anggaran berhasil dihapus' };
    }

    // --- GOALS ---
    case 'get_goals': {
      const goals = await prisma.savingsGoal.findMany({
        where: { userId },
        orderBy: { deadline: 'asc' },
      });

      return goals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.targetAmount),
        deadline: g.deadline,
      }));
    }
    case 'create_goal': {
      return await prisma.$transaction(async (tx) => {
        const account = await tx.account.create({
          data: {
            name: `Goal: ${args.name}`,
            type: 'goal',
            initialBalance: 0,
            isActive: true,
            userId,
          },
        });

        return await tx.savingsGoal.create({
          data: {
            name: args.name,
            targetAmount: Number(args.targetAmount),
            deadline: args.deadline || null,
            color: args.color || '#3B82F6',
            accountId: account.id,
            userId,
          },
        });
      });
    }
    case 'delete_goal': {
      const goal = await prisma.savingsGoal.findUnique({ where: { id: args.id } });
      if (!goal || goal.userId !== userId) throw new Error('Goal tidak ditemukan');
      await prisma.account.delete({ where: { id: goal.accountId } });
      return { message: 'Tabungan impian berhasil dihapus' };
    }

    // --- RECURRING & ROUTINES ---
    case 'get_recurring_transactions': {
      return await prisma.recurringTransaction.findMany({
        where: { userId },
        include: { category: { select: { name: true } }, account: { select: { name: true } } },
      });
    }
    case 'create_recurring_transaction': {
      return await prisma.recurringTransaction.create({
        data: {
          amount: Number(args.amount),
          type: args.type,
          frequency: args.frequency,
          nextRunDate: new Date(args.nextRunDate),
          accountId: args.accountId,
          categoryId: args.categoryId || null,
          description: args.description || '',
          userId,
        },
      });
    }
    case 'delete_recurring_transaction': {
      await prisma.recurringTransaction.delete({ where: { id: args.id } });
      return { message: 'Transaksi berulang berhasil dihapus' };
    }
    case 'get_routines': {
      return await prisma.allocationRoutine.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              account: { select: { name: true } },
              toAccount: { select: { name: true } },
            },
          },
        },
      });
    }
    case 'create_routine': {
      return await prisma.allocationRoutine.create({
        data: {
          name: args.name,
          description: args.description || '',
          userId,
          items: {
            create: args.items.map((it: any) => ({
              amount: Number(it.amount),
              description: it.description || '',
              accountId: it.accountId,
              toAccountId: it.toAccountId,
            })),
          },
        },
      });
    }
    case 'execute_routine': {
      const { id } = args;
      const routine = await prisma.allocationRoutine.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!routine || routine.userId !== userId) {
        throw new Error('Rutinitas alokasi tidak ditemukan');
      }

      if (routine.items.length === 0) {
        throw new Error('Rutinitas tidak memiliki daftar transfer');
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
              userId,
            },
            include: {
              account: { select: { name: true } },
              toAccount: { select: { name: true } },
            },
          })
        )
      );

      return {
        routineName: routine.name,
        transfersExecuted: transactions.length,
        transactions,
      };
    }
    case 'delete_routine': {
      await prisma.allocationRoutine.delete({ where: { id: args.id } });
      return { message: 'Rutinitas alokasi berhasil dihapus' };
    }

    case 'get_historical_summary': {
      const monthsCount = Number(args.months || 6);
      const results = [];
      const now = new Date();

      for (let i = 0; i < monthsCount; i++) {
        const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        const monthStr = targetDate.toISOString().substring(0, 7);
        const startDate = new Date(`${monthStr}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setUTCMonth(endDate.getUTCMonth() + 1);

        const totals = await prisma.transaction.groupBy({
          by: ['type'],
          where: { userId, transactionDate: { gte: startDate, lt: endDate } },
          _sum: { amount: true },
        });

        let income = 0;
        let expense = 0;
        totals.forEach((t) => {
          if (t.type === 'income') income = Number(t._sum.amount || 0);
          if (t.type === 'expense') expense = Number(t._sum.amount || 0);
        });

        results.push({ month: monthStr, income, expense, netSavings: income - expense });
      }

      return results;
    }
    case 'get_category_summary': {
      const monthStr = args.month || new Date().toISOString().substring(0, 7);
      const startDate = new Date(`${monthStr}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);

      const totals = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: 'expense', transactionDate: { gte: startDate, lt: endDate }, categoryId: { not: null } },
        _sum: { amount: true },
      });

      const categories = await prisma.category.findMany({
        where: { userId, id: { in: totals.map((t) => t.categoryId!).filter(Boolean) } },
        select: { id: true, name: true },
      });

      const catMap = new Map(categories.map((c) => [c.id, c.name]));

      return totals.map((t) => ({
        categoryId: t.categoryId,
        categoryName: catMap.get(t.categoryId!) || 'Unknown',
        totalExpense: Number(t._sum.amount || 0),
      })).sort((a, b) => b.totalExpense - a.totalExpense);
    }
    case 'save_user_memory': {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { aiMemory: true } });
      let currentMem = user?.aiMemory ? `${user.aiMemory}\n- ${args.memory}` : `- ${args.memory}`;
      if (currentMem.length > 1000) {
        currentMem = currentMem.slice(0, 1000);
      }
      await prisma.user.update({
        where: { id: userId },
        data: { aiMemory: currentMem },
      });
      return { message: '🧠 Habit / catatan berhasil disimpan ke dalam Memori Jangka Panjang AI (Batas 1000 karakter terjaga)!', savedMemory: args.memory };
    }

    default:
      throw new Error(`Tool ${toolName} tidak dikenali`);
  }
}

export async function getUserAIMemoryAndHabits(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { aiMemory: true, name: true } });
  
  // Hitung habit belanja 30 hari terakhir
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTrx = await prisma.transaction.findMany({
    where: { userId, type: 'expense', transactionDate: { gte: thirtyDaysAgo } },
    select: { amount: true, description: true, merchantName: true, category: { select: { name: true } } },
    orderBy: { transactionDate: 'desc' },
    take: 50,
  });

  const totalSpent = recentTrx.reduce((acc, t) => acc + Number(t.amount), 0);
  const avgDaily = Math.round(totalSpent / 30);
  
  // Cari kategori & merchant tersering
  const catCounts: Record<string, number> = {};
  const merchCounts: Record<string, number> = {};
  recentTrx.forEach((t) => {
    const cat = t.category?.name || 'Lainnya';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
    if (t.merchantName) {
      merchCounts[t.merchantName] = (merchCounts[t.merchantName] || 0) + 1;
    }
  });

  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Belum ada';
  const topMerch = Object.entries(merchCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Belum ada';

  let habitReport = `[STATISTIK HABIT 30 HARI TERAKHIR]:\n`;
  habitReport += `- Total Pengeluaran 30 Hari: Rp ${totalSpent.toLocaleString('id-ID')}\n`;
  habitReport += `- Rata-rata Pengeluaran Harian: Rp ${avgDaily.toLocaleString('id-ID')}\n`;
  habitReport += `- Kategori Paling Sering: "${topCat}"\n`;
  habitReport += `- Tempat/Merchant Paling Sering: "${topMerch}"\n\n`;
  habitReport += `[CATATAN KHUSUS & INGATAN JANGKA PANJANG AI (AI MEMORY)]:\n`;
  habitReport += user?.aiMemory || 'Belum ada catatan memori khusus yang disimpan oleh user.';

  return habitReport;
}
