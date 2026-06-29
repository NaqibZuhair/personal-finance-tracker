import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { TransactionType } from '../../types/transaction';
import type { Category } from '../../types/category';
import Button from '../ui/Button';
import type { Account } from '../../types/account';

export type TransactionFormValues = {
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
};

type TransactionFormProps = {
  categories: Category[];
  accounts: Account[];
  initialValues?: TransactionFormValues;
  submitLabel?: string;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function TransactionForm({
  categories,
  accounts,
  initialValues,
  submitLabel = 'Save Transaction',
  onSubmit,
  isSubmitting,
  errorMessage,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    initialValues?.type ?? 'expense',
  );
  const [amount, setAmount] = useState(
    initialValues ? String(initialValues.amount) : '',
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? '',
  );
  const [transactionDate, setTransactionDate] = useState(
    initialValues?.transactionDate ?? getTodayDate(),
  );
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [localError, setLocalError] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  const [accountId, setAccountId] = useState(initialValues?.accountId ?? '');
  const [toAccountId, setToAccountId] = useState(initialValues?.toAccountId ?? '');

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    setType(initialValues.type);
    setAmount(String(initialValues.amount));
    setDescription(initialValues.description);
    setTransactionDate(initialValues.transactionDate);
    setCategoryId(initialValues.categoryId ?? '');
    setLocalError('');
    setAccountId(initialValues.accountId);
    setToAccountId(initialValues.toAccountId ?? '');
  }, [initialValues]);

  useEffect(() => {
    const selectedCategoryStillValid = filteredCategories.some(
      (category) => category.id === categoryId,
    );

    if (!selectedCategoryStillValid) {
      setCategoryId(filteredCategories[0]?.id ?? '');
    }
  }, [filteredCategories, categoryId]);

  useEffect(() => {
    const selectedAccountStillValid = accounts.some(
      (account) => account.id === accountId && account.isActive,
    );

    if (!selectedAccountStillValid) {
      const firstActiveAccount = accounts.find((account) => account.isActive);
      setAccountId(firstActiveAccount?.id ?? '');
    }
  }, [accounts, accountId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (type !== 'transfer' && !categoryId) {
      setLocalError('Please select a category');
      return;
    }

    if (type === 'transfer') {
      if (!toAccountId) {
        setLocalError('Please select a destination account');
        return;
      }
      if (accountId === toAccountId) {
        setLocalError('Source and destination accounts must be different');
        return;
      }
    }

    if (!numericAmount || numericAmount <= 0) {
      setLocalError('Amount must be greater than 0');
      return;
    }

    if (!transactionDate) {
      setLocalError('Transaction date is required');
      return;
    }

    if (!accountId) {
      setLocalError('Please select an account');
      return;
    }

    setLocalError('');

    await onSubmit({
      type,
      amount: numericAmount,
      description: description.trim(),
      transactionDate,
      categoryId: type === 'transfer' ? undefined : categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
    });
  }

  const visibleError = localError || errorMessage;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Transaction Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Record one income or expense transaction with a clear category and date.
        </p>
      </div>

      {visibleError && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {visibleError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Transaction Type
          </span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>

        {type !== 'transfer' && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isSubmitting || filteredCategories.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {filteredCategories.length === 0 ? (
                <option value="">No category available</option>
              ) : (
                filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </label>
        )}

        <label>
          <span className="text-sm font-medium text-slate-700">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </span>
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            disabled={isSubmitting || accounts.length === 0}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {accounts.length === 0 ? (
              <option value="">No account available</option>
            ) : (
              accounts
                .filter((account) => account.isActive)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))
            )}
          </select>
        </label>

        {type === 'transfer' && (
          <label>
            <span className="text-sm font-medium text-slate-700">To Account</span>
            <select
              value={toAccountId}
              onChange={(event) => setToAccountId(event.target.value)}
              disabled={isSubmitting || accounts.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">Select destination</option>
              {accounts
                .filter((account) => account.isActive && account.id !== accountId)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Example: 25000"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Transaction Date
          </span>
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: Makan siang, gaji bulanan, ojek ke kampus"
            disabled={isSubmitting}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default TransactionForm;