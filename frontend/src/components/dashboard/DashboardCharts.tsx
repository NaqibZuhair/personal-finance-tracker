import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { AccountBalance } from '../../types/account';
import type { CategorySummaryItem } from './CategorySummaryList';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';

export type HistoricalItem = {
  month: string;
  income: number;
  expense: number;
};

export type DailyItem = {
  day: string;
  income: number;
  expense: number;
};

interface DashboardChartsProps {
  accountBalances: AccountBalance[];
  historicalSummary: HistoricalItem[];
  categorySummary: CategorySummaryItem[];
  dailySummary?: DailyItem[];
  selectedMonth?: string;
}

type ChartMode = 'all' | 'income' | 'expense' | 'net';
type PeriodMode = 'daily' | 'monthly';

const COLORS = [
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

const formatYAxisTick = (value: number) => {
  if (value === 0) return 'Rp0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp${Number((abs / 1_000_000_000).toFixed(1))}M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp${Number((abs / 1_000_000).toFixed(1))}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${Number((abs / 1_000).toFixed(0))}rb`;
  }
  return `${sign}Rp${abs}`;
};

export default function DashboardCharts({
  accountBalances,
  historicalSummary,
  dailySummary = [],
  selectedMonth,
}: DashboardChartsProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('all');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('daily');
  const { isDark } = useTheme();

  const chartData = periodMode === 'daily' && dailySummary.length > 0
    ? dailySummary.map((item) => {
        const date = new Date(`${item.day}T00:00:00.000Z`);
        const dayNum = date.getUTCDate();
        const monthShort = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        return {
          name: `${dayNum} ${monthShort}`,
          Income: item.income,
          Expense: item.expense,
          Net: item.income - item.expense,
        };
      })
    : historicalSummary.map((item) => {
        const date = new Date(`${item.month}-01T00:00:00.000Z`);
        return {
          name: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          Income: item.income,
          Expense: item.expense,
          Net: item.income - item.expense,
        };
      });

  const accountData = accountBalances
    .filter((a) => a.currentBalance > 0)
    .map((a) => ({
      name: a.name,
      value: a.currentBalance,
    }));

  const customTooltipFormatter = (value: any, name?: string | number) => {
    if (typeof value === 'number') {
      return [formatCurrency(value), name || ''];
    }
    return [String(value), name || ''];
  };

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const tickFill = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    borderRadius: '12px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.25)',
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-200 hover:shadow-md md:col-span-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              {periodMode === 'daily' ? `Daily Cashflow (${selectedMonth || 'This Month'})` : 'Financial Cashflow Analysis (6 Months)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Interactive breakdown of your income, expense, and net trajectory
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center flex-nowrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setPeriodMode('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  periodMode === 'daily'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setPeriodMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  periodMode === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                6 Months
              </button>
            </div>

            <div className="flex items-center flex-nowrap overflow-x-auto max-w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 border border-slate-200/50 dark:border-slate-700/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                onClick={() => setChartMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  chartMode === 'all'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm scale-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 scale-95 hover:scale-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                All
              </button>
              <button
                onClick={() => setChartMode('income')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  chartMode === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm scale-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 scale-95 hover:scale-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Income
              </button>
              <button
                onClick={() => setChartMode('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  chartMode === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm scale-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 scale-95 hover:scale-100'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                Expense
              </button>
              <button
                onClick={() => setChartMode('net')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  chartMode === 'net'
                    ? 'bg-indigo-600 text-white shadow-sm scale-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 scale-95 hover:scale-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Net
              </button>
            </div>
          </div>
        </div>

        <div className="h-[240px] sm:h-[260px] w-full transition-all duration-500">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'net' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: tickFill }} minTickGap={10} dy={10} />
                <YAxis
                  width={65}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: tickFill }}
                  tickFormatter={formatYAxisTick}
                />
                <Tooltip formatter={customTooltipFormatter} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Area type="monotone" dataKey="Net" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: tickFill }} minTickGap={10} dy={10} />
                <YAxis
                  width={65}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: tickFill }}
                  tickFormatter={formatYAxisTick}
                />
                <Tooltip
                  formatter={customTooltipFormatter}
                  cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc' }}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                {(chartMode === 'all' || chartMode === 'income') && (
                  <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                )}
                {(chartMode === 'all' || chartMode === 'expense') && (
                  <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account Breakdown */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-200 hover:shadow-md md:col-span-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Asset Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distribution of active balances
          </p>
        </div>
        <div className="h-[240px] sm:h-[260px] w-full mt-4">
          {accountData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {accountData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} contentStyle={tooltipStyle} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              No active balances
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
