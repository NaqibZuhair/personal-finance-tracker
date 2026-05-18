import type { ReactNode } from 'react';
import { Link } from 'react-router';

type ButtonLinkVariant = 'primary' | 'secondary';

type ButtonLinkProps = {
  to: string;
  children: ReactNode;
  variant?: ButtonLinkVariant;
  className?: string;
};

function ButtonLink({
  to,
  children,
  variant = 'primary',
  className = '',
}: ButtonLinkProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition';

  const variantClass = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    secondary:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  };

  return (
    <Link to={to} className={`${baseClass} ${variantClass[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export default ButtonLink;