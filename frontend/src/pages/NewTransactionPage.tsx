import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import TransactionForm from '../components/transactions/TransactionForm';
import type { TransactionFormValues } from '../components/transactions/TransactionForm';
import ButtonLink from '../components/ui/ButtonLink';
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

type CreateTransactionResponse = {
  message: string;
  data: Transaction;
};

function NewTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialType = (searchParams.get('type') as 'expense' | 'income' | 'transfer') || 'expense';
  const initialToAccountId = searchParams.get('toAccountId') || undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataErrorMessage, setDataErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFormData() {
      try {
        setIsLoadingData(true);
        setDataErrorMessage('');

        const [categoriesResponse, accountsResponse] = await Promise.all([
          apiClient<CategoriesResponse>('/categories'),
          apiClient<AccountsResponse>('/accounts'),
        ]);

        setCategories(categoriesResponse.data);
        setAccounts(accountsResponse.data);
      } catch (error) {
        setDataErrorMessage(
          error instanceof Error ? error.message : 'Failed to load form data',
        );
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchFormData();
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

        <ButtonLink to="/transactions" variant="secondary">
          Back to Transactions
        </ButtonLink>
      </div>

      {isLoadingData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading form data...</p>
        </div>
      )}

      {dataErrorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
          {dataErrorMessage}
        </div>
      )}

      {!isLoadingData && !dataErrorMessage && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No categories available
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create at least one income or expense category before adding a
            transaction.
          </p>

          <ButtonLink to="/categories" className="mt-6">
            Manage Categories
          </ButtonLink>
        </div>
      )}

      {!isLoadingData &&
        !dataErrorMessage &&
        categories.length > 0 &&
        accounts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No accounts available
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create at least one bank account, e-wallet, or cash wallet before
              adding a transaction.
            </p>

            <ButtonLink to="/accounts" className="mt-6">
              Manage Accounts
            </ButtonLink>
          </div>
        )}

      {!isLoadingData &&
        !dataErrorMessage &&
        categories.length > 0 &&
        accounts.length > 0 && (
          <TransactionForm
            categories={categories}
            accounts={accounts}
            onSubmit={handleSubmitTransaction}
            isSubmitting={isSubmitting}
            errorMessage={formErrorMessage}
            submitLabel="Create Transaction"
            initialValues={{
              type: initialType,
              toAccountId: initialToAccountId,
              amount: 0,
              description: '',
              transactionDate: new Date().toISOString().slice(0, 10),
              accountId: '',
            }}
          />
        )}
    </section>
  );
}

export default NewTransactionPage;