import { useEffect, useMemo, useState } from 'react';
import TransactionFilters from '../components/transactions/TransactionFilters';
import type { TransactionFiltersValue } from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import ButtonLink from '../components/ui/ButtonLink';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportModal from '../components/transactions/ExportModal';
import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';
import type { Account } from '../types/account';

type TransactionsResponse = {
  data: Transaction[];
};

type CategoriesResponse = {
  data: Category[];
};

type AccountsResponse = {
  data: Account[];
};

const initialFilters: TransactionFiltersValue = {
  type: '',
  categoryId: '',
  accountId: '',
  month: '',
  search: '',
  tag: '',
};

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] =
    useState<TransactionFiltersValue>(initialFilters);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [deletingTransactionId, setDeletingTransactionId] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const transactionQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.type) {
      params.set('type', filters.type);
    }

    if (filters.categoryId) {
      params.set('categoryId', filters.categoryId);
    }

    if (filters.accountId) {
      params.set('accountId', filters.accountId);
    }

    if (filters.month) {
      params.set('month', filters.month);
    }

    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    if (filters.tag.trim()) {
      params.set('tag', filters.tag.trim());
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : '';
  }, [filters]);

  useEffect(() => {
    async function fetchFilterData() {
      try {
        setIsLoadingCategories(true);

        const [categoriesResponse, accountsResponse] = await Promise.all([
          apiClient<CategoriesResponse>('/categories'),
          apiClient<AccountsResponse>('/accounts'),
        ]);

        setCategories(categoriesResponse.data);
        setAccounts(accountsResponse.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load filters',
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchFilterData();
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export / Print
          </button>
          <ButtonLink to="/transactions/new">Add Transaction</ButtonLink>
        </div>
      </div>

      <TransactionFilters
        categories={categories}
        accounts={accounts}
        value={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {isLoadingCategories && (
        <LoadingCard message="Loading filter categories..." />
      )}

      {errorMessage && <ErrorAlert message={errorMessage} />}
      {deleteErrorMessage && <ErrorAlert message={deleteErrorMessage} />}

      {isLoading && <LoadingCard message="Loading transactions..." />}

      {!isLoading && !errorMessage && transactions.length === 0 && (
        <EmptyState
          title="No transactions found"
          description="We couldn't find any transactions matching your current filters. Try resetting your filters or add your first record."
          action={
            <ButtonLink to="/transactions/new">Add Transaction</ButtonLink>
          }
        />
      )}

      {!isLoading && !errorMessage && transactions.length > 0 && (
        <div className="print-area">
          <TransactionTable
            transactions={transactions}
            pendingDeleteId={pendingDeleteId}
            deletingTransactionId={deletingTransactionId}
            onRequestDelete={handleRequestDelete}
            onCancelDelete={handleCancelDelete}
            onConfirmDelete={handleDeleteTransaction}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        onClose={handleCancelDelete}
        onConfirm={() => pendingDeleteId && handleDeleteTransaction(pendingDeleteId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmText="Delete"
        isLoading={Boolean(deletingTransactionId)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(format) => {
          const exportParams = new URLSearchParams(transactionQuery);
          exportParams.set('format', format);
          window.open(`${import.meta.env.VITE_API_BASE_URL}/transactions/export?${exportParams.toString()}`, '_blank');
        }}
        onPrint={() => {
          const exportParams = new URLSearchParams(transactionQuery);
          window.open(`/transactions/preview?${exportParams.toString()}`, '_blank');
        }}
        title="Export Filtered Transactions"
        description="Choose your preferred file format for downloading or printing your currently filtered transaction records."
      />
    </section>
  );
}

export default TransactionsPage;