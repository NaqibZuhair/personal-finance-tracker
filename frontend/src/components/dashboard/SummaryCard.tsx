import { LayoutDashboard, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

type SummaryCardProps = {
  label: string;
  value: string;
  description: string;
  tone?: 'neutral' | 'income' | 'expense' | 'balance';
};

function SummaryCard({
  label,
  value,
  description,
  tone = 'neutral',
}: SummaryCardProps) {
  const toneColors = {
    neutral: 'text-slate-900',
    income: 'text-income-600',
    expense: 'text-expense-600',
    balance: 'text-primary-600',
  };

  const toneBackgrounds = {
    neutral: 'bg-slate-100',
    income: 'bg-income-50',
    expense: 'bg-expense-50',
    balance: 'bg-primary-50',
  };

  const toneIcons = {
    neutral: () => <LayoutDashboard size={24} />,
    income: () => <TrendingUp size={24} />,
    expense: () => <TrendingDown size={24} />,
    balance: () => <Wallet size={24} />,
  };

  const Icon = toneIcons[tone];

  return (
    <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <div>
          <div className="mb-3">
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${toneBackgrounds[tone]} ${toneColors[tone]}`}
            >
              <div className="scale-75 sm:scale-100 flex items-center justify-center"><Icon /></div>
            </div>
          </div>
          
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate" title={label}>
              {label}
            </p>
            <p className={`mt-0.5 sm:mt-1 text-base sm:text-2xl font-black truncate ${toneColors[tone]}`} title={value}>
              {value}
            </p>
          </div>
        </div>
        
        <p className="mt-3 text-[10px] sm:text-xs font-medium text-slate-500 truncate" title={description}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;