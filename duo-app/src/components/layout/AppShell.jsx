import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import PageTransition from './PageTransition';

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--surface)]">
      <main role="main" className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
