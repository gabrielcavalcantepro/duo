import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import AppShell from './components/layout/AppShell';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import GoalDetail from './pages/Goals/GoalDetail';
import Budget from './pages/Budget';
import Meeting from './pages/Meeting';
import Challenge from './pages/Challenge';
import Reports from './pages/Reports';
import Split from './pages/Split';
import Settings from './pages/Settings';

import useAuthStore from './store/authStore';

function ProtectedRoute({ children }) {
  const { isOnboarded } = useAuthStore();
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function RootRedirect() {
  const { isOnboarded } = useAuthStore();
  return <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace />;
}

export default function App() {
  const { loadCouple } = useAuthStore();

  useEffect(() => { loadCouple(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid rgba(212,83,126,0.12)',
            boxShadow: '0 4px 20px rgba(212,83,126,0.12)',
          },
          success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#D4537E', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/goals"        element={<Goals />} />
          <Route path="/goals/:id"    element={<GoalDetail />} />
          <Route path="/budget"       element={<Budget />} />
          <Route path="/meeting"      element={<Meeting />} />
          <Route path="/challenge"    element={<Challenge />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/split"        element={<Split />} />
          <Route path="/settings"     element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
