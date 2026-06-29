import type { Category, CategoryType } from '../../types/category';
import Button from '../ui/Button';
import type { Account } from '../../types/account';

export type TransactionFiltersValue = {
  type: CategoryType | '';
  categoryId: string;
  accountId: string;
  month: string;
  search: string;
};

type TransactionFiltersProps = {
  categories: Category[];
  accounts: Account[];
  value: TransactionFiltersValue;
  onChange: (value: TransactionFiltersValue) => void;
  onReset: () => void;
};

function TransactionFilters({
  categories,
  accounts,
  value,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  const filteredCategories = value.type
    ? categories.filter((category) => category.type === value.type)
    : categories;

  function updateFilter(
    key: keyof TransactionFiltersValue,
    nextValue: string,
  ) {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Filter Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Narrow records by type, category, month, or description keyword.
          </p>
        </div>

        <Button type="button" variant="secondary" onClick={onReset}>
          Reset Filter
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <select
            value={value.type}
            onChange={(event) => {
              onChange({
                ...value,
                type: event.target.value as CategoryType | '',
                categoryId: '',
              });
            }}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            value={value.categoryId}
            onChange={(event) => updateFilter('categoryId', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="">All categories</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-medium text-slate-700">Account</span>
          <select
            value={value.accountId}
            onChange={(event) => updateFilter('accountId', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Month</span>
          <input
            type="month"
            value={value.month}
            onChange={(event) => updateFilter('month', event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Search</span>
          <input
            type="text"
            value={value.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search description"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </label>
      </div>
    </div>
  );
}

export default TransactionFilters;