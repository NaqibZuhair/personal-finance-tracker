import { useEffect, useMemo, useState } from 'react';
import TransactionFilters from '../components/transactions/TransactionFilters';
import type { TransactionFiltersValue } from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import ButtonLink from '../components/ui/ButtonLink';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
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

        <ButtonLink to="/transactions/new">Add Transaction</ButtonLink>
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

      {deleteErrorMessage && <ErrorAlert message={deleteErrorMessage} />}

      {isLoading && <LoadingCard message="Loading transactions..." />}

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {!isLoading && !errorMessage && transactions.length === 0 && (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or add a new transaction."
          action={
            <ButtonLink to="/transactions/new">Add Transaction</ButtonLink>
          }
        />
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