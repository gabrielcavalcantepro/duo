import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterForm({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerWithEmail } = useAuthStore();
  const navigate = useNavigate();

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Digite seu email');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !password || !confirmPassword) return toast.error('Preencha todos os campos');
    if (password !== confirmPassword) return toast.error('As senhas não coincidem');
    if (password.length < 6) return toast.error('A senha deve ter pelo menos 6 caracteres');

    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      toast.success('Conta criada! Bem-vindo(a) ao Duo 🎉');
      setTimeout(() => navigate('/onboarding'), 500);
    } catch (err) {
      toast.error(err.message);
      if (err.message.includes('email usado na compra')) setStep(1);
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
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="flex items-center gap-1.5 text-sm text-[var(--muted)] mb-5 hover:text-[var(--rose)] transition-colors">
          <ArrowLeft size={15} /> Voltar
        </button>

        <h2 className="font-serif text-2xl text-[var(--ink)] mb-1">
          {step === 1 ? 'Ativar seu acesso' : 'Criar sua conta'}
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          {step === 1
            ? 'Digite o email que você usou na compra do Duo'
            : 'Defina seu nome e senha para acessar o app'}
        </p>

        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Email da compra</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@usado.na.compra.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--rose)] transition-colors"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 bg-[var(--rose)] text-white rounded-xl font-medium text-sm shadow-[0_4px_16px_rgba(212,83,126,0.3)]">
              Verificar email
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-[var(--teal-light)] rounded-xl mb-2">
              <CheckCircle size={15} className="text-[var(--teal)]" />
              <span className="text-xs text-[var(--teal-dark)] font-medium">{email}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Seu nome</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Como quer ser chamado(a)?"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--rose)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Criar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--rose)] transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--rose)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--rose)] text-white rounded-xl font-medium text-sm disabled:opacity-60 shadow-[0_4px_16px_rgba(212,83,126,0.3)]"
            >
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
