import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'History' },
  { to: '/accounts', label: 'Accounts' },
];

function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const baseNavClass = 'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseNavClass} bg-primary-600 text-white shadow-md shadow-primary-500/25`
      : `${baseNavClass} text-slate-600 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400`;

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 dark:border-slate-800/80 dark:bg-[#090d16]/90 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-extrabold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition hover:opacity-90 dark:from-primary-400 dark:via-indigo-400 dark:to-purple-400"
        >
          Personal Finance Tracker
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 border-l border-slate-200/80 pl-4 dark:border-slate-800/80">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 hover:scale-110 active:scale-90 transition-all duration-300 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-500 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="w-5 h-5 text-primary-600 transition-transform duration-500 rotate-0 hover:-rotate-12" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/profile" className="text-sm font-semibold text-slate-700 hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-400 transition">
                Hi, {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 shadow-2xs dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;