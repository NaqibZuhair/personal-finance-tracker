import CategoryTypeBadge from '../ui/CategoryTypeBadge';
import type { Transaction } from '../../types/transaction';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import ButtonLink from '../ui/ButtonLink';

type RecentTransactionsListProps = {
  transactions: Transaction[];
};

function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <ButtonLink to="/transactions" variant="secondary" className="text-sm">
          View All
        </ButtonLink>
      </CardHeader>

      <CardContent className="flex-1">
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No transactions yet
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your latest records will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
            {transactions.slice(0, 10).map((transaction) => {
              const isIncome = transaction.type === 'income';

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all duration-200"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {transaction.type === 'transfer'
                          ? `Transfer to ${transaction.toAccount?.name ?? 'Unknown'}`
                          : transaction.category?.name ?? 'Unknown'}
                      </p>
                      <CategoryTypeBadge type={transaction.type} />
                    </div>

                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 font-normal">
                      {transaction.description || 'No description'}
                    </p>

                    {transaction.tags && transaction.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {transaction.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-500/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(transaction.transactionDate)}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-bold whitespace-nowrap ${
                      transaction.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : transaction.type === 'transfer'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : transaction.type === 'transfer' ? '' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentTransactionsList;