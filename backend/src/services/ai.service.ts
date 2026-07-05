import OpenAI from 'openai';
import prisma from '../lib/prisma';
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY || '',
});

const DEFAULT_MODEL = process.env.AI_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free';

const tools: ChatCompletionTool[] = [
  // --- ACCOUNTS ---
  {
    type: 'function',
    function: {
      name: 'get_accounts',
      description: 'Melihat daftar metode pembayaran, dompet, atau rekening milik user beserta saldonya.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_account',
      description: 'Membuat akun atau dompet baru (bank, ewallet, cash, dll).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama akun/rekening (misal: BCA, Gopay)' },
          type: { type: 'string', enum: ['bank', 'ewallet', 'cash', 'investment', 'other'], description: 'Tipe akun' },
          initialBalance: { type: 'number', description: 'Saldo awal (default 0)' },
        },
        required: ['name', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_account',
      description: 'Mengubah nama atau tipe dompet/rekening.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'UUID akun' },
          name: { type: 'string', description: 'Nama baru' },
          type: { type: 'string', enum: ['bank', 'ewallet', 'cash', 'investment', 'other'], description: 'Tipe baru' },
        },
        required: ['id'],
      },
    },
  },

  // --- CATEGORIES ---
  {
    type: 'function',
    function: {
      name: 'get_categories',
      description: 'Melihat daftar kategori pengeluaran dan pemasukan milik user beserta UUID dan tipenya.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_category',
      description: 'Membuat kategori keuangan baru.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama kategori' },
          type: { type: 'string', enum: ['income', 'expense'], description: 'Tipe kategori' },
        },
        required: ['name', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_category',
      description: 'Mengubah nama atau tipe kategori.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'UUID kategori' },
          name: { type: 'string', description: 'Nama baru' },
          type: { type: 'string', enum: ['income', 'expense'], description: 'Tipe baru' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_category',
      description: 'Menghapus kategori. WAJIB MINTA KONFIRMASI KE USER TERLEBIH DAHULU SEBELUM MEMANGGIL TOOL INI!',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID kategori yang akan dihapus' } },
        required: ['id'],
      },
    },
  },

  // --- TRANSACTIONS ---
  {
    type: 'function',
    function: {
      name: 'record_transaction',
      description: 'Mencatat transaksi baru (income, expense, atau transfer) ke database.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Nominal transaksi (angka positif)' },
          type: { type: 'string', enum: ['income', 'expense', 'transfer'], description: 'Tipe transaksi' },
          categoryId: { type: 'string', description: 'UUID kategori valid (kosongkan jika transfer)' },
          accountId: { type: 'string', description: 'UUID akun atau dompet asal' },
          toAccountId: { type: 'string', description: 'UUID akun tujuan (wajib diisi jika tipe transfer)' },
          description: { type: 'string', description: 'Keterangan transaksi' },
          transactionDate: { type: 'string', description: 'Tanggal transaksi dalam format ISO (YYYY-MM-DD)' },
        },
        required: ['amount', 'type', 'accountId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_transactions',
      description: 'Mencari atau melihat riwayat transaksi terakhir milik user berdasarkan filter tertentu.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['income', 'expense', 'transfer'], description: 'Filter tipe transaksi' },
          categoryId: { type: 'string', description: 'Filter UUID kategori' },
          month: { type: 'string', description: 'Format YYYY-MM (misal 2026-07)' },
          search: { type: 'string', description: 'Kata kunci pencarian pada deskripsi' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_transaction',
      description: 'Mengubah nominal atau deskripsi transaksi yang sudah ada.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'UUID transaksi' },
          amount: { type: 'number', description: 'Nominal baru' },
          description: { type: 'string', description: 'Deskripsi baru' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_transaction',
      description: 'Menghapus transaksi. WAJIB MINTA KONFIRMASI KE USER TERLEBIH DAHULU SEBELUM MEMANGGIL TOOL INI!',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID transaksi yang akan dihapus' } },
        required: ['id'],
      },
    },
  },

  // --- BUDGETS ---
  {
    type: 'function',
    function: {
      name: 'get_budgets',
      description: 'Melihat daftar anggaran bulanan (budget target & terpakai) per kategori.',
      parameters: {
        type: 'object',
        properties: { month: { type: 'string', description: 'Format YYYY-MM. Kosongkan untuk bulan saat ini.' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'upsert_budget',
      description: 'Menetapkan atau mengubah batas anggaran pengeluaran bulanan untuk suatu kategori.',
      parameters: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', description: 'UUID kategori pengeluaran' },
          month: { type: 'number', description: 'Bulan (angka 1-12)' },
          year: { type: 'number', description: 'Tahun (misal 2026)' },
          amount: { type: 'number', description: 'Batas anggaran (nominal)' },
        },
        required: ['categoryId', 'month', 'year', 'amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_budget',
      description: 'Menghapus anggaran bulanan. WAJIB MINTA KONFIRMASI KE USER TERLEBIH DAHULU SEBELUM MEMANGGIL TOOL INI!',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID anggaran' } },
        required: ['id'],
      },
    },
  },

  // --- GOALS ---
  {
    type: 'function',
    function: {
      name: 'get_goals',
      description: 'Melihat daftar target tabungan impian (savings goals) dan persentase progresnya.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Membuat target tabungan impian baru (savings goal).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama impian (misal: Beli Laptop)' },
          targetAmount: { type: 'number', description: 'Nominal target tabungan' },
          deadline: { type: 'string', description: 'Tanggal target ISO (YYYY-MM-DD)' },
          color: { type: 'string', description: 'Kode warna hex (misal: #3B82F6)' },
        },
        required: ['name', 'targetAmount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_goal',
      description: 'Menghapus target tabungan impian. WAJIB MINTA KONFIRMASI KE USER TERLEBIH DAHULU SEBELUM MEMANGGIL TOOL INI!',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID tabungan impian' } },
        required: ['id'],
      },
    },
  },

  // --- RECURRING & ROUTINES ---
  {
    type: 'function',
    function: {
      name: 'get_recurring_transactions',
      description: 'Melihat daftar transaksi berulang otomatis (recurring transactions).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_recurring_transaction',
      description: 'Membuat jadwal transaksi berulang otomatis.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Nominal transaksi' },
          type: { type: 'string', enum: ['income', 'expense', 'transfer'], description: 'Tipe transaksi' },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'], description: 'Frekuensi' },
          nextRunDate: { type: 'string', description: 'Tanggal eksekusi berikutnya (YYYY-MM-DD)' },
          accountId: { type: 'string', description: 'UUID akun asal' },
          categoryId: { type: 'string', description: 'UUID kategori' },
          description: { type: 'string', description: 'Keterangan' },
        },
        required: ['amount', 'type', 'frequency', 'nextRunDate', 'accountId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_recurring_transaction',
      description: 'Menghapus jadwal transaksi berulang. WAJIB MINTA KONFIRMASI KE USER TERLEBIH DAHULU SEBELUM MEMANGGIL TOOL INI!',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID recurring transaction' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_routines',
      description: 'Melihat daftar rutinitas alokasi gajian / dana cair (1-click routines).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_routine',
      description: 'Membuat rutinitas alokasi gajian 1-klik baru.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama rutinitas (misal: Alokasi Gajian)' },
          description: { type: 'string', description: 'Deskripsi singkat' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                description: { type: 'string' },
                accountId: { type: 'string' },
                toAccountId: { type: 'string' },
              },
              required: ['amount', 'accountId', 'toAccountId'],
            },
            description: 'Daftar transfer dalam rutinitas',
          },
        },
        required: ['name', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'execute_routine',
      description: 'Menjalankan eksekusi rutinitas alokasi gajian berdasarkan UUID rutinitas.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID rutinitas' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_routine',
      description: 'Menghapus rutinitas alokasi gajian. WAJIB MINTA KONFIRMASI KE USER TERLEBIH DAHULU SEBELUM MEMANGGIL TOOL INI!',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'UUID rutinitas' } },
        required: ['id'],
      },
    },
  },

  // --- ANALYTICS ---
  {
    type: 'function',
    function: {
      name: 'get_historical_summary',
      description: 'Melihat ringkasan total pemasukan dan pengeluaran beberapa bulan terakhir untuk analisis tren.',
      parameters: {
        type: 'object',
        properties: { months: { type: 'number', description: 'Jumlah bulan (default 6)' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_category_summary',
      description: 'Melihat rincian pengeluaran per kategori untuk menganalisis pengeluaran terbesar atau boros.',
      parameters: {
        type: 'object',
        properties: { month: { type: 'string', description: 'Format YYYY-MM' } },
      },
    },
  },
];

async function getAccountsWithBalances(userId: string) {
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

async function executeTool(userId: string, toolName: string, args: Record<string, any>) {
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
      const { amount, type, categoryId, accountId, toAccountId, description, transactionDate } = args;
      const parsedDate = transactionDate ? new Date(transactionDate) : new Date();

      const trx = await prisma.transaction.create({
        data: {
          userId,
          amount: Number(amount),
          type,
          categoryId: type === 'transfer' ? null : categoryId || null,
          accountId,
          toAccountId: type === 'transfer' ? toAccountId || null : null,
          description: description || (type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : 'Transfer'),
          transactionDate: parsedDate,
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

    default:
      throw new Error(`Tool ${toolName} tidak dikenali`);
  }
}

export async function processAIChat(
  userId: string,
  message: string,
  history: ChatCompletionMessageParam[] = [],
  image?: string
) {
  const [accounts, categories] = await Promise.all([
    getAccountsWithBalances(userId),
    prisma.category.findMany({ where: { userId }, select: { id: true, name: true, type: true } }),
  ]);

  const accountMapping = accounts.map((a: any) => `[ID: "${a.id}" | ${a.name} (${a.type}) - Saldo Nyata Saat Ini: ${a.formattedBalance}]`).join('\n');
  const categoryMapping = categories.map((c) => `[ID: "${c.id}" | ${c.name} (${c.type})]`).join('\n');
  
  const nowWIB = new Date();
  const dateStrWIB = nowWIB.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStrWIB = nowWIB.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  });
  const isoDateWIB = new Date(nowWIB.getTime() + 7 * 3600 * 1000).toISOString().split('T')[0];
  const currentTimeWIB = `${dateStrWIB}, pukul ${timeStrWIB} WIB (ISO Date: ${isoDateWIB})`;

  const systemInstruction = `Kamu adalah Asisten Keuangan Pribadi yang cerdas, ramah, dan proaktif di dalam aplikasi Personal Finance Tracker.
Waktu Sistem saat ini: ${currentTimeWIB}.

ATURAN DAN GAYA BAHASA:
1. Gunakan Bahasa Indonesia yang santai, ringkas, natural, dan tambahkan emoji secukupnya.
2. Kamu sanggup memahami bahasa gaul, singkatan, serta typo dari user (misal: "mkn" -> makan, "gpy" -> gopay, "bli" -> beli).
3. PENTING - ATURAN JUJUR, SALDO & TANGGAL TRANSAKSI:
   - JANGAN PERNAH bilang "berhasil dicatat", "sudah dicatat", atau "sudah disimpan" JIKA KAMU BELUM SECARA NYATA MEMANGGIL TOOL record_transaction! Kalau kamu baru mau menanyakan akun pembayaran atau kategori, katakan saja: "Mau dicatat pakai akun apa dan kategori apa?" JANGAN PERNAH MENGKLAIM SUDAH DICATAT!
   - JANGAN PERNAH menebak, mengira-ngira, atau menghitung matematika sendiri untuk saldo akun! Saldo nyata setiap akun tertera dengan jelas di DAFTAR METODE PEMBAYARAN VALID di bawah (contoh: "- Saldo Nyata Saat Ini: -Rp 118.000"). Bacalah saldo tersebut apa adanya dengan jujur! Jika saldo minus (-Rp 118.000), katakan dengan jujur -Rp 118.000!
   - ATURAN TANGGAL: Saat memanggil tool record_transaction, jika user tidak menyebutkan tanggal spesifik, gunakan format ISO (YYYY-MM-DD) yang sesuai dengan Waktu Sistem saat ini (${isoDateWIB}). JANGAN PERNAH menukar bulan dan hari (misal 5 Juli adalah 2026-07-05, BUKAN 2026-05-07)!
4. ATURAN PENUTUP TRANSAKSI:
   Setelah kamu memanggil tool record_transaction dan tool berhasil dieksekusi oleh sistem, sistem akan otomatis meracik balasan ringkasan. Kamu tidak perlu membuat balasan halusinasi sendiri!
5. ATURAN SCAN STRUK BELANJA (RECEIPT OCR):
   Jika membaca foto struk belanja, PENTING: JANGAN panggil tool record_transaction secara langsung! Balas pesan user dengan menyebutkan Total Harga dan Kategori/Tipe transaksi yang ditebak, lalu TANYAKAN apakah nominalnya sudah benar dan pakai akun apa ke akun apa sebelum mencatatnya.
6. ATURAN TRANSAKSI TRANSFER (SINGLE TRANSFER RULE):
   Jika user memindahkan uang antar akun (transfer/topup), WAJIB gunakan tool record_transaction dengan type: 'transfer'. PENTING: JANGAN PERNAH mencatat transfer sebagai 2 transaksi terpisah (income & expense). Transfer WAJIB DAN HANYA DICATAT 1 KALI!
7. Jika nominal atau akun asal belum disebutkan, TANYAKAN dengan ramah tanpa menebak-nebak atau memanggil tool.
8. Jika hasil tool record_transaction mengembalikan budgetStatus dan persentase penggunaan >= 70%, berikan peringatan santai namun tegas tentang sisa anggaran bulan ini.
9. ATURAN PENGHAPUSAN & UBAH DATA (DELETE & UPDATE):
   Jika user meminta menghapus atau mengubah data penting (transaksi, anggaran, tabungan, akun, rutinitas, kategori, recurring transaction), KAMU WAJIB BERTANYA SEKALI LAGI untuk meminta konfirmasi secara jelas kepada user (sebutkan nama/detail data yang akan dihapus). JANGAN MEMANGGIL TOOL DELETE ATAU UPDATE JIKA USER BELUM MEMBERIKAN KONFIRMASI TEGAS (misal: 'Ya, hapus' atau 'Benar, lanjutkan').

DAFTAR KATEGORI VALID:
${categoryMapping}

DAFTAR METODE PEMBAYARAN VALID:
${accountMapping}`;

  const userContent: any = image
    ? [
        { type: 'text', text: message || 'Tolong baca dan catat struk ini' },
        { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` } },
      ]
    : message;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...history.slice(-6),
    { role: 'user', content: userContent },
  ];

  const modelsToTry = image
    ? [process.env.AI_VISION_MODEL || 'qwen/qwen-2-vl-72b-instruct:free', 'openrouter/free']
    : Array.from(new Set([DEFAULT_MODEL, 'nvidia/nemotron-3-nano-30b-a3b:free', 'openrouter/free', 'qwen/qwen-2.5-coder-32b-instruct:free', 'meta-llama/llama-3.3-70b-instruct:free']));

  const executedTools: string[] = [];
  let currentMessages = [...messages];
  let finalResponseText = '';

  for (let iteration = 0; iteration < 4; iteration++) {
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await openai.chat.completions.create({
          model: modelName,
          messages: currentMessages,
          tools,
          tool_choice: 'auto',
          temperature: 0.3,
        });
        if (response && response.choices && response.choices.length > 0) {
          break; // Sukses mendapatkan balasan dari model ini
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Service] Gagal dengan model ${modelName}: ${err.message || err}. Mencoba model fallback berikutnya...`);
      }
    }

    if (!response || !response.choices || response.choices.length === 0) {
      throw lastError || new Error('Semua model AI gagal memberikan balasan.');
    }

    const choice = response.choices[0];
    const messageObj = choice.message;

    if (messageObj.tool_calls && messageObj.tool_calls.length > 0) {
      currentMessages.push(messageObj);

      for (const toolCall of messageObj.tool_calls) {
        const fnName = (toolCall as any).function.name;
        let fnArgs: any = {};
        try {
          let rawArgs = (toolCall as any).function.arguments || '{}';
          // Bersihkan trailing comma yang sering dibuat model LLM kecil (misal: {"a": 1, })
          rawArgs = rawArgs.replace(/,\s*([\]}])/g, '$1');
          fnArgs = JSON.parse(rawArgs);
        } catch (parseErr: any) {
          console.warn(`[AI] Malformed JSON arguments for ${fnName}:`, (toolCall as any).function.arguments);
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: `Format JSON argumen tidak valid (${parseErr.message}). Tolong panggil ulang tool dengan JSON argumen yang benar tanpa trailing comma.` }),
          });
          continue;
        }

        executedTools.push(fnName);

        try {
          const toolResult = await executeTool(userId, fnName, fnArgs);
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });

          if (fnName === 'record_transaction' && (toolResult as any).transaction) {
            const trx = (toolResult as any).transaction;
            const b = (toolResult as any).budgetStatus;
            const amtStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.amount);
            const trxType = trx.type === 'income' ? 'Pemasukan 💰' : trx.type === 'expense' ? 'Pengeluaran 💸' : 'Transfer 🔄';
            let reply = `✅ **${trxType} Berhasil Dicatat!**\n\n`;
            reply += `📝 **Keterangan:** ${trx.description}\n`;
            reply += `💵 **Nominal:** ${amtStr}\n`;
            if (trx.category?.name) reply += `🏷️ **Kategori:** ${trx.category.name}\n`;
            if (trx.account?.name) reply += `💳 **Akun:** ${trx.account.name}\n`;
            if (trx.toAccount?.name) reply += `🎯 **Ke Akun:** ${trx.toAccount.name}\n`;
            reply += `📅 **Tanggal:** ${new Date(trx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;

            if (b && b.percentage >= 70) {
              reply += `\n⚠️ **Peringatan Anggaran (${b.categoryName}):**\n`;
              reply += `Penggunaan bulan ini sudah mencapai **${b.percentage}%** (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.spent)} / ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.limit)}). Yuk hemat-hemat! 🛑`;
            }

            finalResponseText = reply;
            break;
          } else if (fnName === 'delete_transaction') {
            finalResponseText = '🗑️ **Transaksi Berhasil Dihapus!** Data keuangan kamu sudah diperbarui ya. ✅';
            break;
          }
        } catch (error: any) {
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message || 'Gagal mengeksekusi tool' }),
          });
        }
      }
    } else {
      finalResponseText = messageObj.content || '';
      break;
    }
  }

  if (!finalResponseText && currentMessages.length > 0) {
    const lastMsg = currentMessages[currentMessages.length - 1];
    if ('content' in lastMsg && typeof lastMsg.content === 'string') {
      finalResponseText = lastMsg.content;
    } else {
      finalResponseText = 'Permintaan berhasil diproses.';
    }
  }

  return {
    response: finalResponseText,
    executedTools,
  };
}
