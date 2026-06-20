import { useState } from 'react';
import { Link, NavLink } from 'react-router';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/transactions/new', label: 'Add Transaction' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/categories', label: 'Categories' },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseNavClass = 'rounded-lg px-4 py-2 text-sm font-semibold transition';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseNavClass} bg-slate-950 text-white shadow-sm`
      : `${baseNavClass} text-slate-600 hover:bg-slate-100 hover:text-slate-950`;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          onClick={closeMenu}
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
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 shadow-sm transition duration-200 hover:bg-slate-50 active:scale-95 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="relative h-5 w-5">
            <span
              className={`absolute left-0 top-1 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                isMenuOpen ? 'top-2 rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                isMenuOpen ? 'top-2 -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </div>

      <nav
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 ease-in-out md:hidden ${
          isMenuOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 border-t-0 opacity-0'
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'translate-y-0' : '-translate-y-3'
          }`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={getNavClass}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;