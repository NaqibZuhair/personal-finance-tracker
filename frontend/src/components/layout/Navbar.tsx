import { Link, NavLink } from 'react-router';

function Navbar() {
  const baseNavClass =
    'rounded-lg px-3 py-2 text-sm font-medium transition';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseNavClass} bg-slate-900 text-white`
      : `${baseNavClass} text-slate-600 hover:bg-slate-100 hover:text-slate-950`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-lg font-bold text-slate-900">
          Personal Finance Tracker
        </Link>

        <nav className="flex flex-wrap gap-2">
          <NavLink to="/" end className={getNavClass}>
            Dashboard
          </NavLink>

          <NavLink to="/transactions" className={getNavClass}>
            Transactions
          </NavLink>

          <NavLink to="/transactions/new" className={getNavClass}>
            Add Transaction
          </NavLink>

          <NavLink to="/categories" className={getNavClass}>
            Categories
          </NavLink>

          <NavLink to="/accounts" className={getNavClass}>
            Accounts
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;