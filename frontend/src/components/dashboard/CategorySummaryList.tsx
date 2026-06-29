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
};

// Generate an array of nice colors for the pie chart
const COLORS = [
  '#f43f5e', // rose-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
];

export default function CategorySummaryList({ totalExpense, categories }: Props) {
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('pie');

  // Prepare data for recharts, sort by amount descending
  const chartData = [...categories]
    .sort((a, b) => b.total - a.total)
    .map((cat, index) => ({
      name: cat.categoryName,
      value: Number(cat.total),
      color: COLORS[index % COLORS.length]
    }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Expense by Category</CardTitle>
          <CardDescription>See where your money went this month.</CardDescription>
        </div>
        <Tabs
          value={viewMode}
          onChange={(v) => setViewMode(v as 'bar' | 'pie')}
          options={[
            { value: 'pie', label: '', icon: <PieChartIcon size={16} /> },
            { value: 'bar', label: '', icon: <BarChart3 size={16} /> }
          ]}
        />
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 rounded-xl bg-slate-50 p-4">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Expense
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No expenses recorded for this month.
          </p>
        ) : viewMode === 'pie' ? (
          <div className="h-[300px] w-full animate-in fade-in zoom-in-95 duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {chartData.map((category) => {
              const percentage = totalExpense > 0 ? (category.value / totalExpense) * 100 : 0;
              return (
                <div key={category.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-900">{category.name}</span>
                    <span className="font-bold" style={{ color: category.color }}>
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%`, backgroundColor: category.color }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-slate-500">
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