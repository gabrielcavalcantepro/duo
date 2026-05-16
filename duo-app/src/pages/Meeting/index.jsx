import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, ChevronRight } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import useMeetingStore from '../../store/meetingStore';
import useTransactionStore from '../../store/transactionStore';
import useGoalStore from '../../store/goalStore';
import useBudgetStore from '../../store/budgetStore';
import useAuthStore from '../../store/authStore';
import { formatBRL, formatDate } from '../../utils/formatters';
import { getMonthlyStats, getByCategory, getBudgetInsight, calcMeetingScore } from '../../utils/calculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const MOODS = ['😰','😟','😐','🙂','😄'];
const POSITIVE_CHIPS = ['Não saímos do orçamento','Conseguimos poupar','Não brigamos por dinheiro','Fizemos um aporte na meta','Pagamos uma dívida'];
const IMPROVE_CHIPS = ['Reduzir gastos com delivery','Criar orçamento para lazer','Automatizar poupança','Acompanhar gastos semanalmente','Conversar mais sobre dinheiro'];
const EXPENSE_CHIPS = ['Viagem','Conserto','Presente','Matrícula','Imposto','Médico'];

export default function Meeting() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthName = format(now, 'MMMM', { locale: ptBR });

  const { meetings, loadMeetings, saveMeeting, getMeetingByMonth } = useMeetingStore();
  const { transactions } = useTransactionStore();
  const { goals } = useGoalStore();
  const { budgets } = useBudgetStore();
  const { couple } = useAuthStore();

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    mood1: '', mood2: '', moodNote: '',
    reviewNote: '',
    positiveChips: [], positiveNote: '',
    improveChips: [], improveNote: '',
    goalNote: '',
    bigExpenses: [], bigExpenseAmount: 0, savingsGoal: 0,
    commitment: '',
  });
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { loadMeetings(); }, []);

  const thisMeeting = getMeetingByMonth(month, year);
  const stats = useMemo(() => getMonthlyStats(transactions, month, year), [transactions, month, year]);
  const spentByCategory = useMemo(() => {
    const map = {};
    transactions.filter((t) => { const d = new Date(t.date); return d.getMonth() + 1 === month && d.getFullYear() === year && t.type === 'expense'; })
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [transactions, month, year]);
  const overBudget = useMemo(() => budgets.filter((b) => b.month === month && b.year === year && (spentByCategory[b.category] || 0) > b.limit), [budgets, spentByCategory, month, year]);
  const activeGoals = useMemo(() => goals.filter((g) => g.currentAmount < g.targetAmount), [goals]);

  const STEPS = [
    { title: 'Check-in emocional', subtitle: 'Como cada um está se sentindo?' },
    { title: 'Revisão do mês', subtitle: 'Vamos ver como foi este mês' },
    { title: 'O que foi positivo', subtitle: 'Celebrem as conquistas' },
    { title: 'O que melhorar', subtitle: 'Sem autocrítica, apenas intenção' },
    { title: 'Metas e sonhos', subtitle: 'Como estão os objetivos de vocês?' },
    { title: 'Próximo mês', subtitle: 'Planejando juntos' },
    { title: 'Combinados', subtitle: 'O compromisso do casal' },
  ];

  const handleFinish = async () => {
    const s = calcMeetingScore(transactions, goals, budgets, month, year);
    setScore(s);
    await saveMeeting(month, year, answers, s);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D4537E','#1D9E75','#8B5CF6'] });
    setDone(true);
    toast.success('Reunião concluída!');
  };

  const toggleChip = (field, chip) => {
    setAnswers((a) => {
      const arr = a[field].includes(chip) ? a[field].filter((c) => c !== chip) : [...a[field], chip];
      return { ...a, [field]: arr };
    });
  };

  const suggestCommitment = () => {
    const parts = [];
    if (answers.improveChips.includes('Reduzir gastos com delivery')) parts.push('reduzir gastos com delivery');
    if (answers.savingsGoal > 0) parts.push(`poupar ${formatBRL(answers.savingsGoal)} este mês`);
    if (activeGoals.length > 0) parts.push(`fazer aportes na meta ${activeGoals[0].name}`);
    if (parts.length === 0) return 'Este mês vamos manter o foco nos nossos objetivos financeiros e conversar mais sobre dinheiro.';
    return `Este mês vamos ${parts.join(', ')}.`;
  };

  if (!active && !done) {
    return (
      <div className="page-content">
        <TopBar title="Reunião mensal" />
        <div className="px-4 py-8 max-w-lg mx-auto space-y-5">
          {thisMeeting ? (
            <Card variant="teal">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={24} className="text-[var(--teal)]" />
                <div>
                  <p className="font-serif text-lg text-[var(--teal-dark)]">Reunião de {monthName} concluída ✓</p>
                  <p className="font-sans text-xs text-[var(--teal)]">Score: {thisMeeting.score}/100 · {formatDate(thisMeeting.completedAt)}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => { setActive(true); setStep(0); setDone(false); }} className="!text-[var(--teal-dark)]">
                Refazer a reunião
              </Button>
            </Card>
          ) : (
            <Card variant="rose">
              <p className="font-serif text-2xl text-white mb-2">Reunião de {monthName}</p>
              <p className="font-sans text-sm text-white/80 mb-4">~10 minutos para vocês dois. Sem pressa.</p>
              <Button onClick={() => setActive(true)} className="bg-white !text-[var(--rose)] hover:bg-white/90">
                Começar a reunião →
              </Button>
            </Card>
          )}

          {meetings.filter((m) => !(m.month === month && m.year === year)).length > 0 && (
            <div>
              <p className="font-serif text-lg text-[var(--ink)] mb-3">Histórico</p>
              <div className="space-y-2">
                {meetings.filter((m) => !(m.month === month && m.year === year)).slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded-card border border-[var(--border)] shadow-card">
                    <span className="font-sans text-sm text-[var(--ink-soft)] capitalize">
                      {format(new Date(m.year, m.month - 1, 1), 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <Badge variant="teal">Score {m.score}/100</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-content">
        <TopBar title="Reunião concluída!" />
        <div className="px-4 py-8 max-w-lg mx-auto text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="font-serif text-3xl text-[var(--ink)]">Reunião concluída!</h2>
            <p className="font-sans text-[var(--muted)] mt-2">Vocês completaram a reunião financeira de {monthName}</p>
          </motion.div>
          <Card variant="rose">
            <p className="font-sans text-sm text-white/80 mb-1">Score desta reunião</p>
            <p className="font-serif text-5xl text-white">{score}</p>
            <p className="font-sans text-xs text-white/60 mt-1">de 100 pontos</p>
          </Card>
          {answers.commitment && (
            <Card>
              <p className="label-sm mb-2">Nosso combinado</p>
              <p className="font-sans text-sm text-[var(--ink-soft)] italic">"{answers.commitment}"</p>
            </Card>
          )}
          <Button onClick={() => { setActive(false); setDone(false); }} fullWidth>Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-sans text-xs text-[var(--muted)]">Etapa {step + 1} de {STEPS.length}</p>
          <button onClick={() => setActive(false)} className="font-sans text-xs text-[var(--muted)] hover:text-[var(--rose)]">Sair</button>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[var(--rose)]' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <h2 className="font-serif text-2xl text-[var(--ink)]">{STEPS[step].title}</h2>
          <p className="font-sans text-sm text-[var(--muted)] mt-1">{STEPS[step].subtitle}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            {/* Step 0: Check-in */}
            {step === 0 && (
              <>
                {couple && [{ name: couple.partner1Name, field: 'mood1' }, { name: couple.partner2Name, field: 'mood2' }].map(({ name, field }) => (
                  <div key={field}>
                    <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">{name}</p>
                    <div className="flex gap-3">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setAnswers((a) => ({ ...a, [field]: m }))}
                          className={`text-2xl p-2 rounded-element transition-all ${answers[field] === m ? 'bg-[var(--rose-light)] scale-125 ring-2 ring-[var(--rose)]' : 'hover:bg-gray-50'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <textarea
                  value={answers.moodNote}
                  onChange={(e) => setAnswers((a) => ({ ...a, moodNote: e.target.value }))}
                  placeholder="O que está pesando mais? (opcional)"
                  className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[80px]"
                />
              </>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--teal-light)] rounded-card p-3 text-center">
                    <p className="label-sm text-[var(--teal)]">Receitas</p>
                    <p className="font-serif text-xl text-[var(--teal-dark)]">{formatBRL(stats.income)}</p>
                  </div>
                  <div className="bg-[var(--rose-light)] rounded-card p-3 text-center">
                    <p className="label-sm text-[var(--rose)]">Despesas</p>
                    <p className="font-serif text-xl text-[var(--rose-dark)]">{formatBRL(stats.expense)}</p>
                  </div>
                </div>
                {overBudget.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-element border border-red-100">
                    <p className="font-sans text-xs font-medium text-red-700 mb-1">Orçamentos estourados:</p>
                    {overBudget.map((b) => (
                      <p key={b.id} className="font-sans text-xs text-red-600">· {b.category}: {formatBRL(spentByCategory[b.category] || 0)} / {formatBRL(b.limit)}</p>
                    ))}
                  </div>
                )}
                <textarea
                  value={answers.reviewNote}
                  onChange={(e) => setAnswers((a) => ({ ...a, reviewNote: e.target.value }))}
                  placeholder="Alguma surpresa nos gastos deste mês? O que aconteceu?"
                  className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[100px]"
                />
              </>
            )}

            {/* Step 2: Positive */}
            {step === 2 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {POSITIVE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => toggleChip('positiveChips', chip)}
                      className={`px-3 py-2 rounded-pill text-sm font-sans transition-all ${answers.positiveChips.includes(chip) ? 'bg-[var(--teal)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'}`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  value={answers.positiveNote}
                  onChange={(e) => setAnswers((a) => ({ ...a, positiveNote: e.target.value }))}
                  placeholder="Conte mais sobre o que funcionou..."
                  className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[80px]"
                />
              </>
            )}

            {/* Step 3: Improve */}
            {step === 3 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {IMPROVE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => toggleChip('improveChips', chip)}
                      className={`px-3 py-2 rounded-pill text-sm font-sans transition-all ${answers.improveChips.includes(chip) ? 'bg-[var(--rose)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'}`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  value={answers.improveNote}
                  onChange={(e) => setAnswers((a) => ({ ...a, improveNote: e.target.value }))}
                  placeholder="O que mais vocês querem melhorar?"
                  className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[80px]"
                />
              </>
            )}

            {/* Step 4: Goals */}
            {step === 4 && (
              <>
                <div className="space-y-2">
                  {activeGoals.map((g) => {
                    const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
                    return (
                      <div key={g.id} className="flex items-center gap-3 p-3 bg-white rounded-card border border-[var(--border)] shadow-card">
                        <span className="text-xl">{g.emoji}</span>
                        <div className="flex-1">
                          <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">{g.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-1.5 bg-[var(--rose)] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-[var(--muted)]">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <textarea
                  value={answers.goalNote}
                  onChange={(e) => setAnswers((a) => ({ ...a, goalNote: e.target.value }))}
                  placeholder="Alguma meta que querem acelerar? Querem adicionar uma nova?"
                  className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[80px]"
                />
              </>
            )}

            {/* Step 5: Next month planning */}
            {step === 5 && (
              <>
                <div>
                  <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Gastos grandes planejados</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {EXPENSE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => toggleChip('bigExpenses', chip)}
                        className={`px-3 py-2 rounded-pill text-sm font-sans transition-all ${answers.bigExpenses.includes(chip) ? 'bg-[var(--rose)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-1">Meta de poupança para o próximo mês</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] font-medium">R$</span>
                    <input
                      type="number"
                      value={answers.savingsGoal || ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, savingsGoal: Number(e.target.value) }))}
                      placeholder="0,00"
                      className="w-full pl-9 rounded-element border border-[var(--border)] px-4 py-3 font-sans text-base focus:outline-none focus:border-[var(--rose)]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Commitment */}
            {step === 6 && (
              <>
                <div className="p-3 bg-[var(--rose-light)] rounded-element border border-[var(--border)] mb-2">
                  <p className="font-sans text-xs text-[var(--muted)] mb-1">Sugestão baseada nas respostas de vocês:</p>
                  <p className="font-sans text-sm text-[var(--ink-soft)] italic">"{suggestCommitment()}"</p>
                </div>
                <textarea
                  value={answers.commitment || suggestCommitment()}
                  onChange={(e) => setAnswers((a) => ({ ...a, commitment: e.target.value }))}
                  placeholder="Escreva aqui o combinado do casal para o próximo mês..."
                  className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[120px]"
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="flex-1">Anterior</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} fullWidth={step === 0} className="flex-1">Próximo →</Button>
          ) : (
            <Button onClick={handleFinish} fullWidth className="flex-1">Salvar reunião ✓</Button>
          )}
        </div>
      </div>
    </div>
  );
}
