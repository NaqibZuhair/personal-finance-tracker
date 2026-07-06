import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
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
  includeInTotal: boolean;
};

const initialFormState: AccountFormState = {
  name: '',
  type: 'bank',
  initialBalance: '0',
  isActive: true,
  includeInTotal: true,
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
  const [pendingDeleteId, setPendingDeleteId] = useState('');
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
      includeInTotal: account.includeInTotal ?? true,
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
      includeInTotal: formState.includeInTotal,
    };

    try {
      setIsSubmitting(true);
      setFormErrorMessage('');

      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          ...payload,
          isActive: formState.isActive,
          includeInTotal: formState.includeInTotal,
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

  async function executeDeleteAccount(accountId: string) {
    try {
      setDeletingAccountId(accountId);
      setDeleteErrorMessage('');
      await deleteAccount(accountId);
      setPendingDeleteId('');
      await fetchAccounts();
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete account',
      );
      setPendingDeleteId('');
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

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
        <p className="text-sm text-slate-500 dark:text-slate-400">Total current balance</p>
        <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          {currencyFormatter.format(totalBalance)}
        </p>
      </div>

      <div>
        <Button onClick={handleOpenCreateForm}>Add Account</Button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCancelForm}
        title={editingAccount ? 'Edit Account' : 'Add Account'}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a source of money such as BCA, GoPay, Dana, or Cash.
            </p>
          </div>

          {formErrorMessage && <ErrorAlert message={formErrorMessage} />}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400"
                placeholder="BCA, GoPay, Cash"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</span>
              <select
                value={formState.type}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    type: event.target.value as AccountType,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400"
              >
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
                <option value="cash">Cash</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400"
                required
              />
            </label>

            <label className="flex items-center gap-2 self-end text-sm text-slate-700 dark:text-slate-300">
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

            <label className="flex items-center gap-2 self-end text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formState.includeInTotal}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    includeInTotal: event.target.checked,
                  }))
                }
              />
              Include in Total Spending
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancelForm}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

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
              className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    {account.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {accountTypeLabel[account.type]} ·{' '}
                    {account.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {accountTypeLabel[account.type]}
                  </span>
                  {account.includeInTotal === false && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border dark:border-amber-500/20">
                      Excluded from Total
                    </span>
                  )}
                </div>
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
                  onClick={() => setPendingDeleteId(account.id)}
                >
                  {deletingAccountId === account.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId('')}
        onConfirm={() => pendingDeleteId && executeDeleteAccount(pendingDeleteId)}
        title="Delete Account"
        message="Are you sure you want to delete this account?"
        confirmText="Delete"
        isLoading={Boolean(deletingAccountId)}
      />
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
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={
          isStrong
            ? 'font-bold text-slate-950 dark:text-white'
            : 'font-medium text-slate-700 dark:text-slate-300'
        }
      >
        {currencyFormatter.format(value)}
      </span>
    </div>
  );
}

export default AccountsPage;