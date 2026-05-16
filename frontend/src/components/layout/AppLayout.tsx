import type { ReactNode } from 'react';
import Navbar from './Navbar';

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </main>
  );
}

export default AppLayout;