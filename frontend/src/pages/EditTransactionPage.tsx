import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import TransactionForm from '../components/transactions/TransactionForm';
import type { TransactionFormValues } from '../components/transactions/TransactionForm';
import ButtonLink from '../components/ui/ButtonLink';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import { apiClient } from '../lib/apiClient';
import type { Account } from '../types/account';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';

type CategoriesResponse = {
  data: Category[];
};

type AccountsResponse = {
  data: Account[];
};

type TransactionResponse = {
  data: Transaction;
};

type UpdateTransactionResponse = {
  message: string;
  data: Transaction;
};

function formatDateForInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function EditTransactionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEditData() {
      if (!id) {
        setLoadErrorMessage('Transaction id is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadErrorMessage('');

        const [transactionResponse, categoriesResponse, accountsResponse] =
          await Promise.all([
            apiClient<TransactionResponse>(`/transactions/${id}`),
            apiClient<CategoriesResponse>('/categories'),
            apiClient<AccountsResponse>('/accounts'),
          ]);

        setTransaction(transactionResponse.data);
        setCategories(categoriesResponse.data);
        setAccounts(accountsResponse.data);
      } catch (error) {
        setLoadErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load transaction data',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchEditData();
  }, [id]);

  const initialValues = useMemo<TransactionFormValues | undefined>(() => {
    if (!transaction) {
      return undefined;
    }

    const fallbackAccount = accounts.find((account) => account.isActive);

    return {
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description ?? '',
      transactionDate: formatDateForInput(transaction.transactionDate),
      categoryId: transaction.categoryId ?? undefined,
      accountId: transaction.accountId ?? fallbackAccount?.id ?? '',
      toAccountId: transaction.toAccountId ?? undefined,
    };
  }, [transaction, accounts]);

  async function handleUpdateTransaction(values: TransactionFormValues) {
    if (!id) {
      setFormErrorMessage('Transaction id is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrorMessage('');

      await apiClient<UpdateTransactionResponse>(`/transactions/${id}`, {
        method: 'PUT',
        body: values,
      });

      navigate('/transactions');
    } catch (error) {
      setFormErrorMessage(
        error instanceof Error ? error.message : 'Failed to update transaction',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit Transaction"
          description="Update an existing income or expense transaction."
        />

        <ButtonLink to="/transactions" variant="secondary">
          Back to Transactions
        </ButtonLink>
      </div>

      {isLoading && <LoadingCard message="Loading transaction data..." />}

      {loadErrorMessage && <ErrorAlert message={loadErrorMessage} />}

      {!isLoading && !loadErrorMessage && accounts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No accounts available
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create at least one bank account, e-wallet, or cash wallet before
            editing this transaction.
          </p>

          <ButtonLink to="/accounts" className="mt-6">
            Manage Accounts
          </ButtonLink>
        </div>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        accounts.length > 0 &&
        initialValues && (
          <TransactionForm
            categories={categories}
            accounts={accounts}
            initialValues={initialValues}
            submitLabel="Update Transaction"
            onSubmit={handleUpdateTransaction}
            isSubmitting={isSubmitting}
            errorMessage={formErrorMessage}
          />
        )}
    </section>
  );
}

export default EditTransactionPage;