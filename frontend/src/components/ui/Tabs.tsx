import type { ReactNode } from 'react';

type TabsProps = {
  options: { label: string; value: string; icon?: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function Tabs({ options, value, onChange, className = '' }: TabsProps) {
  return (
    <div className={`inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
            value === option.value
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
