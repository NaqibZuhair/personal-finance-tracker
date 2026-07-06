import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '../lib/apiClient';
import PageHeader from '../components/ui/PageHeader';
import ButtonLink from '../components/ui/ButtonLink';
import Button from '../components/ui/Button';
import ErrorAlert from '../components/ui/ErrorAlert';

type PasswordUpdateResponse = {
  message: string;
};

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient<PasswordUpdateResponse>('/auth/password', {
        method: 'PUT',
        body: {
          currentPassword,
          newPassword,
        },
      });

      setSuccessMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to change password',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Change Security Password"
          description="Ensure your account uses a strong, unique password to keep your financial data secure."
        />
        <ButtonLink to="/profile" variant="secondary">
          Back to Profile
        </ButtonLink>
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-300 shadow-sm">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type your new password"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <ButtonLink to="/profile" variant="secondary" className="px-5 py-2.5">
              Cancel
            </ButtonLink>
            <Button type="submit" disabled={isLoading} className="px-6 py-2.5">
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
