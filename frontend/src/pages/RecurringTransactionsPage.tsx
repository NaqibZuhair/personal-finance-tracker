import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import RecurringForm from '../components/recurring/RecurringForm';
import { recurringService } from '../services/recurringService';
import type { RecurringTransaction } from '../services/recurringService';
import { formatCurrency } from '../utils/formatters';

export default function RecurringTransactionsPage() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

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

  const handleCreate = async (values: any) => {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');
      await recurringService.createRecurringTransaction(values);
      await fetchRecurring();
      setIsFormOpen(false);
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
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await recurringService.deleteRecurringTransaction(id);
      fetchRecurring();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader 
          title="Subscriptions & Recurring" 
          description="Manage automated bills like Netflix, Spotify, or Kosan rent." 
        />
        <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
          Add Recurring
        </Button>
      </div>

      {isFormOpen && (
        <RecurringForm
          title="New Subscription"
          submitLabel="Save"
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          errorMessage={formErrorMessage}
        />
      )}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurring.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              You haven't set up any recurring transactions yet.
            </div>
          ) : (
            recurring.map((item) => (
              <div key={item.id} className={`rounded-2xl border p-5 shadow-sm transition ${item.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {item.description || item.category?.name || 'Recurring'}
                    </h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-md ${item.type === 'expense' ? 'bg-rose-100 text-rose-700' : item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.frequency.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${item.type === 'expense' ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-500">
                  <p>Next run: <strong className="text-slate-700">{new Date(item.nextRunDate).toLocaleDateString()}</strong></p>
                  <p>Account: {item.account?.name}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className={`text-sm font-semibold ${item.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                  >
                    {item.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-sm font-semibold text-rose-500 hover:text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
