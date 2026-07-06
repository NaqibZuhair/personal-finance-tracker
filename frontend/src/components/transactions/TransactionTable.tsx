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
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Transaction Records
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A complete list of income, expense, and transfer transactions with tags.
        </p>
      </div>

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
            {transactions.map((transaction) => {
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionTable;