import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import PageHeader from '../components/ui/PageHeader';
import ButtonLink from '../components/ui/ButtonLink';
import Button from '../components/ui/Button';
import ErrorAlert from '../components/ui/ErrorAlert';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);

    try {
      await apiClient('/auth/account', { method: 'DELETE' });
      await logout();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  const initials = user.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="space-y-8 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account identity, security preferences, and data."
      />

      {/* User Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-xl font-bold text-primary-600 border border-primary-100 shadow-xs">
            {initials}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{user.email}</span>
              {user.waPhone ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.118 1.528 5.85L.036 23.964l6.233-1.488C7.942 23.418 9.92 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.95 17.153c-.25.7-1.45 1.346-2.025 1.433-.575.087-1.125.13-3.625-.91-3.025-1.258-4.975-4.358-5.125-4.558-.15-.2-1.225-1.633-1.225-3.117 0-1.483.775-2.217 1.05-2.517.275-.3.6-.375.8-.375.2 0 .4.004.575.013.187.008.438-.07.688.53.25.6 1 2.45 1.088 2.625.088.175.15.38.025.61-.125.23-.188.375-.375.59-.188.216-.388.483-.558.65-.188.188-.388.39-.163.775.225.388 1.008 1.666 2.167 2.698 1.492 1.33 2.748 1.74 3.136 1.933.388.193.613.16.838-.1.225-.26.963-1.125 1.225-1.512.263-.388.525-.325.888-.192.363.133 2.313 1.092 2.713 1.292.4.2.663.3.763.467.1.167.1 0.967-.15 1.667z"/>
                  </svg>
                  +{user.waPhone}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  No WhatsApp Linked
                </span>
              )}
            </div>
          </div>
        </div>

        <ButtonLink to="/profile/edit" variant="secondary" className="shrink-0">
          Edit Profile
        </ButtonLink>
      </div>

      {/* Account Settings Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 px-1">
          Account Settings
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ButtonLink
            to="/profile/edit"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left space-y-1">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Personal Information
              </span>
              <span className="block text-xs font-normal text-slate-500">
                Update your display name and WhatsApp number.
              </span>
            </div>
            <svg className="h-5 w-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>

          <ButtonLink
            to="/profile/password"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left space-y-1">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Security Password
              </span>
              <span className="block text-xs font-normal text-slate-500">
                Change your account authentication password.
              </span>
            </div>
            <svg className="h-5 w-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>
        </div>
      </div>

      {/* Financial Management Quick Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 px-1">
          Financial Management
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ButtonLink
            to="/categories"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Categories
              </span>
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                Organize income and expense groups.
              </span>
            </div>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>

          <ButtonLink
            to="/budgets"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Monthly Budgets
              </span>
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                Set spending limits by category.
              </span>
            </div>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>

          <ButtonLink
            to="/goals"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Savings Goals
              </span>
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                Track financial targets over time.
              </span>
            </div>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>

          <ButtonLink
            to="/recurring"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Subscriptions
              </span>
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                Manage automated bills and payments.
              </span>
            </div>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>

          <ButtonLink
            to="/routines"
            variant="secondary"
            className="flex items-center justify-between !p-5 !h-auto rounded-2xl border border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/50 transition group"
          >
            <div className="text-left">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Paycheck Routines
              </span>
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                Automate income distribution rules.
              </span>
            </div>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>

          <a
            href="/api/export"
            download
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition group font-medium text-sm shadow-xs"
          >
            <div className="text-left">
              <span className="block font-semibold text-slate-900 group-hover:text-primary-600 transition">
                Export Backup
              </span>
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                Download all transactions as CSV.
              </span>
            </div>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>

      {/* Danger Zone & Logout */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-600 px-1">
          Danger Zone
        </h3>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-slate-900">Delete Account</h4>
            <p className="text-xs text-slate-500 mt-1">
              Permanently remove your account and all associated transaction records. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0"
          >
            Delete Account
          </Button>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="px-6 py-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
          >
            Log Out of Session
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Account Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {deleteError && <ErrorAlert message={deleteError} />}

            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                Are you absolutely sure you want to delete your account <strong className="text-slate-900">{user.email}</strong>?
              </p>
              <p className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 border border-rose-100">
                All transaction histories, account balances, budgets, savings goals, and paycheck allocation routines will be permanently erased.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2.5 justify-center"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="w-1/2 py-2.5 justify-center"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
