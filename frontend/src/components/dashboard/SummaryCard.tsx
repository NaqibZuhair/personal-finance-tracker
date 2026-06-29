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
  const toneClass = {
    neutral: 'border-slate-200 bg-white text-slate-900',
    income: 'border-income-100 bg-income-50 text-income-900',
    expense: 'border-expense-100 bg-expense-50 text-expense-900',
    balance: 'border-primary-100 bg-primary-50 text-primary-900',
  };

  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        toneClass[tone]
      }`}
    >
      <p className="text-sm font-medium opacity-75">{label}</p>

      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>

      <p className="mt-2 text-sm opacity-70">{description}</p>
    </div>
  );
}

export default SummaryCard;