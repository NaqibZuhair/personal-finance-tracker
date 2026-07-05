import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const tools: ChatCompletionTool[] = [
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
