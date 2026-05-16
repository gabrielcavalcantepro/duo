import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowLeftRight, Target, BarChart2, Menu, X, Wallet, Users, Zap, Settings } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { to: '/dashboard',     icon: Home,           label: 'Início' },
  { to: '/transactions',  icon: ArrowLeftRight, label: 'Gastos' },
  { to: '/goals',         icon: Target,         label: 'Metas' },
  { to: '/reports',       icon: BarChart2,      label: 'Relatórios' },
];

const drawerItems = [
  { to: '/budget',    icon: Wallet,  label: 'Orçamento' },
  { to: '/meeting',   icon: Users,   label: 'Reunião' },
  { to: '/challenge', icon: Zap,     label: 'Desafio 21 dias' },
  { to: '/split',     icon: ArrowLeftRight, label: 'Dividir conta' },
  { to: '/settings',  icon: Settings, label: 'Configurações' },
];

export default function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed bottom-[72px] left-4 right-4 z-50 bg-white rounded-card shadow-2xl p-4 border border-[var(--border)]"
          >
            <div className="grid grid-cols-2 gap-2">
              {drawerItems.map(({ to, icon: Icon, label }) => (
                <button
                  key={to}
                  onClick={() => { navigate(to); setDrawerOpen(false); }}
                  className="flex items-center gap-3 p-3 rounded-element hover:bg-[var(--rose-light)] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
                    <Icon size={18} className="text-[var(--rose)]" />
                  </div>
                  <span className="font-sans text-sm font-medium text-[var(--ink-soft)]">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav
        role="navigation"
        aria-label="Navegação principal"
        className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-element transition-all duration-200 min-w-[52px] ${
                  isActive ? 'text-[var(--rose)]' : 'text-[var(--muted)] hover:text-[var(--ink-soft)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--rose)]"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Mais opções"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-element transition-all duration-200 min-w-[52px] ${
              drawerOpen ? 'text-[var(--rose)]' : 'text-[var(--muted)] hover:text-[var(--ink-soft)]'
            }`}
          >
            <motion.div animate={{ rotate: drawerOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {drawerOpen ? <X size={22} /> : <Menu size={22} strokeWidth={1.8} />}
            </motion.div>
            <span className="text-[10px] font-medium leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
