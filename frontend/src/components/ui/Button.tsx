import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-xl px-5 py-1 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60';

  const variantClass = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    secondary:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  };

  return (
    <button
      type="button"
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;