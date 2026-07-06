import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { apiClient } from '../../lib/apiClient';
import type { Category } from '../../types/category';

type BudgetFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  month: string; // YYYY-MM
  initialValues?: {
    categoryId: string;
    amount: number;
  };
  onCancel: () => void;
  onSubmit: (values: { categoryId: string; amount: number; month: number; year: number }) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
};

export default function BudgetForm({
  title,
  description,
  submitLabel,
  month,
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId || '');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiClient<{ data: Category[] }>('/categories');
        setCategories(response.data.filter(c => c.type === 'expense'));
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;
    
    const [yearStr, monthStr] = month.split('-');
    
    await onSubmit({
      categoryId,
      amount: Number(amount),
      month: parseInt(monthStr, 10),
      year: parseInt(yearStr, 10),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/50 p-4 text-sm text-red-600 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoadingCategories || !!initialValues?.categoryId}
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40 disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget Limit</span>
          <input
            type="number"
            required
            min="1"
            placeholder="e.g. 500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !categoryId || !amount}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
