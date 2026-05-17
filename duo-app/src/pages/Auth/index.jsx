import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import CoupleCodeForm from './CoupleCodeForm';

export default function Auth() {
  const [view, setView] = useState('login'); // login | register | coupleCode

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--rose)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[rgba(212,83,126,0.3)]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="11" cy="14" r="7" fill="white" fillOpacity="0.9"/>
            <circle cx="17" cy="14" r="7" fill="white" fillOpacity="0.5"/>
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-[var(--ink)]">Duo</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Finanças que fortalecem o casal</p>
      </div>

      <AnimatePresence mode="wait">
        {view === 'login' && (
          <LoginForm
            key="login"
            onRegister={() => setView('register')}
            onCoupleCode={() => setView('coupleCode')}
          />
        )}
        {view === 'register' && (
          <RegisterForm
            key="register"
            onBack={() => setView('login')}
          />
        )}
        {view === 'coupleCode' && (
          <CoupleCodeForm
            key="coupleCode"
            onBack={() => setView('login')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
