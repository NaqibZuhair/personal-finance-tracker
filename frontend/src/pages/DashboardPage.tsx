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
import { getAccountBalances } from '../lib/accountApi';
import type { AccountBalance } from '../types/account';
import DashboardCharts, { type HistoricalItem } from '../components/dashboard/DashboardCharts';

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

type HistoricalSummaryResponse = {
  data: HistoricalItem[];
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
  const [historicalSummary, setHistoricalSummary] = useState<HistoricalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [showAllAssets, setShowAllAssets] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [
          monthlyResponse,
          categoryResponse,
          recentResponse,
          historicalResponse,
          accountBalancesData,
        ] = await Promise.all([
          apiClient<MonthlySummaryResponse>(`/summary/monthly?month=${selectedMonth}`),
          apiClient<CategorySummaryResponse>(`/summary/categories?month=${selectedMonth}`),
          apiClient<RecentTransactionsResponse>('/summary/recent'),
          apiClient<HistoricalSummaryResponse>(`/summary/historical?month=${selectedMonth}`),
          getAccountBalances(),
        ]);

        setSummary(monthlyResponse.data);
        setCategorySummary(categoryResponse.data);
        setRecentTransactions(recentResponse.data);
        setHistoricalSummary(historicalResponse.data);
        setAccountBalances(accountBalancesData);
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

  const filteredAccounts = showAllAssets
    ? accountBalances
    : accountBalances.filter((acc) => acc.includeInTotal !== false);

  const totalCurrentBalance = filteredAccounts.reduce(
    (total, account) => total + account.currentBalance,
    0,
  );

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
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 sm:w-56"
          />
        </label>
      </div>

      {isLoading && <LoadingCard message="Loading dashboard data..." />}

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {!isLoading && !errorMessage && summary && categorySummary && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="col-span-2 lg:col-span-2">
              <div className="relative h-full">
                <SummaryCard
                  label={showAllAssets ? "Total Net Worth (All Assets)" : "Daily Spending Balance"}
                  value={formatCurrency(totalCurrentBalance)}
                  description={showAllAssets ? "Includes savings & excluded accounts" : "Excludes savings & hidden accounts"}
                  tone="balance"
                />
                <button
                  type="button"
                  onClick={() => setShowAllAssets((prev) => !prev)}
                  className="absolute right-4 top-4 rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-200"
                >
                  {showAllAssets ? "Daily Only" : "See All Assets"}
                </button>
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-1">
              <SummaryCard
                label="Total Income"
                value={formatCurrency(summary.totalIncome)}
                description={`Income in ${summary.month}`}
                tone="income"
              />
            </div>

            <div className="col-span-1 lg:col-span-1">
              <SummaryCard
                label="Total Expense"
                value={formatCurrency(summary.totalExpense)}
                description={`Expenses in ${summary.month}`}
                tone="expense"
              />
            </div>

            <div className="col-span-1 lg:col-span-2">
              <SummaryCard
                label="Monthly Balance"
                value={formatCurrency(summary.totalIncome - summary.totalExpense)}
                description="Income minus expenses"
                tone="balance"
              />
            </div>

            <div className="col-span-1 lg:col-span-2">
              <SummaryCard
                label="Transactions"
                value={summary.transactionCount.toString()}
                description="Total records this month"
                tone="neutral"
              />
            </div>
          </div>

          {/* Advanced Analytics Charts */}
          <DashboardCharts 
            accountBalances={accountBalances}
            historicalSummary={historicalSummary}
            categorySummary={categorySummary.categories}
          />

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