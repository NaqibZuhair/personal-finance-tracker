import type { ReactNode } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-slate-900 pb-20 md:pb-0">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      
      <BottomNav />
    </main>
  );
}

export default AppLayout;