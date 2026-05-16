import { Link } from 'react-router';

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold text-slate-900">
          Personal Finance Tracker
        </Link>

        <nav className="flex gap-4 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-950">
            Dashboard
          </Link>

          <Link to="/transactions" className="hover:text-slate-950">
            Transactions
          </Link>

          <Link to="/transactions/new" className="hover:text-slate-950">
            Add Transaction
          </Link>

          <Link to="/categories" className="hover:text-slate-950">
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;