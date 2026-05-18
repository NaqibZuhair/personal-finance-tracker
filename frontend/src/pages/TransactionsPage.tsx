import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import TransactionFilters from '../components/transactions/TransactionFilters';
import type { TransactionFiltersValue } from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import PageHeader from '../components/ui/PageHeader';
import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';

type TransactionsResponse = {
  data: Transaction[];
};

type CategoriesResponse = {
  data: Category[];
};

const initialFilters: TransactionFiltersValue = {
  type: '',
  categoryId: '',
  month: '',
  search: '',
};

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFiltersValue>(initialFilters);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [deletingTransactionId, setDeletingTransactionId] = useState('');

  const transactionQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.type) {
      params.set('type', filters.type);
    }

    if (filters.categoryId) {
      params.set('categoryId', filters.categoryId);
    }

    if (filters.month) {
      params.set('month', filters.month);
    }

    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : '';
  }, [filters]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);

        const response = await apiClient<CategoriesResponse>('/categories');

        setCategories(response.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load categories',
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await apiClient<TransactionsResponse>(
          `/transactions${transactionQuery}`,
        );

        setTransactions(response.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load transactions',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [transactionQuery]);

  async function handleDeleteTransaction(transactionId: string) {
    try {
      setDeletingTransactionId(transactionId);
      setDeleteErrorMessage('');

      await apiClient(`/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== transactionId,
        ),
      );

      setPendingDeleteId('');
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete transaction',
      );
    } finally {
      setDeletingTransactionId('');
    }
  }

  function handleRequestDelete(transactionId: string) {
    setDeleteErrorMessage('');
    setPendingDeleteId(transactionId);
  }

  function handleCancelDelete() {
    setPendingDeleteId('');
    setDeleteErrorMessage('');
  }

  function handleResetFilters() {
    setFilters(initialFilters);
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Transactions"
          description="Track every income and expense record in one organized table."
        />

        <Link
          to="/transactions/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
        >
          Add Transaction
        </Link>
      </div>

      <TransactionFilters
        categories={categories}
        value={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {isLoadingCategories && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          Loading filter categories...
        </div>
      )}

      {deleteErrorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
          {deleteErrorMessage}
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading transactions...</p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && transactions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No transactions found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your filters or add a new transaction.
          </p>

          <Link
            to="/transactions/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Add Transaction
          </Link>
        </div>
      )}

      {!isLoading && !errorMessage && transactions.length > 0 && (
        <TransactionTable
          transactions={transactions}
          pendingDeleteId={pendingDeleteId}
          deletingTransactionId={deletingTransactionId}
          onRequestDelete={handleRequestDelete}
          onCancelDelete={handleCancelDelete}
          onConfirmDelete={handleDeleteTransaction}
        />
      )}
    </section>
  );
}

export default TransactionsPage;