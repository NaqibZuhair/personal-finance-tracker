import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getAccounts } from '../lib/accountApi';
import {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  executeRoutine,
} from '../lib/routineApi';
import type { Account } from '../types/account';
import type { AllocationRoutine, CreateRoutineItemInput } from '../types/routine';
import { formatCurrency } from '../utils/formatters';
import { Plus, Trash2, Edit2, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AllocationRoutinesPage() {
  const [routines, setRoutines] = useState<AllocationRoutine[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<AllocationRoutine | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formItems, setFormItems] = useState<CreateRoutineItemInput[]>([]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [executingId, setExecutingId] = useState<string | null>(null);
  const [deletingRoutine, setDeletingRoutine] = useState<AllocationRoutine | null>(null);
  const [confirmingExecuteRoutine, setConfirmingExecuteRoutine] = useState<AllocationRoutine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [routinesData, accountsData] = await Promise.all([
        getRoutines(),
        getAccounts(),
      ]);
      setRoutines(routinesData);
      setAccounts(accountsData.filter((acc) => acc.isActive));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load allocation routines',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenCreateForm() {
    setEditingRoutine(null);
    setFormName('');
    setFormDescription('');
    const defaultAccount = accounts[0]?.id || '';
    const defaultToAccount = accounts[1]?.id || defaultAccount;
    setFormItems([
      { amount: 100000, description: 'Sisih Dana', accountId: defaultAccount, toAccountId: defaultToAccount },
    ]);
    setFormError('');
    setIsFormOpen(true);
  }

  function handleOpenEditForm(routine: AllocationRoutine) {
    setEditingRoutine(routine);
    setFormName(routine.name);
    setFormDescription(routine.description || '');
    setFormItems(
      routine.items.map((item) => ({
        amount: Number(item.amount),
        description: item.description || '',
        accountId: item.accountId,
        toAccountId: item.toAccountId,
      })),
    );
    setFormError('');
    setIsFormOpen(true);
  }

  function handleAddItemRow() {
    const defaultAccount = accounts[0]?.id || '';
    const defaultToAccount = accounts[1]?.id || defaultAccount;
    setFormItems((prev) => [
      ...prev,
      { amount: 50000, description: '', accountId: defaultAccount, toAccountId: defaultToAccount },
    ]);
  }

  function handleRemoveItemRow(index: number) {
    if (formItems.length === 1) {
      setFormError('At least one transfer item is required');
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof CreateRoutineItemInput, value: string | number) {
    setFormItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Routine name is required');
      return;
    }
    if (formItems.length === 0) {
      setFormError('Add at least one transfer item');
      return;
    }
    for (const item of formItems) {
      if (!item.amount || item.amount <= 0) {
        setFormError('All transfer amounts must be greater than 0');
        return;
      }
      if (item.accountId === item.toAccountId) {
        setFormError('Source and destination accounts must be different');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        items: formItems.map((item) => ({
          ...item,
          amount: Number(item.amount),
          description: item.description?.trim() || undefined,
        })),
      };

      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, payload);
        setSuccessMessage(`Routine "${formName}" updated successfully!`);
      } else {
        await createRoutine(payload);
        setSuccessMessage(`Routine "${formName}" created successfully!`);
      }

      await fetchData();
      setIsFormOpen(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save routine');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function executeDelete(routine: AllocationRoutine) {
    try {
      setIsDeleting(true);
      await deleteRoutine(routine.id);
      setSuccessMessage(`Routine "${routine.name}" deleted`);
      setDeletingRoutine(null);
      await fetchData();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete routine');
      setDeletingRoutine(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function executeRoutineAction(routine: AllocationRoutine) {
    try {
      setConfirmingExecuteRoutine(null);
      setExecutingId(routine.id);
      setErrorMessage('');
      const msg = await executeRoutine(routine.id);
      setSuccessMessage(`🎉 ${msg}`);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to execute routine');
    } finally {
      setExecutingId(null);
    }
  }

  function getAccountName(id: string) {
    return accounts.find((a) => a.id === id)?.name || 'Unknown Account';
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Paycheck Allocation Routines"
          description="Build custom multi-destination transfer packages. Execute savings & emergency fund splits in 1-click!"
        />
        <Button onClick={handleOpenCreateForm} className="self-start sm:self-auto flex items-center gap-2">
          <Plus size={18} /> Add New Routine
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {isLoading && <LoadingCard message="Loading allocation routines..." />}

      {!isLoading && !errorMessage && routines.length === 0 && !isFormOpen && (
        <EmptyState
          title="No Allocation Routines Yet"
          description="Create your first paycheck allocation package to automate your daily or monthly saving habits with a single click."
          action={
            <Button onClick={handleOpenCreateForm} className="inline-flex items-center gap-2">
              <Plus size={16} /> Create Routine
            </Button>
          }
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRoutine ? 'Edit Allocation Routine' : 'Create New Allocation Routine'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && <div className="text-sm text-red-600 font-medium">{formError}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Routine Name *</span>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Sisihan Cair Harian"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description (Optional)</span>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. 10% Dana Darurat, 5% Reksadana"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Transfer Items</span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Another Transfer
              </button>
            </div>

            <div className="space-y-3">
              {formItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-xs text-slate-500">From Account</span>
                      <select
                        value={item.accountId}
                        onChange={(e) => handleItemChange(idx, 'accountId', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium outline-none"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs text-slate-500">To Account</span>
                      <select
                        value={item.toAccountId}
                        onChange={(e) => handleItemChange(idx, 'toAccountId', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium outline-none"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs text-slate-500">Amount (Rp)</span>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={item.amount}
                        onChange={(e) => handleItemChange(idx, 'amount', Number(e.target.value))}
                        required
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium outline-none"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Note (optional)"
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 outline-none w-full sm:w-36"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingRoutine ? 'Update Routine' : 'Save Routine'}
            </Button>
          </div>
        </form>
      </Modal>

      {!isLoading && routines.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {routines.map((routine) => {
            const totalAmount = routine.items.reduce(
              (sum, item) => sum + Number(item.amount),
              0,
            );

            const isExecuting = executingId === routine.id;

            return (
              <Card
                key={routine.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200/80 bg-white overflow-hidden"
              >
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Zap size={18} /></span>
                          {routine.name}
                        </h3>
                        {routine.description && (
                          <p className="text-xs text-slate-500 mt-1">{routine.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(routine)}
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                          title="Edit routine"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRoutine(routine)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Delete routine"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                        <span>Allocation Split ({routine.items.length} transfers)</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(totalAmount)}</span>
                      </div>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {routine.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5 truncate font-medium">
                              <span className="truncate max-w-[90px] sm:max-w-[120px]" title={item.account?.name || getAccountName(item.accountId)}>
                                {item.account?.name || getAccountName(item.accountId)}
                              </span>
                              <ArrowRight size={12} className="text-slate-400 shrink-0" />
                              <span className="font-semibold text-primary-700 truncate max-w-[90px] sm:max-w-[120px]" title={item.toAccount?.name || getAccountName(item.toAccountId)}>
                                {item.toAccount?.name || getAccountName(item.toAccountId)}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0 ml-2">
                              {formatCurrency(Number(item.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingExecuteRoutine(routine)}
                      disabled={isExecuting}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-semibold text-sm text-white shadow-md shadow-primary-500/20 transition-all duration-200 ${
                        isExecuting
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.99]'
                      }`}
                    >
                      <Zap size={16} className={isExecuting ? 'animate-spin' : ''} />
                      {isExecuting ? 'Executing Splits...' : 'Execute Routine (1-Click)'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingRoutine)}
        onClose={() => setDeletingRoutine(null)}
        onConfirm={() => deletingRoutine && executeDelete(deletingRoutine)}
        title="Delete Routine"
        message={`Are you sure you want to delete "${deletingRoutine?.name}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmingExecuteRoutine)}
        onClose={() => setConfirmingExecuteRoutine(null)}
        onConfirm={() => confirmingExecuteRoutine && executeRoutineAction(confirmingExecuteRoutine)}
        title="Execute Routine"
        message={`Are you sure you want to run "${confirmingExecuteRoutine?.name}"?`}
        confirmText="Run Now"
        confirmVariant="primary"
        isLoading={Boolean(executingId)}
      />
    </section>
  );
}
