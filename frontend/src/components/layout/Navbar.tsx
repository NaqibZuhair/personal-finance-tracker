import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'History' },
  { to: '/accounts', label: 'Accounts' },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const baseNavClass = 'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseNavClass} bg-primary-600 text-white shadow-md shadow-primary-500/25`
      : `${baseNavClass} text-slate-600 hover:bg-primary-50 hover:text-primary-600`;

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-extrabold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition hover:opacity-90"
        >
          Personal Finance Tracker
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavClass}>
              {item.label}
            </NavLink>
          ))}
          <div className="ml-4 flex items-center gap-4 border-l border-slate-200/80 pl-4">
            <Link to="/profile" className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition">
              Hi, {user?.name}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 shadow-2xs"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;