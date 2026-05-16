import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { Trash2, Edit2, Plus, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { CurrencyInput } from '../../components/ui/Input';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import GoalForm from '../../components/forms/GoalForm';
import LineChart from '../../components/charts/LineChart';
import useGoalStore from '../../store/goalStore';
import useAuthStore from '../../store/authStore';
import { formatBRL, formatDate, formatDeadline, projectGoalDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goals, contributions, deleteGoal, addContribution, getContributions, loadGoals } = useGoalStore();
  const { couple } = useAuthStore();
  const [showContrib, setShowContrib] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [contribAmount, setContribAmount] = useState(0);
  const [contribPaidBy, setContribPaidBy] = useState('');
  const [contribNote, setContribNote] = useState('');

  useEffect(() => { loadGoals(); }, []);

  const goal = goals.find((g) => g.id === Number(id));
  const goalContribs = getContributions(Number(id));

  if (!goal) {
    return (
      <div className="p-6 text-center">
        <p className="font-sans text-[var(--muted)]">Meta não encontrada</p>
        <Button onClick={() => navigate('/goals')} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isComplete = goal.currentAmount >= goal.targetAmount;

  const avgMonthly = goalContribs.length > 0
    ? goalContribs.reduce((s, c) => s + c.amount, 0) / Math.max(1, goalContribs.length)
    : 0;
  const projection = projectGoalDate(goal.currentAmount, goal.targetAmount, avgMonthly);

  const chartData = goalContribs
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, c) => {
      const prev = acc.length ? acc[acc.length - 1].value : 0;
      return [...acc, { label: formatDate(c.date, 'dd/MM'), value: prev + c.amount }];
    }, [{ label: 'Início', value: goal.currentAmount - goalContribs.reduce((s, c) => s + c.amount, 0) }]);

  const handleContrib = async () => {
    if (!contribAmount || contribAmount <= 0) { toast.error('Informe o valor'); return; }
    await addContribution(goal.id, { amount: contribAmount, paidBy: contribPaidBy || couple?.partner1Name, note: contribNote });
    if ((goal.currentAmount + contribAmount) >= goal.targetAmount) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#D4537E','#1D9E75','#8B5CF6'] });
      toast.success('🎉 Meta atingida! Parabéns!');
    } else {
      toast.success('Aporte adicionado!');
    }
    setContribAmount(0);
    setContribNote('');
    setShowContrib(false);
  };

  const handleDelete = async () => {
    await deleteGoal(goal.id);
    toast.success('Meta removida');
    navigate('/goals');
  };

  return (
    <div className="page-content">
      <TopBar
        title="Detalhe da meta"
        showBack
        actions={
          <div className="flex gap-1">
            <button onClick={() => setShowEdit(true)} className="p-2 rounded-full hover:bg-[var(--rose-light)] transition-colors" aria-label="Editar">
              <Edit2 size={18} className="text-[var(--muted)]" />
            </button>
            <button onClick={() => setShowDelete(true)} className="p-2 rounded-full hover:bg-[var(--rose-light)] transition-colors" aria-label="Deletar">
              <Trash2 size={18} className="text-[var(--muted)]" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant={isComplete ? 'teal' : 'default'} className="text-center">
            <div className="text-5xl mb-3">{goal.emoji}</div>
            <h1 className="font-serif text-2xl mb-1">{goal.name}</h1>
            <Badge variant={goal.priority === 'alta' ? 'rose' : goal.priority === 'média' ? 'amber' : 'muted'} className="mb-4">
              {goal.priority} prioridade
            </Badge>
            <div className="space-y-3">
              <ProgressBar
                value={goal.currentAmount}
                total={goal.targetAmount}
                color={isComplete ? 'teal' : 'rose'}
                height="h-3"
                showLabel
              />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="label-sm">Poupado</p>
                  <p className="font-serif text-lg">{formatBRL(goal.currentAmount)}</p>
                </div>
                <div>
                  <p className="label-sm">Alvo</p>
                  <p className="font-serif text-lg">{formatBRL(goal.targetAmount)}</p>
                </div>
                <div>
                  <p className="label-sm">Faltam</p>
                  <p className="font-serif text-lg">{formatBRL(remaining)}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Info */}
        <Card>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-sm text-[var(--muted)]">Prazo</span>
              <span className="font-sans text-sm font-medium text-[var(--ink-soft)]">{formatDate(goal.deadline)} · {formatDeadline(goal.deadline)}</span>
            </div>
            {projection && !isComplete && (
              <div className="flex justify-between">
                <span className="font-sans text-sm text-[var(--muted)]">Projeção</span>
                <span className="font-sans text-sm font-medium text-[var(--teal)]">
                  {formatDate(projection.toISOString())} (com aportes atuais)
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Add contribution CTA */}
        {!isComplete && (
          <Button onClick={() => setShowContrib(true)} fullWidth size="lg">
            <Plus size={18} /> Adicionar aporte
          </Button>
        )}

        {isComplete && (
          <div className="text-center py-4">
            <p className="font-serif text-2xl text-[var(--teal)] mb-2">🎉 Meta conquistada!</p>
            <p className="font-sans text-sm text-[var(--muted)]">Parabéns! Vocês alcançaram esse sonho juntos.</p>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 1 && (
          <Card>
            <h3 className="font-serif text-base text-[var(--ink)] mb-3">Evolução do saldo</h3>
            <LineChart data={chartData} dataKey="value" color="var(--rose)" height={160} />
          </Card>
        )}

        {/* Contribution history */}
        {goalContribs.length > 0 && (
          <Card>
            <h3 className="font-serif text-base text-[var(--ink)] mb-3">Histórico de aportes</h3>
            <div className="space-y-3">
              {goalContribs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
                    <TrendingUp size={14} className="text-[var(--rose)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-sm text-[var(--ink-soft)]">{c.paidBy}</p>
                    {c.note && <p className="font-sans text-xs text-[var(--muted)]">{c.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-semibold text-[var(--teal)]">+{formatBRL(c.amount)}</p>
                    <p className="font-sans text-xs text-[var(--muted)]">{formatDate(c.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Contribution modal */}
      <Modal
        open={showContrib}
        onClose={() => setShowContrib(false)}
        title="Adicionar aporte"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowContrib(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleContrib} fullWidth>Adicionar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <CurrencyInput label="Valor do aporte" value={contribAmount} onChange={setContribAmount} />
          {couple && (
            <div>
              <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Quem está contribuindo</p>
              <div className="flex gap-2">
                {[couple.partner1Name, couple.partner2Name].map((name) => (
                  <button
                    key={name}
                    onClick={() => setContribPaidBy(name)}
                    className={`flex-1 py-2 rounded-pill text-sm font-sans border-2 transition-all ${contribPaidBy === name ? 'border-[var(--rose)] bg-[var(--rose-light)] text-[var(--rose-dark)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Input label="Nota (opcional)" value={contribNote} onChange={(e) => setContribNote(e.target.value)} placeholder="Ex: Bônus do trabalho" />
        </div>
      </Modal>

      <GoalForm open={showEdit} onClose={() => setShowEdit(false)} defaultValues={goal} />
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Deletar meta" message="Tem certeza que deseja deletar esta meta?" danger />
    </div>
  );
}
