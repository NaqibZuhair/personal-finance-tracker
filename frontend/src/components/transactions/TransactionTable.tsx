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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Transaction Records
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A complete list of income and expense transactions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-225 text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Account</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 text-right font-semibold">Amount</th>
              <th className="px-6 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const isPendingDelete = pendingDeleteId === transaction.id;
              const isDeleting = deletingTransactionId === transaction.id;

              return (
                <tr
                  key={transaction.id}
                  className="align-top transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(transaction.transactionDate)}
                  </td>

                  <td className="px-6 py-4">
                    <CategoryTypeBadge type={transaction.type} />
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {transaction.category.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        ID: {transaction.categoryId.slice(0, 8)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {transaction.account?.name ?? 'No account'}
                      </span>

                      {transaction.account?.type && (
                        <span className="text-xs capitalize text-slate-400">
                          {transaction.account.type}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="max-w-xs">
                      {transaction.description || '-'}
                    </div>

                    {isPendingDelete && (
                      <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">
                          Delete this transaction?
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
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

                  <td
                    className={`px-6 py-4 text-right text-sm font-semibold ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>

                  <td className="px-6 py-4 text-right">
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