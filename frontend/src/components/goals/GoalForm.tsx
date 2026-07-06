import { useState } from 'react';
import Button from '../ui/Button';

type GoalFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: {
    name: string;
    targetAmount: number;
    deadline?: string;
  };
  onCancel: () => void;
  onSubmit: (values: { name: string; targetAmount: number; deadline?: string }) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
};

export default function GoalForm({
  title,
  description,
  submitLabel,
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: GoalFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialValues?.targetAmount?.toString() || '');
  const [deadline, setDeadline] = useState(
    initialValues?.deadline ? new Date(initialValues.deadline).toISOString().split('T')[0] : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) return;
    
    await onSubmit({
      name: name.trim(),
      targetAmount: Number(targetAmount),
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
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
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Goal Name</span>
          <input
            type="text"
            required
            placeholder="e.g. New Laptop"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Amount</span>
          <input
            type="number"
            required
            min="1"
            placeholder="e.g. 15000000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Deadline (Optional)</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim() || !targetAmount}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
