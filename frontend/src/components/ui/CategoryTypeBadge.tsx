import type { TransactionType } from '../../types/transaction';

type CategoryTypeBadgeProps = {
  type: TransactionType;
};

function CategoryTypeBadge({ type }: CategoryTypeBadgeProps) {
  const badgeClass =
    type === 'income'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : type === 'expense'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-blue-200 bg-blue-50 text-blue-700';

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}
    >
      {type}
    </span>
  );
}

export default CategoryTypeBadge;