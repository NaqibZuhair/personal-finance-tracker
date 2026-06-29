import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import BudgetForm from '../components/budgets/BudgetForm';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../services/budgetService';
import { formatCurrency } from '../utils/formatters';

export default function BudgetsPage() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [month] = useState(currentMonth);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  useEffect(() => {
    async function fetchBudgets() {
      setIsLoading(true);
      try {
        const data = await budgetService.getBudgets(month);
        setBudgets(data);
      } catch (error) {
        console.error('Failed to load budgets', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBudgets();
  }, [month]);

  const handleCreateBudget = async (values: { categoryId: string; amount: number; month: number; year: number }) => {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');
      const newBudget = await budgetService.upsertBudget(values);
      // Remove old version if it existed, and add new
      setBudgets((prev) => {
        const filtered = prev.filter(b => b.categoryId !== newBudget.categoryId);
        return [...filtered, newBudget].sort((a, b) => b.amount - a.amount);
      });
      setIsFormOpen(false);
    } catch (error) {
      setFormErrorMessage(error instanceof Error ? error.message : 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader 
          title="Monthly Budgets" 
          description="Manage limits for your spending categories." 
        />
        <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
          Add Budget
        </Button>
      </div>

      {isFormOpen && (
        <BudgetForm
          title="Set Category Budget"
          description={`Set a limit for expenses in ${month}`}
          submitLabel="Save Budget"
          month={month}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleCreateBudget}
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
          {budgets.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              You haven't set up any budgets for {month} yet.
            </div>
          ) : (
            budgets.map((budget: Budget) => {
              const percentage = Math.min((budget.spentAmount / budget.amount) * 100, 100);
              const isDanger = percentage >= 90;
              const isWarning = percentage >= 75 && !isDanger;

              let barColor = 'bg-primary-500';
              if (isDanger) barColor = 'bg-expense-500';
              else if (isWarning) barColor = 'bg-yellow-500';

              return (
                <div key={budget.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800">{budget.category?.name}</h3>
                    <span className="text-sm font-medium text-slate-500">
                      {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 text-right">
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
