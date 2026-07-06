import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { TransactionType } from '../../types/transaction';
import type { Category } from '../../types/category';
import Button from '../ui/Button';
import type { Account } from '../../types/account';
import TagAutocomplete from '../ui/TagAutocomplete';

export type TransactionFormValues = {
  type: TransactionType;
  amount: number;
  description: string;
  tags?: string[];
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
  const [tags, setTags] = useState<string[]>(
    initialValues?.tags ?? [],
  );
  const [tagInput, setTagInput] = useState('');
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
    setTags(initialValues.tags ?? []);
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

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

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

    // If there is lingering tag input, add it before submitting
    let finalTags = [...tags];
    if (tagInput.trim()) {
      const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (cleanTag && !finalTags.includes(cleanTag)) {
        finalTags.push(cleanTag);
      }
    }

    await onSubmit({
      type,
      amount: numericAmount,
      description: description.trim(),
      tags: finalTags,
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
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-200"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Transaction Details
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Record one income or expense transaction with category and multi-dimensional labels.
        </p>
      </div>

      {visibleError && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          {visibleError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Transaction Type
          </span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>

        {type !== 'transfer' && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isSubmitting || filteredCategories.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
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
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </span>
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            disabled={isSubmitting || accounts.length === 0}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
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
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">To Account</span>
            <select
              value={toAccountId}
              onChange={(event) => setToAccountId(event.target.value)}
              disabled={isSubmitting || accounts.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
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
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Example: 25000"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Transaction Date
          </span>
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
          />
        </label>

        <div className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tags / Labels (#Tag)
          </span>
          <div className="mt-2 flex flex-wrap gap-2 items-center rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 transition focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/30">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 shadow-2xs transition hover:scale-105"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isSubmitting}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition ml-0.5 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
            <div className="flex-1 min-w-[140px]">
              <TagAutocomplete
                value={tagInput}
                onChange={(val) => setTagInput(val)}
                onSelectTag={(selectedTag) => {
                  const cleanTag = selectedTag.replace(/^#/, '').toLowerCase();
                  if (cleanTag && !tags.includes(cleanTag)) {
                    setTags([...tags, cleanTag]);
                  }
                  setTagInput('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={tags.length === 0 ? "Type tag and press Enter (e.g. #food, #work)" : "Add tag..."}
                disabled={isSubmitting}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 px-1 py-1"
                excludeTags={tags}
              />
            </div>
            {tagInput && (
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-700 transition active:scale-95"
              >
                Add
              </button>
            )}
          </div>
        </div>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: Makan siang, gaji bulanan, ojek ke kampus"
            disabled={isSubmitting}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-900/30 dark:disabled:bg-slate-800/50"
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