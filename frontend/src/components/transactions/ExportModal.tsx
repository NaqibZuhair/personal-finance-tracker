import Modal from '../ui/Modal';

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'xlsx' | 'csv') => void;
  onPrint?: () => void;
  title?: string;
  description?: string;
  printLabel?: string;
  printDescription?: string;
};

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  onPrint,
  title = 'Export & Backup Data',
  description = 'Choose your preferred file format for downloading or printing your financial records.',
  printLabel = 'Spreadsheet Preview & Print (.pdf)',
  printDescription = 'Open a clean web spreadsheet report in a new tab to inspect or print',
}: ExportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pt-1">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{description}</p>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => {
              onExport('xlsx');
              onClose();
            }}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Excel Spreadsheet (.xlsx)</h4>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Formatted spreadsheet with headers, currency & numbers</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onExport('csv');
              onClose();
            }}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-left transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Plain Text (.csv)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Lightweight comma-separated format for scripts & backup</p>
              </div>
            </div>
          </button>

          {onPrint && (
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  if (onPrint) onPrint();
                }, 350);
              }}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-left transition-all hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-500/10 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 group-hover:scale-105 transition-transform">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{printLabel}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{printDescription}</p>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
