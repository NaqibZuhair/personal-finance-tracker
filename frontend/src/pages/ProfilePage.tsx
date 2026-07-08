import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import PageHeader from '../components/ui/PageHeader';
import ButtonLink from '../components/ui/ButtonLink';
import Button from '../components/ui/Button';
import ErrorAlert from '../components/ui/ErrorAlert';
import Modal from '../components/ui/Modal';
import ExportModal from '../components/transactions/ExportModal';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memoryText, setMemoryText] = useState(user?.aiMemory || '');
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState('');
  const [memorySuccess, setMemorySuccess] = useState('');
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [maskedWaPhone, setMaskedWaPhone] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveMemory = async (newMemory: string | null) => {
    setMemoryLoading(true);
    setMemoryError('');
    setMemorySuccess('');
    try {
      const res = await apiClient<{ message: string; data: any }>('/auth/profile', {
        method: 'PUT',
        body: { aiMemory: newMemory },
      });
      updateUser({ aiMemory: res.data.aiMemory });
      setMemorySuccess(newMemory === null ? 'Memori AI berhasil dikosongkan.' : 'Memori AI berhasil disimpan.');
      setTimeout(() => {
        setShowMemoryModal(false);
        setMemorySuccess('');
      }, 1200);
    } catch (err: any) {
      setMemoryError(err.message || 'Gagal memperbarui memori AI');
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleRequestDeleteOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteSuccess('');
    setDeleteLoading(true);

    try {
      const res = await apiClient<{ message: string; waPhone: string }>('/auth/account/delete-otp', {
        method: 'POST',
        body: { password: deletePassword },
      });
      setMaskedWaPhone(res.waPhone);
      setDeleteSuccess(res.message);
      setDeleteStep(2);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to request verification OTP');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);

    try {
      await apiClient('/auth/account', {
        method: 'DELETE',
        body: { password: deletePassword, otp: deleteOtp },
      });
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
    <section className="space-y-8 max-w-3xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account identity, security preferences, and data."
      />

      {/* User Overview Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
            {initials}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <span>{user.email}</span>
              {user.waPhone ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.118 1.528 5.85L.036 23.964l6.233-1.488C7.942 23.418 9.92 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.95 17.153c-.25.7-1.45 1.346-2.025 1.433-.575.087-1.125.13-3.625-.91-3.025-1.258-4.975-4.358-5.125-4.558-.15-.2-1.225-1.633-1.225-3.117 0-1.483.775-2.217 1.05-2.517.275-.3.6-.375.8-.375.2 0 .4.004.575.013.187.008.438-.07.688.53.25.6 1 2.45 1.088 2.625.088.175.15.38.025.61-.125.23-.188.375-.375.59-.188.216-.388.483-.558.65-.188.188-.388.39-.163.775.225.388 1.008 1.666 2.167 2.698 1.492 1.33 2.748 1.74 3.136 1.933.388.193.613.16.838-.1.225-.26.963-1.125 1.225-1.512.263-.388.525-.325.888-.192.363.133 2.313 1.092 2.713 1.292.4.2.663.3.763.467.1.167.1 0.967-.15 1.667z"/>
                  </svg>
                  +{user.waPhone}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
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

      {/* Account Settings Section - Grouped Card */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Account Settings
        </h3>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm overflow-hidden dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors dark:border-slate-800/80 dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/profile/edit"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-slate-700 dark:text-slate-200">Personal Information</span>
                  <span className="block text-xs font-normal text-slate-400">Update display name and WhatsApp number</span>
                </div>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>

          <div className="p-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/profile/password"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-slate-700 dark:text-slate-200">Security Password</span>
                  <span className="block text-xs font-normal text-slate-400">Change login security password</span>
                </div>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* AI Wealth Advisor Memory & Personalization Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            AI Advisor Memory & Personalization
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Max 1000 Chars</span>
        </div>
        <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/50 via-white to-slate-50 shadow-sm overflow-hidden dark:border-purple-900/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900 backdrop-blur-md p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 shadow-inner">
                <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-100">Ingatan Jangka Panjang AI</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Fakta, habit belanja, atau catatan yang dipelajari AI tentang kamu</span>
              </div>
            </div>
            <button
              onClick={() => {
                setMemoryText(user?.aiMemory || '');
                setShowMemoryModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 active:scale-95 transition-all shadow-sm shadow-purple-600/20 shrink-0"
            >
              Kelola Memori
            </button>
          </div>

          <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3.5 text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {user?.aiMemory ? (
              user.aiMemory
            ) : (
              <span className="text-slate-400 italic">Belum ada ingatan yang disimpan. Coba chat dengan AI dan katakan kebiasaan atau jadwal gajianmu!</span>
            )}
          </div>
        </div>
      </div>

      {/* Financial Management Quick Links - Grouped Card */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Financial Management
        </h3>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm overflow-hidden dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors dark:border-slate-800/80 dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/categories"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Manage Categories</span>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>

          <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors dark:border-slate-800/80 dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/budgets"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Manage Budgets</span>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>

          <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors dark:border-slate-800/80 dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/goals"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Manage Goals</span>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>

          <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors dark:border-slate-800/80 dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/recurring"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Manage Subscriptions</span>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>

          <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors dark:border-slate-800/80 dark:hover:bg-slate-800/50">
            <ButtonLink
              to="/routines"
              variant="secondary"
              className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Manage Paycheck Routines</span>
              </div>
              <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ButtonLink>
          </div>

          <div className="p-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex w-full items-center justify-between border-0 shadow-none bg-transparent px-2 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Export & Backup Financial Data</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone & Logout */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 px-1">
          Danger Zone
        </h3>
        <div className="rounded-2xl border border-rose-200/80 bg-white/90 shadow-sm overflow-hidden dark:border-rose-500/20 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="p-4 hover:bg-rose-50/40 transition-colors dark:hover:bg-rose-500/10">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center justify-between border-0 shadow-none bg-transparent px-2 py-2 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-rose-600 dark:text-rose-400">Delete Account</span>
                  <span className="block text-xs font-normal text-slate-400">Permanently erase all your financial data</span>
                </div>
              </div>
              <svg className="h-5 w-5 text-rose-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-expense-50 px-5 py-4 text-sm font-bold text-expense-600 transition hover:bg-expense-100 active:scale-95 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteStep(1);
          setDeleteError('');
          setDeleteSuccess('');
        }}
        title={deleteStep === 1 ? 'Security Verification' : 'Confirm Account Deletion'}
      >
        <div className="space-y-6">
          {deleteError && <ErrorAlert message={deleteError} />}
          {deleteSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {deleteSuccess}
            </div>
          )}

          {!user.waPhone ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium leading-relaxed text-amber-800">
                For bank-level security, we require a WhatsApp OTP confirmation to permanently erase an account. You currently do not have a WhatsApp number linked to your profile.
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 justify-center py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    navigate('/profile/edit');
                  }}
                  className="w-1/2 justify-center py-2.5"
                >
                  Link WhatsApp First
                </Button>
              </div>
            </div>
          ) : deleteStep === 1 ? (
            <form onSubmit={handleRequestDeleteOtp} className="space-y-4">
              <div className="space-y-2 text-sm leading-relaxed text-slate-600">
                <p>
                  You are initiating permanent deletion for <strong className="text-slate-900">{user.email}</strong>.
                </p>
                <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  To prevent unauthorized deletion, please enter your current login password. We will send a 6-digit verification code to your WhatsApp.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Current Login Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 justify-center py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={deleteLoading}
                  className="w-1/2 justify-center py-2.5"
                >
                  {deleteLoading ? 'Verifying...' : 'Send OTP to WhatsApp'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-2 text-sm leading-relaxed text-slate-600">
                <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  Warning: Entering the OTP will immediately and permanently erase your account, transaction histories, budgets, and savings goals.
                </p>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit verification code sent to your WhatsApp ({maskedWaPhone || '+' + user.waPhone}).
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  6-Digit Verification Code (OTP)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-center text-lg font-bold tracking-widest text-slate-900 placeholder-slate-300 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setDeleteStep(1);
                    setDeleteOtp('');
                    setDeleteError('');
                  }}
                  className="w-1/3 justify-center py-2.5"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={deleteLoading || deleteOtp.length !== 6}
                  className="w-2/3 justify-center py-2.5"
                >
                  {deleteLoading ? 'Erasing Data...' : 'Permanently Delete Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Modal Kelola Memori AI */}
      <Modal
        isOpen={showMemoryModal}
        onClose={() => {
          setShowMemoryModal(false);
          setMemoryError('');
          setMemorySuccess('');
        }}
        title="🧠 Kelola Ingatan & Habit AI"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Ini adalah fakta keuangan dan habit yang diingat oleh AI tentang kamu. Kamu bisa mengedit secara manual atau mengosongkan seluruh memori jika ingin memulai dari awal.
          </p>

          {memoryError && <ErrorAlert message={memoryError} />}
          {memorySuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-500/10 dark:text-emerald-300">
              {memorySuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Isi Memori AI (Fakta & Habit):</span>
              <span className={memoryText.length > 900 ? 'text-rose-500 font-bold' : ''}>
                {memoryText.length} / 1000 Karakter
              </span>
            </div>
            <textarea
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              maxLength={1000}
              rows={6}
              placeholder="Contoh: Gajian tiap tanggal 25 sebesar 10 juta. Habit pagi beli kopi 20rb. Target menabung untuk nikah tahun depan."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              onClick={() => handleSaveMemory(null)}
              disabled={memoryLoading || !user?.aiMemory}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 disabled:opacity-40 transition-all dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-400"
            >
              🗑️ Kosongkan Semua (Clear)
            </button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowMemoryModal(false)}
                className="py-2 text-xs"
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={() => handleSaveMemory(memoryText.trim() || null)}
                disabled={memoryLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-purple-600/30"
              >
                {memoryLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(format) => {
          window.open(`${import.meta.env.VITE_API_BASE_URL}/transactions/export?format=${format}`, '_blank');
        }}
        onPrint={() => window.open('/transactions/preview', '_blank')}
        title="Full Account Backup"
        description="Download your complete transaction history across all accounts and categories since the beginning of time."
        printLabel="Spreadsheet Preview & Print (.pdf)"
        printDescription="Open a clean spreadsheet preview in a new tab to inspect or print full history"
      />
    </section>
  );
}
