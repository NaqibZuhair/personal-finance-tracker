import { useEffect, useState } from 'react';
import type { CategoryType } from '../../types/category';
import Button from '../ui/Button';

type CategoryFormValues = {
  name: string;
  type: CategoryType;
};

type CategoryFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: CategoryFormValues;
  onCancel: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string;
};

function CategoryForm({
  title,
  description,
  submitLabel,
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [type, setType] = useState<CategoryType>(
    initialValues?.type ?? 'expense',
  );
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setName(initialValues?.name ?? '');
    setType(initialValues?.type ?? 'expense');
    setLocalError('');
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setLocalError('Category name is required');
      return;
    }

    setLocalError('');

    await onSubmit({
      name: trimmedName,
      type,
    });
  }

  const visibleError = localError || errorMessage;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {visibleError && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {visibleError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Category Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Food, Salary, Transport"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Category Type
          </span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as CategoryType)}
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default CategoryForm;