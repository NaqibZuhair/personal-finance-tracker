import { NavLink } from 'react-router';

export default function BottomNav() {
  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
      isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
    }`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-t border-slate-200/50 bg-white/80 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      
      {/* Dashboard Tab */}
      <NavLink to="/" className={getNavClass} end>
        <>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Dashboard</span>
        </>
      </NavLink>

      {/* Transactions Tab */}
      <NavLink to="/transactions" className={getNavClass} end>
        <>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-medium">History</span>
        </>
      </NavLink>

      {/* FAB - Add Transaction */}
      <div className="relative -top-5 flex w-full justify-center">
        <NavLink
          to="/transactions/new"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/40 ring-4 ring-white transition-transform active:scale-95"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </NavLink>
      </div>

      {/* Accounts Tab */}
      <NavLink to="/accounts" className={getNavClass}>
        <>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-[10px] font-medium">Accounts</span>
        </>
      </NavLink>

      {/* Profile Tab */}
      <NavLink to="/profile" className={getNavClass}>
        <>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </>
      </NavLink>

    </nav>
  );
}
