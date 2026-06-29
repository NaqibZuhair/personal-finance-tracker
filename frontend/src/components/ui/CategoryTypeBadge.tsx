import type { TransactionType } from '../../types/transaction';

type CategoryTypeBadgeProps = {
  type: TransactionType;
};

function CategoryTypeBadge({ type }: CategoryTypeBadgeProps) {
  const colorClass =
    type === 'income'
      ? 'border-income-200 bg-income-50 text-income-700'
      : type === 'expense'
        ? 'border-expense-200 bg-expense-50 text-expense-700'
        : 'border-transfer-200 bg-transfer-50 text-transfer-700';

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${colorClass}`}
    >
      {type}
    </span>
  );
}

export default CategoryTypeBadge;