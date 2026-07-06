import { useEffect } from 'react';
import Button from './Button';
import DialogIcon, { type DialogIconVariant } from './DialogIcon';

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  warningText?: string;
  confirmText?: string;
  confirmVariant?: DialogIconVariant | 'danger' | 'primary';
  isLoading?: boolean;
};

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xl space-y-4 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <DialogIcon variant={confirmVariant as DialogIconVariant} size={28} />

        <div className="space-y-1 w-full">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs leading-normal text-slate-500 dark:text-slate-400">{message}</p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl py-2 px-3 font-semibold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition disabled:opacity-50 whitespace-nowrap truncate"
          >
            Cancel
          </button>
          <Button
            type="button"
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 justify-center py-2 px-3 text-xs rounded-xl shadow-xs whitespace-nowrap truncate"
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
