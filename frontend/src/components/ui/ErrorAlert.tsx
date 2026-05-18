type ErrorAlertProps = {
  message: string;
};

function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
      {message}
    </div>
  );
}

export default ErrorAlert;