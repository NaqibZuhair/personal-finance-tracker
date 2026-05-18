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
    income: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    expense: 'border-rose-100 bg-rose-50 text-rose-900',
    balance: 'border-blue-100 bg-blue-50 text-blue-900',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${toneClass[tone]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>

      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>

      <p className="mt-2 text-sm opacity-70">{description}</p>
    </div>
  );
}

export default SummaryCard;