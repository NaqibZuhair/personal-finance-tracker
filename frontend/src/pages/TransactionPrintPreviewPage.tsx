import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { apiClient } from '../lib/apiClient';
import type { Transaction } from '../types/transaction';
import { formatCurrency, formatDate } from '../utils/formatters';
import CategoryTypeBadge from '../components/ui/CategoryTypeBadge';

type TransactionsResponse = {
  data: Transaction[];
};

export default function TransactionPrintPreviewPage() {
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenWidthCheck = window.innerWidth < 768;
    return userAgentCheck || screenWidthCheck;
  });

  useEffect(() => {
    const handleResize = () => {
      const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const screenWidthCheck = window.innerWidth < 768;
      setIsMobile(userAgentCheck || screenWidthCheck);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const query = searchParams.toString();
        const endpoint = query ? `/transactions?${query}` : '/transactions';
        const response = await apiClient<TransactionsResponse>(endpoint);
        setTransactions(response.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load transaction data for preview.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [searchParams]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const val = Number(t.amount) || 0;
      if (t.type === 'income') income += val;
      if (t.type === 'expense') expense += val;
    });

    return {
      income,
      expense,
      net: income - expense,
    };
  }, [transactions]);

  const filterText = useMemo(() => {
    const month = searchParams.get('month');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const parts: string[] = [];
    if (month) parts.push(`Month: ${month}`);
    if (type) parts.push(`Type: ${type.toUpperCase()}`);
    if (search) parts.push(`Keyword: "${search}"`);
    return parts.length > 0 ? parts.join(' | ') : 'All Time History';
  }, [searchParams]);

  if (isMobile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 font-sans text-white">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <span className="mt-4 inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400 border border-purple-500/20">
            Khusus Layar Desktop
          </span>

          <h2 className="mt-3 text-2xl font-black text-white tracking-tight">
            Tampilan Spreadsheet Khusus Desktop
          </h2>
          
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Fitur <strong className="text-slate-200">Spreadsheet Report Preview</strong> ini didesain khusus untuk layar lebar (Desktop / Laptop) agar format cetak PDF dokumen finansial yang dihasilkan 100% sempurna tanpa kolom terpotong.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-left text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Akses Alternatif di Mobile:
            </div>
            <p className="pl-6">
              Silakan akses tautan ini melalui komputer atau langsung unduh berkas spreadsheet Excel di bawah ini untuk dibuka di ponsel Anda.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                const exportParams = new URLSearchParams(searchParams);
                exportParams.set('format', 'xlsx');
                window.open(`${import.meta.env.VITE_API_BASE_URL}/transactions/export?${exportParams.toString()}`, '_blank');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Berkas Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.history.back();
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tutup / Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#090d16] p-6 font-sans">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-lg text-center max-w-sm w-full">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <h3 className="mt-4 font-bold text-slate-800 dark:text-white">Generating Preview...</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Preparing clean spreadsheet layout for printing.</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#090d16] p-6 font-sans">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-lg text-center max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 font-bold text-slate-800 dark:text-white">Preview Error</h3>
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{errorMessage}</p>
          <button
            onClick={() => window.close()}
            className="mt-6 rounded-xl bg-slate-800 dark:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-700 dark:hover:bg-slate-600 transition"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans pb-12 print:bg-white print:text-black">
      {/* Top Floating Action Bar (Hidden in Print) */}
      <div className="no-print sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.history.back();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Close Preview
            </button>
            <span className="text-sm font-bold text-slate-700 dark:text-white hidden sm:inline">
              Spreadsheet Report Preview
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const exportParams = new URLSearchParams(searchParams);
                exportParams.set('format', 'xlsx');
                window.open(`${import.meta.env.VITE_API_BASE_URL}/transactions/export?${exportParams.toString()}`, '_blank');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-500 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="print-area mx-auto mt-6 max-w-6xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 print:bg-white print:border-slate-200 p-8 shadow-xl sm:p-12 transition-all duration-200">
        {/* Document Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 dark:border-slate-800 print:border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-black text-xl shadow-md">
                Rp
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white print:text-black tracking-tight">
                  Personal Finance Tracker
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 print:text-primary-600">
                  Executive Financial Spreadsheet Report
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 print:text-slate-500 space-y-1">
            <p><span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-700">Filter Scope:</span> {filterText}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-700">Total Records:</span> {transactions.length} transactions</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-300 print:text-slate-700">Generated Date:</span> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 print:bg-emerald-50/50 print:border-emerald-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 print:text-emerald-700">Total Income</p>
            <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-700 font-mono">+{formatCurrency(summary.income)}</p>
          </div>
          <div className="rounded-xl border border-rose-100 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10 print:bg-rose-50/50 print:border-rose-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 print:text-rose-700">Total Expense</p>
            <p className="mt-1 text-xl font-bold text-rose-700 dark:text-rose-400 print:text-rose-700 font-mono">-{formatCurrency(summary.expense)}</p>
          </div>
          <div className="rounded-xl border border-primary-100 dark:border-primary-500/20 bg-primary-50/50 dark:bg-primary-500/10 print:bg-primary-50/50 print:border-primary-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-400 print:text-primary-700">Net Flow / Balance</p>
            <p className="mt-1 text-xl font-bold text-primary-700 dark:text-primary-400 print:text-primary-700 font-mono">{formatCurrency(summary.net)}</p>
          </div>
        </div>

        {/* The Clean Spreadsheet Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 print:border-slate-200 text-left text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 print:bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-slate-700 border-b border-slate-200 dark:border-slate-800 print:border-slate-200">
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-3 py-3 w-12 text-center">No.</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3">Date</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3">Type</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3">Category</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3">Account</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3">Description</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                    No transaction records found matching the criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t, index) => {
                  const isIncome = t.type === 'income';
                  const isTransfer = t.type === 'transfer';
                  return (
                    <tr key={t.id} className="even:bg-slate-50/50 dark:even:bg-slate-800/40 print:even:bg-slate-50/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 print:hover:bg-slate-100/50 transition-colors">
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-3 py-3 text-center font-mono text-xs text-slate-500 dark:text-slate-400 print:text-slate-500">
                        {index + 1}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3 font-medium text-slate-700 dark:text-slate-300 print:text-slate-700 whitespace-nowrap">
                        {formatDate(t.transactionDate)}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3">
                        <CategoryTypeBadge type={t.type} />
                      </td>
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3 text-slate-700 dark:text-slate-300 print:text-slate-700 font-medium">
                        {isTransfer ? 'Transfer' : t.category?.name ?? 'Uncategorized'}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3 text-slate-600 dark:text-slate-400 print:text-slate-600">
                        {isTransfer
                          ? `${t.account?.name ?? '?'} → ${t.toAccount?.name ?? '?'}`
                          : t.account?.name ?? '-'}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3 text-slate-600 dark:text-slate-400 print:text-slate-600 max-w-xs truncate">
                        {t.description || '-'}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-800 print:border-slate-200 px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400 print:text-emerald-600'
                              : isTransfer
                                ? 'text-primary-600 dark:text-primary-400 print:text-primary-600'
                                : 'text-rose-600 dark:text-rose-400 print:text-rose-600'
                          }
                        >
                          {isIncome ? '+' : isTransfer ? '' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Document Footer Note */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 print:border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 print:text-slate-400 gap-2">
          <p>Confidential Financial Record &bull; Personal Finance Tracker App</p>
          <p>End of Report &bull; Total Items: {transactions.length}</p>
        </div>
      </div>
    </div>
  );
}
