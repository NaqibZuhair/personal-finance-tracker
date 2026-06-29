import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { apiClient } from '../../lib/apiClient';
import type { Category } from '../../types/category';
import type { Account } from '../../types/account';
import type { TransactionType } from '../../types/transaction';
import type { RecurringFrequency } from '../../services/recurringService';

type RecurringFormProps = {
  title: string;
  submitLabel: string;
  initialValues?: {
    type: TransactionType;
    amount: number;
    description: string;
    frequency: RecurringFrequency;
    nextRunDate: string;
    categoryId?: string | null;
    accountId: string;
    toAccountId?: string | null;
  };
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
};

export default function RecurringForm({
  title,
  submitLabel,
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringFormProps) {
  const [type, setType] = useState<TransactionType>(initialValues?.type || 'expense');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialValues?.frequency || 'monthly');
  const [nextRunDate, setNextRunDate] = useState(
    initialValues?.nextRunDate ? new Date(initialValues.nextRunDate).toISOString().split('T')[0] : ''
  );
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId || '');
  const [accountId, setAccountId] = useState(initialValues?.accountId || '');
  const [toAccountId, setToAccountId] = useState(initialValues?.toAccountId || '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, accRes] = await Promise.all([
          apiClient<{ data: Category[] }>('/categories'),
          apiClient<{ data: Account[] }>('/accounts'),
        ]);
        setCategories(catRes.data);
        setAccounts(accRes.data);
      } catch (err) {
        console.error('Failed to load form data', err);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      type,
      amount: Number(amount),
      description,
      frequency,
      nextRunDate: new Date(nextRunDate).toISOString(),
      categoryId: type === 'transfer' ? null : categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : null,
    });
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
            >
              <option value="expense">Expense (e.g. Netflix, Rent)</option>
              <option value="income">Income (e.g. Salary, Interest)</option>
              <option value="transfer">Transfer (e.g. Auto-save)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Frequency</span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Amount</span>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Next Run Date</span>
            <input
              type="date"
              required
              value={nextRunDate}
              onChange={(e) => setNextRunDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
            />
          </label>

          {type !== 'transfer' && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
              >
                <option value="" disabled>Select category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">{type === 'transfer' ? 'From Account' : 'Account'}</span>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
            >
              <option value="" disabled>Select account</option>
              {accounts.filter(a => a.isActive).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>

          {type === 'transfer' && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">To Account</span>
              <select
                required
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
              >
                <option value="" disabled>Select destination</option>
                {accounts.filter(a => a.isActive && a.id !== accountId).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
          )}
          
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Description (Optional)</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
