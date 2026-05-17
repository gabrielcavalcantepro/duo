import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AppShell from './components/layout/AppShell';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import PartnerSetup from './pages/Auth/PartnerSetup';
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
import Profile from './pages/Profile';

import useAuthStore from './store/authStore';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isOnboarded, loading } = useAuthStore();
  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--surface)]">
      <div className="w-10 h-10 rounded-2xl bg-[var(--rose)] animate-pulse" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function OnboardingRoute({ children }) {
  const { isAuthenticated, isOnboarded, loading, completingOnboarding } = useAuthStore();
  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--surface)]">
      <div className="w-10 h-10 rounded-2xl bg-[var(--rose)] animate-pulse" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (isOnboarded && !completingOnboarding) return <Navigate to="/dashboard" replace />;
  return children;
}

function RootRedirect() {
  const { isAuthenticated, isOnboarded, loading, needsProfileSetup } = useAuthStore();
  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--surface)]">
      <div className="w-10 h-10 rounded-2xl bg-[var(--rose)] animate-pulse" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (isAuthenticated && isOnboarded && needsProfileSetup) return <Navigate to="/partner-setup" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => { initialize(); }, []);

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
          error: { iconTheme: { primary: '#D4537E', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<Auth />} />

        <Route path="/onboarding" element={
          <OnboardingRoute><Onboarding /></OnboardingRoute>
        } />

        <Route path="/partner-setup" element={<PartnerSetup />} />

        <Route element={
          <ProtectedRoute><AppShell /></ProtectedRoute>
        }>
          <Route path="/profile"      element={<Profile />} />
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
