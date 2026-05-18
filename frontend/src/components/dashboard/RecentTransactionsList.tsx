import CategoryTypeBadge from '../ui/CategoryTypeBadge';
import type { Transaction } from '../../types/transaction';
import { formatCurrency, formatDate } from '../../utils/formatters';

type RecentTransactionsListProps = {
  transactions: Transaction[];
};

function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Transactions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The latest income and expense records.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            No transactions yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Your latest records will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';

            return (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {transaction.category.name}
                    </p>
                    <CategoryTypeBadge type={transaction.type} />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {transaction.description || 'No description'}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>

                <p
                  className={`text-sm font-bold ${
                    isIncome ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentTransactionsList;