import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Tabs } from '../ui/Tabs';

export type CategorySummaryItem = {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
};

type Props = {
  totalExpense: number;
  categories: CategorySummaryItem[];
  totalIncome?: number;
  incomeCategories?: CategorySummaryItem[];
};

const EXPENSE_COLORS = [
  '#f43f5e', // rose-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
];

const INCOME_COLORS = [
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
];

export default function CategorySummaryList({
  totalExpense,
  categories,
  totalIncome = 0,
  incomeCategories = [],
}: Props) {
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('pie');
  const [typeMode, setTypeMode] = useState<'expense' | 'income'>('expense');

  const activeCategories = typeMode === 'expense' ? categories : incomeCategories;
  const activeTotal = typeMode === 'expense' ? totalExpense : totalIncome;
  const activeColors = typeMode === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;

  const chartData = [...activeCategories]
    .sort((a, b) => b.total - a.total)
    .map((cat, index) => ({
      name: cat.categoryName,
      value: Number(cat.total),
      color: activeColors[index % activeColors.length],
    }));

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg sm:text-xl">
            {typeMode === 'expense' ? 'Expense by Category' : 'Income by Category'}
          </CardTitle>
          <CardDescription>
            {typeMode === 'expense'
              ? 'See where your money went this month.'
              : 'See where your money came from this month.'}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setTypeMode('expense')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                typeMode === 'expense'
                  ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTypeMode('income')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                typeMode === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          <Tabs
            value={viewMode}
            onChange={(v) => setViewMode(v as 'bar' | 'pie')}
            options={[
              { value: 'pie', label: '', icon: <PieChartIcon size={16} /> },
              { value: 'bar', label: '', icon: <BarChart3 size={16} /> },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6 rounded-xl border border-slate-200/60 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400 sm:text-xs">
            {typeMode === 'expense' ? 'Total Expense' : 'Total Income'}
          </p>
          <p
            className={`mt-1 text-xl font-black sm:text-2xl ${
              typeMode === 'expense'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatCurrency(activeTotal)}
          </p>
        </div>

        {activeCategories.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No {typeMode === 'expense' ? 'expenses' : 'incomes'} recorded for this month.
          </p>
        ) : viewMode === 'pie' ? (
          <div className="h-[280px] w-full animate-in fade-in zoom-in-95 duration-300 sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {chartData.map((category) => {
              const percentage = activeTotal > 0 ? (category.value / activeTotal) * 100 : 0;
              return (
                <div key={category.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="font-bold" style={{ color: category.color }}>
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%`, backgroundColor: category.color }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}