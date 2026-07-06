import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import RecurringForm from '../components/recurring/RecurringForm';
import { recurringService } from '../services/recurringService';
import type { RecurringTransaction } from '../services/recurringService';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function RecurringTransactionsPage() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRecurring();
  }, []);

  async function fetchRecurring() {
    setIsLoading(true);
    try {
      const data = await recurringService.getRecurringTransactions();
      setRecurring(data);
    } catch (error) {
      console.error('Failed to load recurring transactions', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (values: any) => {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');
      
      if (editingRecurring) {
        await recurringService.updateRecurringTransaction(editingRecurring.id, values);
      } else {
        await recurringService.createRecurringTransaction(values);
      }
      
      await fetchRecurring();
      setIsFormOpen(false);
      setEditingRecurring(null);
    } catch (error) {
      setFormErrorMessage(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await recurringService.updateRecurringTransaction(id, { isActive: !currentStatus } as any);
      fetchRecurring();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await recurringService.deleteRecurringTransaction(id);
      await fetchRecurring();
      setDeletingId('');
    } catch (error) {
      console.error('Failed to delete', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader 
          title="Subscriptions & Recurring" 
          description="Manage automated bills like Netflix, Spotify, or Kosan rent." 
        />
        <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen || editingRecurring !== null}>
          Add Recurring
        </Button>
      </div>

      <Modal
        isOpen={isFormOpen || Boolean(editingRecurring)}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecurring(null);
        }}
        title={editingRecurring ? 'Edit Subscription' : 'New Subscription'}
      >
        <RecurringForm
          title={editingRecurring ? 'Edit Subscription' : 'New Subscription'}
          submitLabel={editingRecurring ? 'Update' : 'Save'}
          initialValues={editingRecurring ? {
            type: editingRecurring.type,
            amount: editingRecurring.amount,
            description: editingRecurring.description || '',
            frequency: editingRecurring.frequency,
            nextRunDate: editingRecurring.nextRunDate,
            categoryId: editingRecurring.categoryId,
            accountId: editingRecurring.accountId,
            toAccountId: editingRecurring.toAccountId,
          } : undefined}
          onCancel={() => { setIsFormOpen(false); setEditingRecurring(null); }}
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
          errorMessage={formErrorMessage}
        />
      </Modal>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurring.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-800/40">
              You haven't set up any recurring transactions yet.
            </div>
          ) : (
            recurring.map((item) => (
              <div key={item.id} className={`rounded-2xl border p-5 shadow-sm transition ${item.isActive ? 'bg-white/90 border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800/80 backdrop-blur-md' : 'bg-slate-50/80 border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800/60 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                      {item.description || item.category?.name || 'Recurring'}
                    </h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-md ${item.type === 'expense' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border dark:border-rose-500/20' : item.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border dark:border-emerald-500/20' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border dark:border-blue-500/20'}`}>
                      {item.frequency.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${item.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  <p>Next run: <strong className="text-slate-700 dark:text-slate-200">{new Date(item.nextRunDate).toLocaleDateString()}</strong></p>
                  <p>Account: {item.account?.name}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button 
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className={`text-sm font-semibold ${item.isActive ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300' : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'}`}
                  >
                    {item.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setEditingRecurring(item)}
                      className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                      title="Edit Subscription"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setDeletingId(item.id)}
                      className="text-sm font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId('')}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription?"
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </section>
  );
}
