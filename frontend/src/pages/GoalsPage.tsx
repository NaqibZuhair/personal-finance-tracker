import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import ButtonLink from '../components/ui/ButtonLink';
import GoalForm from '../components/goals/GoalForm';
import { goalService } from '../services/goalService';
import type { SavingsGoal } from '../services/goalService';
import { formatCurrency } from '../utils/formatters';

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  useEffect(() => {
    async function fetchGoals() {
      setIsLoading(true);
      try {
        const data = await goalService.getGoals();
        setGoals(data);
      } catch (error) {
        console.error('Failed to load goals', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGoals();
  }, []);

  const handleCreateGoal = async (values: { name: string; targetAmount: number; deadline?: string }) => {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');
      const newGoal = await goalService.createGoal(values);
      setGoals([...goals, newGoal]);
      setIsFormOpen(false);
    } catch (error) {
      setFormErrorMessage(error instanceof Error ? error.message : 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader 
          title="Savings Goals" 
          description="Track your long-term saving targets." 
        />
        <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
          Add Goal
        </Button>
      </div>

      {isFormOpen && (
        <GoalForm
          title="Create Savings Goal"
          description="Set up a new target to save for."
          submitLabel="Create Goal"
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleCreateGoal}
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
          {goals.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              You haven't set up any savings goals yet.
            </div>
          ) : (
            goals.map((goal: SavingsGoal) => {
              const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

              return (
                <div key={goal.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 text-lg">{goal.name}</h3>
                      {goal.deadline && (
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          Due {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Saved</p>
                        <p className="text-2xl font-black text-primary-600">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 mb-1">Target</p>
                        <p className="text-sm font-bold text-slate-700">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1 text-xs font-semibold text-slate-500">
                      <span>Progress</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <ButtonLink 
                      to={`/transactions/new?type=transfer&toAccountId=${goal.accountId}`} 
                      className="w-full justify-center"
                      variant="secondary"
                    >
                      Fund Goal
                    </ButtonLink>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
