import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import TransactionForm from '../components/transactions/TransactionForm';
import type { TransactionFormValues } from '../components/transactions/TransactionForm';
import PageHeader from '../components/ui/PageHeader';
import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';

type CategoriesResponse = {
  data: Category[];
};

type CreateTransactionResponse = {
  message: string;
  data: Transaction;
};

function NewTransactionPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);
        setCategoryErrorMessage('');

        const response = await apiClient<CategoriesResponse>('/categories');

        setCategories(response.data);
      } catch (error) {
        setCategoryErrorMessage(
          error instanceof Error ? error.message : 'Failed to load categories',
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmitTransaction(values: TransactionFormValues) {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');

      await apiClient<CreateTransactionResponse>('/transactions', {
        method: 'POST',
        body: values,
      });

      navigate('/transactions');
    } catch (error) {
      setFormErrorMessage(
        error instanceof Error ? error.message : 'Failed to create transaction',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Add Transaction"
          description="Create a new income or expense transaction with category-based tracking."
        />

        <Link
          to="/transactions"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Transactions
        </Link>
      </div>

      {isLoadingCategories && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading categories...</p>
        </div>
      )}

      {categoryErrorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
          {categoryErrorMessage}
        </div>
      )}

      {!isLoadingCategories && !categoryErrorMessage && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No categories available
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create at least one income or expense category before adding a
            transaction.
          </p>

          <Link
            to="/categories"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Manage Categories
          </Link>
        </div>
      )}

      {!isLoadingCategories && !categoryErrorMessage && categories.length > 0 && (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmitTransaction}
          isSubmitting={isSubmitting}
          errorMessage={formErrorMessage}
        />
      )}
    </section>
  );
}

export default NewTransactionPage;