import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/transactions/new', label: 'Add Transaction' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/categories', label: 'Categories' },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const baseNavClass = 'rounded-lg px-4 py-2 text-sm font-semibold transition';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseNavClass} bg-slate-950 text-white shadow-sm`
      : `${baseNavClass} text-slate-600 hover:bg-slate-100 hover:text-slate-950`;



  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="text-lg font-bold text-slate-950"
        >
          Personal Finance Tracker
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavClass}>
              {item.label}
            </NavLink>
          ))}
          <div className="ml-4 flex items-center gap-4 border-l border-slate-200 pl-4">
            <span className="text-sm text-slate-500">Hi, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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