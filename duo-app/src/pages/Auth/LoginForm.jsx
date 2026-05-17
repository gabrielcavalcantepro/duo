import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginForm({ onRegister, onCoupleCode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // login() already calls loadUserData, so state is up to date here
      const { isOnboarded } = useAuthStore.getState();
      navigate(isOnboarded ? '/dashboard' : '/onboarding');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-sm"
    >
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(212,83,126,0.1)] border border-[var(--border)]">
        <h2 className="font-serif text-2xl text-[var(--ink)] mb-1">Bem-vindo de volta</h2>
        <p className="text-sm text-[var(--muted)] mb-6">Entre na sua conta para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--rose)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--rose)] transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--rose)] text-white rounded-xl font-medium text-sm transition-all hover:bg-[var(--rose-dark)] disabled:opacity-60 shadow-[0_4px_16px_rgba(212,83,126,0.3)]"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">ou</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="space-y-3">
          <button
            onClick={onCoupleCode}
            className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--rose-mid)] text-[var(--rose-dark)] text-sm font-medium hover:bg-[var(--rose-light)] transition-colors"
          >
            Entrar com código do casal
          </button>

          <button
            onClick={onRegister}
            className="w-full py-3 text-sm text-[var(--muted)] hover:text-[var(--rose)] transition-colors"
          >
            Primeira vez aqui? <span className="text-[var(--rose)] font-medium">Ative seu acesso</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
