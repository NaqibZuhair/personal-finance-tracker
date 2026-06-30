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
} from 'recharts';
import type { AccountBalance } from '../../types/account';
import type { CategorySummaryItem } from './CategorySummaryList';
import { formatCurrency } from '../../utils/formatters';

export type HistoricalItem = {
  month: string;
  income: number;
  expense: number;
};

interface DashboardChartsProps {
  accountBalances: AccountBalance[];
  historicalSummary: HistoricalItem[];
  categorySummary: CategorySummaryItem[];
}

const COLORS = [
  '#0ea5e9', // primary-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
];

export default function DashboardCharts({
  accountBalances,
  historicalSummary,
  categorySummary,
}: DashboardChartsProps) {
  
  // Format dates for historical chart
  const historicalData = historicalSummary.map(item => {
    const date = new Date(`${item.month}-01T00:00:00.000Z`);
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Income: item.income,
      Expense: item.expense
    };
  });

  // Filter accounts with balance > 0
  const accountData = accountBalances
    .filter(a => a.currentBalance > 0)
    .map(a => ({
      name: a.name,
      value: a.currentBalance
    }));

  // Take top 5 categories
  const categoryData = categorySummary
    .slice(0, 5)
    .map(c => ({
      name: c.categoryName,
      value: c.total
    }));

  const customTooltipFormatter = (value: number) => {
    return [formatCurrency(value), ''];
  };

  return (
    <div className="space-y-6">
      {/* Historical Trend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-bold text-slate-900">Income vs Expense (6 Months)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicalData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={customTooltipFormatter}
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold text-slate-900">Asset Breakdown</h3>
          <div className="h-[250px] w-full">
            {accountData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {accountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={customTooltipFormatter}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No active balances
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold text-slate-900">Top Categories (This Month)</h3>
          <div className="h-[250px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={customTooltipFormatter}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No expenses this month
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
