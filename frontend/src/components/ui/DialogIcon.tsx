import { AlertTriangle, Zap, Trash2, LogOut, CheckCircle2, Info } from 'lucide-react';

export type DialogIconVariant = 'danger' | 'primary' | 'warning' | 'success' | 'info' | 'logout';

type DialogIconProps = {
  variant?: DialogIconVariant;
  size?: number;
  className?: string;
};

export default function DialogIcon({
  variant = 'danger',
  size = 32,
  className = '',
}: DialogIconProps) {
  const colorClass =
    variant === 'danger'
      ? 'text-rose-600'
      : variant === 'warning'
      ? 'text-amber-500'
      : variant === 'success'
      ? 'text-emerald-600'
      : variant === 'logout'
      ? 'text-primary-600'
      : 'text-primary-600';

  const combinedClassName = `${colorClass} ${className}`.trim();

  switch (variant) {
    case 'danger':
      return <Trash2 size={size} className={combinedClassName} strokeWidth={1.75} />;
    case 'warning':
      return <AlertTriangle size={size} className={combinedClassName} strokeWidth={1.75} />;
    case 'success':
      return <CheckCircle2 size={size} className={combinedClassName} strokeWidth={1.75} />;
    case 'logout':
      return <LogOut size={size} className={combinedClassName} strokeWidth={1.75} />;
    case 'info':
      return <Info size={size} className={combinedClassName} strokeWidth={1.75} />;
    case 'primary':
    default:
      return <Zap size={size} className={combinedClassName} strokeWidth={1.75} />;
  }
}
