import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, ChevronRight, Calendar, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTransactionStore from '../../store/transactionStore';
import useGoalStore from '../../store/goalStore';
import useBudgetStore from '../../store/budgetStore';
import useChallenge from '../../store/challengeStore';
import useMeetingStore from '../../store/meetingStore';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import TransactionForm from '../../components/forms/TransactionForm';
import { formatBRL, formatRelativeDate, getGreeting, MOTIVATIONAL_PHRASES, formatDeadline } from '../../utils/formatters';
import { getCategoryByName } from '../../utils/categories';
import { getByCategory } from '../../utils/calculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function Dashboard() {
  const { couple, activeUser } = useAuthStore();
  const { transactions, loadTransactions } = useTransactionStore();
  const { goals, loadGoals } = useGoalStore();
  const { budgets, loadBudgets } = useBudgetStore();
  const { days: challengeDays, loadChallenge, startDate: challengeStart } = useChallenge();
  const { meetings, loadMeetings } = useMeetingStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [phrase] = useState(() => MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthName = format(now, 'MMMM', { locale: ptBR });

  useEffect(() => {
    loadTransactions();
    loadGoals();
    loadBudgets();
    loadChallenge();
    loadMeetings();
  }, []);

  const { stats, prevStats, last6 } = useMonthlyStats(month, year);
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  const monthTransactions = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year && t.type === 'expense';
    }), [transactions, month, year]);
  const spentByCategory = useMemo(() => {
    const map = {};
    monthTransactions.forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [monthTransactions]);

  const monthBudgets = useMemo(() =>
    budgets.filter((b) => b.month === month && b.year === year).slice(0, 4),
    [budgets, month, year]
  );

  const activeGoals = useMemo(() => goals.filter((g) => g.currentAmount < g.targetAmount).slice(0, 3), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.currentAmount >= g.targetAmount), [goals]);

  const balanceChange = prevStats.income > 0
    ? Math.round(((stats.balance - prevStats.balance) / Math.abs(prevStats.balance || 1)) * 100)
    : 0;

  const thisMeeting = meetings.find((m) => m.month === month && m.year === year);
  const completedChallenges = challengeDays.filter((d) => d.completed).length;

  return (
    <div className="page-content">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--rose)] flex items-center justify-center">
            <svg width="20" height="14" viewBox="0 0 80 56" fill="none">
              <circle cx="28" cy="28" r="26" fill="white" fillOpacity="0.9" />
              <circle cx="52" cy="28" r="26" fill="white" fillOpacity="0.6" />
            </svg>
          </div>
          <span className="font-serif text-lg text-[var(--ink)]">Duo</span>
        </div>
        <span className="font-sans text-sm text-[var(--muted)] capitalize">{couple?.name || ''}</span>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-[var(--muted)] capitalize hidden sm:block">{monthName}</span>
          {couple && (
            <Avatar
              name={activeUser || couple.partner1Name}
              color={activeUser === couple.partner2Name ? couple.partner2Color : couple.partner1Color}
              size="sm"
            />
          )}
        </div>
      </header>

      <div className="px-4 pt-6 space-y-6 max-w-lg mx-auto">
        {/* Greeting */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <p className="font-sans text-sm text-[var(--muted)]">{getGreeting()}, <strong className="text-[var(--ink-soft)]">{activeUser}</strong></p>
          <p className="font-serif text-xl text-[var(--ink)] mt-0.5 italic">{phrase}</p>
        </motion.div>

        {/* Hero balance card */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="rounded-card bg-[var(--rose)] p-6 text-white relative overflow-hidden shadow-rose">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="label-sm text-white/70">Disponível este mês</span>
                <Badge variant="ink" className="text-white/90 bg-white/20">
                  {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
                </Badge>
              </div>
              <div className="flex items-end gap-3 mt-2 mb-4">
                <span className="font-serif text-4xl">{formatBRL(stats.balance)}</span>
                {balanceChange !== 0 && (
                  <div className={`flex items-center gap-1 mb-1 text-sm font-sans ${balanceChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {balanceChange > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(balanceChange)}% vs mês anterior
                  </div>
                )}
              </div>
              {/* Sparkline */}
              <div className="flex items-end gap-1 h-12 mb-4">
                {last6.map((m, i) => {
                  const maxAbs = Math.max(...last6.map((x) => Math.abs(x.balance)), 1);
                  const h = Math.max(4, (Math.abs(m.balance) / maxAbs) * 40);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className="w-full rounded-sm"
                        style={{ height: h, backgroundColor: m.balance >= 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,200,200,0.5)' }}
                      />
                      <span className="text-[9px] text-white/50 truncate w-full text-center">{m.label}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-pill px-4 py-2 text-sm font-sans font-medium"
              >
                <Plus size={16} /> Adicionar transação
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3">
          <div className="rounded-card bg-white p-3 shadow-card border border-[var(--border)] text-center">
            <p className="label-sm text-[var(--teal)]">Receitas</p>
            <p className="font-serif text-lg text-[var(--teal)] mt-1">{formatBRL(stats.income)}</p>
          </div>
          <div className="rounded-card bg-white p-3 shadow-card border border-[var(--border)] text-center">
            <p className="label-sm text-[var(--rose)]">Despesas</p>
            <p className="font-serif text-lg text-[var(--rose)] mt-1">{formatBRL(stats.expense)}</p>
          </div>
          <div className="rounded-card bg-white p-3 shadow-card border border-[var(--border)] text-center">
            <p className="label-sm text-[var(--muted)]">Poupança</p>
            <p className="font-serif text-lg text-[var(--ink)] mt-1">{Math.round(stats.savingRate)}%</p>
          </div>
        </motion.div>

        {/* Goals */}
        {activeGoals.length > 0 && (
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl text-[var(--ink)]">Seus sonhos</h2>
              <Link to="/goals" className="text-sm text-[var(--rose)] font-sans font-medium flex items-center gap-1">
                Ver todas <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {activeGoals.map((goal, i) => {
                const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                return (
                  <motion.div
                    key={goal.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    onClick={() => navigate(`/goals/${goal.id}`)}
                    className="min-w-[180px] bg-white rounded-card p-4 shadow-card border border-[var(--border)] cursor-pointer hover:shadow-rose transition-shadow"
                  >
                    <div className="text-3xl mb-2">{goal.emoji}</div>
                    <p className="font-serif text-base text-[var(--ink)] leading-tight mb-3">{goal.name}</p>
                    <ProgressBar value={goal.currentAmount} total={goal.targetAmount} color="rose" height="h-1.5" />
                    <div className="flex justify-between mt-1.5 text-xs font-sans text-[var(--muted)]">
                      <span>{pct}%</span>
                      <span>{formatDeadline(goal.deadline)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Budget */}
        {monthBudgets.length > 0 && (
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl text-[var(--ink)] capitalize">Orçamento de {monthName}</h2>
              <Link to="/budget" className="text-sm text-[var(--rose)] font-sans font-medium flex items-center gap-1">
                Gerenciar <ChevronRight size={16} />
              </Link>
            </div>
            <Card>
              <div className="space-y-4">
                {monthBudgets.map((budget) => {
                  const spent = spentByCategory[budget.category] || 0;
                  const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                  const color = pct > 100 ? 'rose' : pct > 80 ? 'amber' : 'teal';
                  const cat = getCategoryByName(budget.category);
                  const IconComp = Icons[cat.icon] || Icons.MoreHorizontal;
                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <IconComp size={14} color={cat.color} />
                          <span className="font-sans text-sm text-[var(--ink-soft)]">{budget.category}</span>
                        </div>
                        <span className="font-sans text-xs text-[var(--muted)]">
                          {formatBRL(spent)} / {formatBRL(budget.limit)}
                        </span>
                      </div>
                      <ProgressBar value={spent} total={budget.limit} color={color} height="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent transactions */}
        {recentTransactions.length > 0 && (
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl text-[var(--ink)]">Últimas movimentações</h2>
              <Link to="/transactions" className="text-sm text-[var(--rose)] font-sans font-medium flex items-center gap-1">
                Ver todas <ChevronRight size={16} />
              </Link>
            </div>
            <Card>
              <div className="space-y-3">
                {recentTransactions.map((t) => {
                  const cat = getCategoryByName(t.category);
                  const IconComp = Icons[cat.icon] || Icons.MoreHorizontal;
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                        <IconComp size={18} color={cat.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-[var(--ink)] truncate">{t.description}</p>
                        <p className="font-sans text-xs text-[var(--muted)]">{t.paidBy} · {formatRelativeDate(t.date)}</p>
                      </div>
                      <span className={`font-sans text-sm font-semibold ${t.type === 'income' ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>
                        {t.type === 'expense' ? '-' : '+'}{formatBRL(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Meeting card */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Link to="/meeting">
            <div className={`rounded-card p-5 ${thisMeeting ? 'bg-[var(--teal-light)]' : 'bg-[var(--rose-light)] pulse-rose'} border border-[var(--border)]`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${thisMeeting ? 'bg-[var(--teal)]' : 'bg-[var(--rose)]'}`}>
                  <Calendar size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  {thisMeeting ? (
                    <>
                      <p className="font-sans text-sm font-medium text-[var(--teal-dark)]">Reunião de {monthName} concluída ✓</p>
                      <p className="font-sans text-xs text-[var(--teal)]">Próxima em 1º de {format(new Date(year, month, 1), 'MMMM', { locale: ptBR })}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-sans text-sm font-medium text-[var(--rose-dark)]">Reunião de {monthName} disponível</p>
                      <p className="font-sans text-xs text-[var(--muted)]">10 minutos para dois →</p>
                    </>
                  )}
                </div>
                <ChevronRight size={18} className={thisMeeting ? 'text-[var(--teal)]' : 'text-[var(--rose)]'} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Challenge card */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
          <Link to="/challenge">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[var(--rose)]" />
                  <h3 className="font-serif text-base text-[var(--ink)]">Desafio 21 dias</h3>
                </div>
                <Badge variant="rose">{completedChallenges}/21</Badge>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 21 }, (_, i) => {
                  const dayNum = i + 1;
                  const isCompleted = challengeDays.some((d) => d.day === dayNum && d.completed);
                  const today = challengeStart
                    ? Math.floor((Date.now() - new Date(challengeStart).getTime()) / (1000 * 60 * 60 * 24)) + 1
                    : null;
                  const isToday = today === dayNum;
                  return (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-sans font-medium transition-all ${
                        isCompleted
                          ? 'bg-[var(--rose)] text-white'
                          : isToday
                          ? 'bg-[var(--rose-light)] border-2 border-[var(--rose)] text-[var(--rose)] pulse-rose'
                          : 'bg-gray-100 text-[var(--muted)]'
                      }`}
                    >
                      {isCompleted ? '✓' : dayNum}
                    </div>
                  );
                })}
              </div>
              {challengeStart && completedChallenges < 21 && (
                <p className="font-sans text-xs text-[var(--rose)] mt-3 font-medium">Completar o dia de hoje →</p>
              )}
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
        onClick={() => setShowForm(true)}
        aria-label="Adicionar transação"
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-[var(--rose)] text-white shadow-rose flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={24} />
      </motion.button>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
