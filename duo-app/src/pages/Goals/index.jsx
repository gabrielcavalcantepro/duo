import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Target, Trophy } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import GoalForm from '../../components/forms/GoalForm';
import useGoalStore from '../../store/goalStore';
import { formatBRL, formatDeadline, formatPercent } from '../../utils/formatters';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) };

export default function Goals() {
  const { goals, loadGoals } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadGoals(); }, []);

  const active = goals.filter((g) => g.currentAmount < g.targetAmount);
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount);

  return (
    <div className="page-content">
      <TopBar
        title="Metas"
        actions={
          <button onClick={() => setShowForm(true)} className="p-2 rounded-full bg-[var(--rose-light)] text-[var(--rose)] hover:bg-[var(--rose)] hover:text-white transition-all" aria-label="Nova meta">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 py-6 max-w-lg mx-auto">
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Qual é o sonho de vocês?"
            subtitle="Crie metas financeiras e acompanhe o progresso juntos"
            action={() => setShowForm(true)}
            actionLabel="Criar primeira meta"
          />
        ) : (
          <div className="space-y-6">
            {/* Active goals */}
            {active.length > 0 && (
              <div>
                <p className="font-serif text-xl text-[var(--ink)] mb-3">Em progresso</p>
                <div className="grid grid-cols-2 gap-3">
                  {active.map((goal, i) => {
                    const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                    return (
                      <motion.div
                        key={goal.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        onClick={() => navigate(`/goals/${goal.id}`)}
                        className="bg-white rounded-card p-4 shadow-card border border-[var(--border)] cursor-pointer hover:border-[var(--rose-mid)] hover:scale-[1.01] transition-all duration-200"
                      >
                        <div className="text-3xl mb-3 text-center">{goal.emoji}</div>
                        <p className="font-serif text-base text-[var(--ink)] leading-tight text-center mb-3">{goal.name}</p>
                        <ProgressBar value={goal.currentAmount} total={goal.targetAmount} height="h-2" />
                        <div className="flex justify-between mt-2 text-xs font-sans">
                          <span className="text-[var(--rose)] font-medium">{pct}%</span>
                          <span className="text-[var(--muted)]">{formatDeadline(goal.deadline)}</span>
                        </div>
                        <p className="text-[11px] font-sans text-[var(--muted)] mt-1 text-center">
                          {formatBRL(goal.currentAmount)} / {formatBRL(goal.targetAmount)}
                        </p>
                        <div className="flex justify-center mt-2">
                          <Badge variant={goal.priority === 'alta' ? 'rose' : goal.priority === 'média' ? 'amber' : 'muted'}>
                            {goal.priority}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                  <motion.div
                    custom={active.length}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setShowForm(true)}
                    className="bg-[var(--rose-light)] rounded-card p-4 border-2 border-dashed border-[var(--rose-mid)] cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[180px]"
                  >
                    <Plus size={24} className="text-[var(--rose)]" />
                    <span className="font-sans text-sm text-[var(--rose)] font-medium">Nova meta</span>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Completed goals */}
            {completed.length > 0 && (
              <div>
                <p className="font-serif text-xl text-[var(--ink)] mb-3 flex items-center gap-2">
                  <Trophy size={18} className="text-[var(--teal)]" /> Conquistados!
                </p>
                <div className="space-y-2">
                  {completed.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => navigate(`/goals/${goal.id}`)}
                      className="flex items-center gap-3 bg-[var(--teal-light)] rounded-card p-4 cursor-pointer border border-[var(--border)]"
                    >
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <p className="font-sans font-medium text-[var(--teal-dark)]">{goal.name}</p>
                        <p className="font-sans text-xs text-[var(--teal)]">{formatBRL(goal.targetAmount)} · Meta atingida!</p>
                      </div>
                      <span className="text-xl">🎉</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <GoalForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
