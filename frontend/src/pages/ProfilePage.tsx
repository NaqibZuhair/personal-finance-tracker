import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import PageHeader from '../components/ui/PageHeader';
import ButtonLink from '../components/ui/ButtonLink';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Edit Profile State
  const [name, setName] = useState(user?.name || '');
  const [waPhone, setWaPhone] = useState(user?.waPhone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const res = await apiClient<{ message: string; data: any }>('/auth/profile', {
        method: 'PUT',
        body: { name, waPhone: waPhone || null },
      });
      updateUser({ name: res.data.name, waPhone: res.data.waPhone });
      setProfileSuccess('Profil berhasil diubah!');
    } catch (err: any) {
      setProfileError(err.message || 'Gagal mengubah profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const res = await apiClient<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
      setPasswordSuccess(res.message || 'Password berhasil diganti!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengganti password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);

    try {
      await apiClient('/auth/account', { method: 'DELETE' });
      await logout();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus akun');
      setDeleteLoading(false);
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Profile & Settings"
        description="Kelola preferensi akun, nomor WhatsApp AI, dan keamanan sandi Anda."
      />

      {/* User Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {user?.waPhone && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                🤖 WA: +{user.waPhone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors">
          <ButtonLink to="/categories" variant="secondary" className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-700">Manage Categories</span>
            </div>
            <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>
        </div>
        
        <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors">
          <ButtonLink to="/budgets" variant="secondary" className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-700">Manage Budgets</span>
            </div>
            <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>
        </div>

        <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors">
          <ButtonLink to="/goals" variant="secondary" className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-700">Manage Goals</span>
            </div>
            <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>
        </div>

        <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors">
          <ButtonLink to="/recurring" variant="secondary" className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="font-semibold text-slate-700">Manage Subscriptions</span>
            </div>
            <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>
        </div>

        <div className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors">
          <ButtonLink to="/routines" variant="secondary" className="w-full justify-start text-left border-0 shadow-none !bg-transparent !px-2 !py-2 hover:!bg-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-700">Manage Paycheck Routines</span>
            </div>
            <svg className="h-5 w-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </ButtonLink>
        </div>

        <div className="p-4 hover:bg-slate-50 transition-colors">
          <button 
            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/transactions/export`, '_blank')}
            className="flex w-full items-center justify-between border-0 shadow-none bg-transparent px-2 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="font-semibold text-slate-700">Download Backup CSV</span>
            </div>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900">✏️ Edit Informasi Profil</h3>
        {profileError && (
          <div className="rounded-lg bg-expense-50 p-3 text-sm font-medium text-expense-800">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {profileSuccess}
          </div>
        )}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp (Untuk Notifikasi AI & Lupa Password OTP)
            </label>
            <input
              type="tel"
              placeholder="cth: 08123456789"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-600 disabled:bg-slate-400 transition"
          >
            {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900">🔒 Ganti Password</h3>
        {passwordError && (
          <div className="rounded-lg bg-expense-50 p-3 text-sm font-medium text-expense-800">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {passwordSuccess}
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Saat Ini
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-600 disabled:bg-slate-400 transition"
          >
            {passwordLoading ? 'Mengganti...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Logout & Danger Zone */}
      <div className="space-y-4 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>

        <div className="rounded-2xl border border-expense-200 bg-expense-50/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-expense-800">Danger Zone: Hapus Akun Permanen</h4>
              <p className="text-xs text-expense-600">
                Semua data dompet, transaksi, dan histori AI Anda akan dihapus selamanya. Action ini tidak dapat dibatalkan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="rounded-xl bg-expense-600 px-4 py-2 text-xs font-bold text-white hover:bg-expense-700 transition shadow-2xs whitespace-nowrap"
            >
              Hapus Akun
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-expense-600">
              ⚠️ Konfirmasi Hapus Akun Permanen
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong>{user?.email}</strong>? Semua transaksi keuangan Anda akan hilang dan tidak dapat dipulihkan kembali.
            </p>
            {deleteError && (
              <div className="rounded-lg bg-expense-50 p-3 text-xs font-semibold text-expense-800">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-1/2 rounded-xl bg-expense-600 py-2.5 text-xs font-bold text-white hover:bg-expense-700 disabled:bg-expense-400"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
