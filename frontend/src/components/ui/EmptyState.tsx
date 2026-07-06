import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;