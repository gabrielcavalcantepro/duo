import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="flex flex-col min-h-dvh bg-[var(--surface)]">
      <main role="main" className="flex-1 flex flex-col pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
