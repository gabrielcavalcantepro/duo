import { motion, AnimatePresence } from 'framer-motion';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InviteCodeModal({ code, onClose }) {
  console.log('[InviteCodeModal] renderizando com code:', code);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl border border-[var(--border)]"
        >
          {/* Ícone */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--rose-light)] flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="13" cy="16" r="8" fill="#D4537E" fillOpacity="0.9"/>
              <circle cx="19" cy="16" r="8" fill="#D4537E" fillOpacity="0.5"/>
            </svg>
          </div>

          <h2 className="font-serif text-2xl text-[var(--ink)] text-center mb-2">
            Convide seu parceiro(a)!
          </h2>
          <p className="text-sm text-[var(--muted)] text-center mb-6 leading-relaxed">
            Compartilhe o código abaixo com seu parceiro(a) para ele(a) criar a conta e entrar no Duo junto com você.
          </p>

          {/* Código */}
          <div className="bg-[var(--rose-light)] rounded-2xl p-4 mb-4 text-center border-2 border-dashed border-[var(--rose-mid)]">
            <p className="text-xs text-[var(--rose-dark)] font-medium uppercase tracking-widest mb-1">Código do casal</p>
            <p className="font-mono text-3xl font-bold text-[var(--rose)] tracking-widest mb-3">{code}</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 mx-auto bg-[var(--rose)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--rose-dark)] transition-colors"
            >
              <Copy size={14} />
              Copiar código
            </button>
          </div>

          {/* Instrução */}
          <div className="bg-[var(--surface)] rounded-xl p-3 mb-5 border border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] leading-relaxed text-center">
              💡 O código também fica disponível em{' '}
              <span className="text-[var(--ink-soft)] font-medium">Configurações</span>
              {' '}— acesse pelo ícone de menu{' '}
              <span className="text-[var(--ink-soft)] font-medium">"Mais"</span>
              {' '}no canto inferior direito do app.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[var(--rose)] text-white rounded-xl font-medium text-sm shadow-[0_4px_16px_rgba(212,83,126,0.3)] hover:bg-[var(--rose-dark)] transition-colors"
          >
            Entendido, vamos começar!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
