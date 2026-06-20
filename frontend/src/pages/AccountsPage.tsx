import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import {
  createAccount,
  deleteAccount,
  getAccountBalances,
  updateAccount,
} from '../lib/accountApi';
import type {
  AccountBalance,
  AccountType,
  CreateAccountInput,
} from '../types/account';

type AccountFormState = {
  name: string;
  type: AccountType;
  initialBalance: string;
  isActive: boolean;
};

const initialFormState: AccountFormState = {
  name: '',
  type: 'bank',
  initialBalance: '0',
  isActive: true,
};

const accountTypeLabel: Record<AccountType, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Cash',
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState('');
  const [editingAccount, setEditingAccount] = useState<AccountBalance | null>(
    null,
  );
  const [formState, setFormState] =
    useState<AccountFormState>(initialFormState);

  async function fetchAccounts() {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getAccountBalances();
      setAccounts(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load accounts',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (total, account) => total + account.currentBalance,
      0,
    );
  }, [accounts]);

  function handleOpenCreateForm() {
    setFormErrorMessage('');
    setEditingAccount(null);
    setFormState(initialFormState);
    setIsFormOpen(true);
  }

  function handleOpenEditForm(account: AccountBalance) {
    setFormErrorMessage('');
    setDeleteErrorMessage('');
    setEditingAccount(account);
    setFormState({
      name: account.name,
      type: account.type,
      initialBalance: String(account.initialBalance),
      isActive: account.isActive,
    });
    setIsFormOpen(true);
  }

  function handleCancelForm() {
    setFormErrorMessage('');
    setEditingAccount(null);
    setFormState(initialFormState);
    setIsFormOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const initialBalance = Number(formState.initialBalance);

    if (Number.isNaN(initialBalance) || initialBalance < 0) {
      setFormErrorMessage('Initial balance must be 0 or greater');
      return;
    }

    const payload: CreateAccountInput = {
      name: formState.name,
      type: formState.type,
      initialBalance,
      isActive: formState.isActive,
    };

    try {
      setIsSubmitting(true);
      setFormErrorMessage('');

      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          ...payload,
          isActive: formState.isActive,
        });
      } else {
        await createAccount(payload);
      }

      await fetchAccounts();
      setIsFormOpen(false);
      setEditingAccount(null);
      setFormState(initialFormState);
    } catch (error) {
      setFormErrorMessage(
        error instanceof Error ? error.message : 'Failed to save account',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount(accountId: string) {
    const isConfirmed = window.confirm(
      'Delete this account? Accounts used by transactions cannot be deleted.',
    );

    if (!isConfirmed) return;

    try {
      setDeletingAccountId(accountId);
      setDeleteErrorMessage('');
      await deleteAccount(accountId);
      await fetchAccounts();
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete account',
      );
    } finally {
      setDeletingAccountId('');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage bank accounts, e-wallets, and cash balances used by your transactions."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Total current balance</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">
          {currencyFormatter.format(totalBalance)}
        </p>
      </div>

      <div>
        <Button onClick={handleOpenCreateForm}>Add Account</Button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a source of money such as BCA, GoPay, Dana, or Cash.
            </p>
          </div>

          {formErrorMessage && <ErrorAlert message={formErrorMessage} />}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">
                Account Name
              </span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="BCA, GoPay, Cash"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Type</span>
              <select
                value={formState.type}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    type: event.target.value as AccountType,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
                <option value="cash">Cash</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">
                Initial Balance
              </span>
              <input
                type="number"
                min="0"
                value={formState.initialBalance}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    initialBalance: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-500"
                required
              />
            </label>

            <label className="flex items-center gap-2 self-end text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              Active account
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancelForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {deleteErrorMessage && <ErrorAlert message={deleteErrorMessage} />}

      {isLoading && <LoadingCard message="Loading accounts..." />}

      {!isLoading && errorMessage && <ErrorAlert message={errorMessage} />}

      {!isLoading && !errorMessage && accounts.length === 0 && (
        <EmptyState
          title="No accounts yet"
          description="Add your first bank account, e-wallet, or cash wallet."
          action={<Button onClick={handleOpenCreateForm}>Add Account</Button>}
        />
      )}

      {!isLoading && !errorMessage && accounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {account.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {accountTypeLabel[account.type]} ·{' '}
                    {account.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {accountTypeLabel[account.type]}
                </span>
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <BalanceRow
                  label="Initial balance"
                  value={account.initialBalance}
                />
                <BalanceRow label="Income" value={account.totalIncome} />
                <BalanceRow label="Expense" value={account.totalExpense} />
                <BalanceRow
                  label="Current balance"
                  value={account.currentBalance}
                  isStrong
                />
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleOpenEditForm(account)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={deletingAccountId === account.id}
                  onClick={() => handleDeleteAccount(account.id)}
                >
                  {deletingAccountId === account.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type BalanceRowProps = {
  label: string;
  value: number;
  isStrong?: boolean;
};

function BalanceRow({ label, value, isStrong = false }: BalanceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          isStrong
            ? 'font-bold text-slate-950'
            : 'font-medium text-slate-700'
        }
      >
        {currencyFormatter.format(value)}
      </span>
    </div>
  );
}

export default AccountsPage;