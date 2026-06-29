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
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              No transactions yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your latest records will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
            {transactions.slice(0, 10).map((transaction) => {
              const isIncome = transaction.type === 'income';

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {transaction.type === 'transfer'
                          ? `Transfer to ${transaction.toAccount?.name ?? 'Unknown'}`
                          : transaction.category?.name ?? 'Unknown'}
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
                      transaction.type === 'income'
                        ? 'text-income-700'
                        : transaction.type === 'transfer'
                          ? 'text-transfer-700'
                          : 'text-expense-700'
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