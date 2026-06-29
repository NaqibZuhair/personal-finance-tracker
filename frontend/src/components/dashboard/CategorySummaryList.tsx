import { formatCurrency } from '../../utils/formatters';

export type CategorySummaryItem = {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
};

type CategorySummaryListProps = {
  totalExpense: number;
  categories: CategorySummaryItem[];
};

function CategorySummaryList({
  totalExpense,
  categories,
}: CategorySummaryListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Expense by Category
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          See where most of your money went this month.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            No expense data for this month
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add expense transactions to see category insights.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Expense
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.categoryId}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {category.categoryName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {category.percentage}% of total expense
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-expense-700">
                    {formatCurrency(category.total)}
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-expense-500"
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySummaryList;