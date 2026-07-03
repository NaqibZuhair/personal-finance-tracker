import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import ButtonLink from '../components/ui/ButtonLink';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account preferences and settings."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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

      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-expense-50 px-5 py-4 text-sm font-bold text-expense-600 transition hover:bg-expense-100 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>

    </section>
  );
}
