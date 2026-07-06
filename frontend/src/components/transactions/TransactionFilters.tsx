import type { Category, CategoryType } from '../../types/category';
import Button from '../ui/Button';
import type { Account } from '../../types/account';
import TagAutocomplete from '../ui/TagAutocomplete';

export type TransactionFiltersValue = {
  type: CategoryType | '';
  categoryId: string;
  accountId: string;
  month: string;
  search: string;
  tag: string;
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

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-primary-900/30 placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="relative z-30 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-200">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Filter Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Narrow records by type, category, account, month, keyword, or tag (#).
          </p>
        </div>

        <Button type="button" variant="secondary" onClick={onReset}>
          Reset Filter
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <label className="block">
          <span className={labelClass}>Type</span>
          <select
            value={value.type}
            onChange={(event) => {
              onChange({
                ...value,
                type: event.target.value as CategoryType | '',
                categoryId: '',
              });
            }}
            className={inputClass}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Category</span>
          <select
            value={value.categoryId}
            onChange={(event) => updateFilter('categoryId', event.target.value)}
            className={inputClass}
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
          <span className={labelClass}>Account</span>
          <select
            value={value.accountId}
            onChange={(event) => updateFilter('accountId', event.target.value)}
            className={inputClass}
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
          <span className={labelClass}>Month</span>
          <input
            type="month"
            value={value.month}
            onChange={(event) => updateFilter('month', event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Search</span>
          <input
            type="text"
            value={value.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search keyword..."
            className={inputClass}
          />
        </label>

        <label className="block relative z-50">
          <span className={labelClass}>Tag (#)</span>
          <TagAutocomplete
            value={value.tag || ''}
            onChange={(val) => updateFilter('tag', val.replace(/^#/, ''))}
            placeholder="e.g. food, work..."
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}

export default TransactionFilters;