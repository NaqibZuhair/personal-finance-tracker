import { useEffect, useState } from 'react';
import CategorySummaryList from '../components/dashboard/CategorySummaryList';
import type { CategorySummaryItem } from '../components/dashboard/CategorySummaryList';
import RecentTransactionsList from '../components/dashboard/RecentTransactionsList';
import SummaryCard from '../components/dashboard/SummaryCard';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingCard from '../components/ui/LoadingCard';
import PageHeader from '../components/ui/PageHeader';
import { apiClient } from '../lib/apiClient';
import type { Transaction } from '../types/transaction';
import { formatCurrency } from '../utils/formatters';

type MonthlySummary = {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
};

type CategorySummary = {
  month: string;
  totalExpense: number;
  categories: CategorySummaryItem[];
};

type MonthlySummaryResponse = {
  data: MonthlySummary;
};

type CategorySummaryResponse = {
  data: CategorySummary;
};

type RecentTransactionsResponse = {
  data: Transaction[];
};

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [categorySummary, setCategorySummary] =
    useState<CategorySummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [monthlyResponse, categoryResponse, recentResponse] =
          await Promise.all([
            apiClient<MonthlySummaryResponse>(
              `/summary/monthly?month=${selectedMonth}`,
            ),
            apiClient<CategorySummaryResponse>(
              `/summary/categories?month=${selectedMonth}`,
            ),
            apiClient<RecentTransactionsResponse>('/summary/recent'),
          ]);

        setSummary(monthlyResponse.data);
        setCategorySummary(categoryResponse.data);
        setRecentTransactions(recentResponse.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [selectedMonth]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Monitor monthly cash flow, transaction activity, and spending signals."
        />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Summary Month
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:w-56"
          />
        </label>
      </div>

      {isLoading && <LoadingCard message="Loading dashboard data..." />}

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {!isLoading && !errorMessage && summary && categorySummary && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Income"
              value={formatCurrency(summary.totalIncome)}
              description={`Income recorded in ${summary.month}`}
              tone="income"
            />

            <SummaryCard
              label="Total Expense"
              value={formatCurrency(summary.totalExpense)}
              description={`Expenses recorded in ${summary.month}`}
              tone="expense"
            />

            <SummaryCard
              label="Monthly Balance"
              value={formatCurrency(summary.balance)}
              description="Income minus expenses"
              tone="balance"
            />

            <SummaryCard
              label="Transactions"
              value={String(summary.transactionCount)}
              description="Total records this month"
              tone="neutral"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <CategorySummaryList
              totalExpense={categorySummary.totalExpense}
              categories={categorySummary.categories}
            />

            <RecentTransactionsList transactions={recentTransactions} />
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;