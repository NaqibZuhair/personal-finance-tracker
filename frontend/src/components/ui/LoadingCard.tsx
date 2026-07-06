type LoadingCardProps = {
  message: string;
};

function LoadingCard({ message }: LoadingCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-400 dark:bg-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}

export default LoadingCard;