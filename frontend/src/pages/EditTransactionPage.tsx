import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import TransactionForm from '../components/transactions/TransactionForm';
import type { TransactionFormValues } from '../components/transactions/TransactionForm';
import ButtonLink from '../components/ui/ButtonLink';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';

type CategoriesResponse = {
  data: Category[];
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

        const [transactionResponse, categoriesResponse] = await Promise.all([
          apiClient<TransactionResponse>(`/transactions/${id}`),
          apiClient<CategoriesResponse>('/categories'),
        ]);

        setTransaction(transactionResponse.data);
        setCategories(categoriesResponse.data);
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

    return {
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description ?? '',
      transactionDate: formatDateForInput(transaction.transactionDate),
      categoryId: transaction.categoryId,
    };
  }, [transaction]);

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

      {!isLoading && !loadErrorMessage && initialValues && (
        <TransactionForm
          categories={categories}
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