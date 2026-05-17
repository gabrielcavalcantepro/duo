import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

function DuoLogo({ size = 56 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 80 56" fill="none">
      <circle cx="28" cy="28" r="26" fill="white" fillOpacity="0.9" />
      <circle cx="52" cy="28" r="26" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

export default function Welcome({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex-1 flex flex-col min-h-dvh relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[var(--rose)]" />
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-white"
            style={{
              width: `${60 + i * 30}px`,
              height: `${60 + i * 30}px`,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              transform: 'translate(-50%, -50%)',
              opacity: 0.3 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-12 text-white text-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <DuoLogo size={56} />
          </div>
          <h1 className="font-serif text-5xl text-white">Duo</h1>
          <p className="font-sans text-sm font-light text-white/80 tracking-wide">
            Finanças que fortalecem o casal
          </p>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4 max-w-sm"
        >
          <h2 className="font-serif text-3xl leading-tight text-white">
            Finanças que unem. <br />
            <span className="italic">Não que separam.</span>
          </h2>
          <p className="font-sans text-base font-light text-white/80 leading-relaxed">
            Gerencie o dinheiro do casal de forma transparente, com metas, orçamentos e reuniões mensais guiadas.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            onClick={onNext}
            fullWidth
            size="lg"
            className="bg-white !text-[var(--rose)] hover:bg-white/90 font-semibold"
          >
            Configurar nosso casal →
          </Button>
        </motion.div>
      </div>

      {/* Features pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 flex gap-2 px-6 pb-10 overflow-x-auto no-scrollbar justify-center flex-wrap"
      >
        {['100% offline', 'Dados locais', 'Metas & sonhos', 'Reunião mensal', 'Desafio 21 dias'].map((f) => (
          <span key={f} className="px-3 py-1.5 rounded-pill bg-white/20 text-white text-xs font-sans whitespace-nowrap">
            {f}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
