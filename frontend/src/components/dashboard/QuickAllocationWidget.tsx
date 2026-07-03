import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent } from '../ui/Card';
import { getRoutines, executeRoutine } from '../../lib/routineApi';
import type { AllocationRoutine } from '../../types/routine';
import { formatCurrency } from '../../utils/formatters';

type QuickAllocationWidgetProps = {
  onRoutineExecuted?: () => void;
};

export default function QuickAllocationWidget({ onRoutineExecuted }: QuickAllocationWidgetProps) {
  const [routines, setRoutines] = useState<AllocationRoutine[]>([]);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoutines();
  }, []);

  async function fetchRoutines() {
    try {
      const data = await getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to load allocation routines', error);
    }
  }

  async function handleExecute(routine: AllocationRoutine) {
    if (!window.confirm(`Jalankan rutinitas "${routine.name}" sekarang?\nIni akan otomatis mencatat ${routine.items.length} transaksi transfer.`)) {
      return;
    }
    try {
      setExecutingId(routine.id);
      setErrorMessage('');
      const msg = await executeRoutine(routine.id);
      setSuccessMessage(`Berhasil: ${msg}`);
      if (onRoutineExecuted) {
        onRoutineExecuted();
      } else {
        setTimeout(() => {
          navigate('/transactions');
        }, 1500);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to execute routine');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setExecutingId(null);
    }
  }

  if (routines.length === 0) {
    return (
      <Card className="border border-slate-200 bg-slate-50/50 shadow-2xs">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">One-Click Paycheck Routines</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Automate your daily or irregular income allocations into savings and emergency funds with a single click.
              </p>
            </div>
          </div>
          <Link
            to="/routines"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition shrink-0"
          >
            Create Routine
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Quick Allocation Routines</h3>
              <p className="text-xs text-slate-500">Execute multi-account transfers instantly</p>
            </div>
          </div>
          <Link
            to="/routines"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition"
          >
            Manage Routines &rarr;
          </Link>
        </div>

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 border border-emerald-200">
            <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-800 border border-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {routines.slice(0, 3).map((routine) => {
            const totalAmount = routine.items.reduce(
              (sum, item) => sum + Number(item.amount),
              0,
            );
            const isExecuting = executingId === routine.id;

            return (
              <div
                key={routine.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:border-slate-300 hover:bg-white transition shadow-2xs group"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 truncate group-hover:text-primary-600 transition" title={routine.name}>
                      {routine.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full shrink-0">
                      {routine.items.length} items
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1.5">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecute(routine)}
                  disabled={isExecuting}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-white shadow-2xs transition ${
                    isExecuting
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98]'
                  }`}
                >
                  <svg className={`h-3.5 w-3.5 ${isExecuting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isExecuting ? 'Processing...' : 'Execute 1-Click'}
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
