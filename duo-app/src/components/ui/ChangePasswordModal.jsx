import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({ open, onClose }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (next.length < 6) { toast.error('A nova senha precisa ter ao menos 6 caracteres.'); return; }
    if (next !== confirm) { toast.error('As senhas não coincidem.'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      handleClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 bottom-8 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-[var(--rose)]" />
                <h3 className="font-serif text-base text-[var(--ink)]">Alterar senha</h3>
              </div>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={16} className="text-[var(--muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="relative">
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium mb-1 block">Senha atual</label>
                <div className="flex items-center border border-[var(--border)] rounded-xl px-3 focus-within:border-[var(--rose)] transition-colors">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className="flex-1 py-2.5 text-sm text-[var(--ink)] outline-none bg-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent((v) => !v)} className="text-[var(--muted)] ml-2">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium mb-1 block">Nova senha</label>
                <div className="flex items-center border border-[var(--border)] rounded-xl px-3 focus-within:border-[var(--rose)] transition-colors">
                  <input
                    type={showNext ? 'text' : 'password'}
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    className="flex-1 py-2.5 text-sm text-[var(--ink)] outline-none bg-transparent"
                    placeholder="mínimo 6 caracteres"
                    required
                  />
                  <button type="button" onClick={() => setShowNext((v) => !v)} className="text-[var(--muted)] ml-2">
                    {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium mb-1 block">Confirmar nova senha</label>
                <div className="flex items-center border border-[var(--border)] rounded-xl px-3 focus-within:border-[var(--rose)] transition-colors">
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="flex-1 py-2.5 text-sm text-[var(--ink)] outline-none bg-transparent"
                    placeholder="repita a nova senha"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[var(--rose)] text-white rounded-full font-sans font-medium text-sm disabled:opacity-60"
              >
                {loading ? 'Salvando...' : 'Alterar senha'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
