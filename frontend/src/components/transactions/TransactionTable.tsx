import { Fragment, useMemo } from 'react';
import CategoryTypeBadge from '../ui/CategoryTypeBadge';
import Button from '../ui/Button';
import type { Transaction } from '../../types/transaction';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ButtonLink from '../ui/ButtonLink';

type TransactionTableProps = {
  transactions: Transaction[];
  pendingDeleteId: string;
  deletingTransactionId: string;
  onRequestDelete: (transactionId: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (transactionId: string) => void;
};

function TransactionTable({
  transactions,
  pendingDeleteId,
  deletingTransactionId,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: TransactionTableProps) {
  // Group transactions by date string (YYYY-MM-DD)
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    transactions.forEach((t) => {
      // Use YYYY-MM-DD as group key
      const dateKey = new Date(t.transactionDate).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    // Sort date keys descending
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => {
      const groupTrx = groups[key];
      const totalIncome = groupTrx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = groupTrx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Formatted header date e.g. "Tuesday, July 14, 2026"
      const dateObj = new Date(`${key}T00:00:00.000Z`);
      const formattedHeaderDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);

      return {
        dateKey: key,
        formattedHeaderDate,
        transactions: groupTrx,
        totalIncome,
        totalExpense,
      };
    });
  }, [transactions]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Transaction Records
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A complete list of income, expense, and transfer transactions grouped by day.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
            No transactions found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Start recording your transactions or change the selected filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Account</th>
                <th className="px-6 py-4 font-semibold">Description & Tags</th>
                <th className="px-6 py-4 text-right font-semibold">Amount</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {groupedTransactions.map((group) => (
                <Fragment key={group.dateKey}>
                  {/* Daily Header Row */}
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-t border-b border-slate-200/80 dark:border-slate-700/80">
                    <td colSpan={7} className="px-6 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            {group.formattedHeaderDate}
                          </span>
                          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {group.transactions.length} trx
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {group.totalIncome > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs">
                              <span>Income:</span>
                              <span>+{formatCurrency(group.totalIncome)}</span>
                            </span>
                          )}
                          {group.totalExpense > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20 shadow-2xs">
                              <span>Expense:</span>
                              <span>-{formatCurrency(group.totalExpense)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Transactions for this date */}
                  {group.transactions.map((transaction) => {
                    const isIncome = transaction.type === 'income';
                    const isPendingDelete = pendingDeleteId === transaction.id;
                    const isDeleting = deletingTransactionId === transaction.id;

                    return (
                      <tr
                        key={transaction.id}
                        className="align-top transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                          {formatDate(transaction.transactionDate)}
                        </td>

                        <td className="px-6 py-4">
                          <CategoryTypeBadge type={transaction.type} />
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {transaction.category?.name ?? 'Transfer'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {transaction.categoryId ? `ID: ${transaction.categoryId.slice(0, 8)}` : '-'}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {transaction.type === 'transfer'
                                ? `${transaction.account?.name ?? '?'} → ${transaction.toAccount?.name ?? '?'}`
                                : transaction.account?.name ?? 'No account'}
                            </span>

                            {transaction.account?.type && (
                              <span className="text-xs capitalize text-slate-400 dark:text-slate-500">
                                {transaction.account.type}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          <div className="max-w-xs text-slate-800 dark:text-slate-200 font-normal">
                            {transaction.description || '-'}
                          </div>

                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {transaction.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-500/20 shadow-2xs transition hover:scale-105"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {isPendingDelete && (
                            <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4 shadow-sm dark:border-rose-500/30 dark:bg-slate-800">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                Delete this transaction?
                              </p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                This action cannot be undone.
                              </p>

                              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="px-3 py-2"
                                  onClick={onCancelDelete}
                                  disabled={isDeleting}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  type="button"
                                  variant="danger"
                                  className="px-3 py-2"
                                  onClick={() => onConfirmDelete(transaction.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              transaction.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : transaction.type === 'transfer'
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : transaction.type === 'transfer' ? '' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <ButtonLink
                              to={`/transactions/${transaction.id}/edit`}
                              variant="secondary"
                              className="px-3 py-2 text-xs"
                            >
                              Edit
                            </ButtonLink>

                            <Button
                              type="button"
                              variant="danger"
                              className="px-3 py-2 text-xs"
                              onClick={() => onRequestDelete(transaction.id)}
                              disabled={isDeleting}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionTable;