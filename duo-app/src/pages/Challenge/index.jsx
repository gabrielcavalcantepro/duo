import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import useChallenge from '../../store/challengeStore';
import { CHALLENGE_TASKS } from '../../utils/categories';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Challenge() {
  const { days, startDate, loadChallenge, startChallenge, completeDay, resetChallenge, getCompletedCount, isDayCompleted } = useChallenge();
  const [showModal, setShowModal] = useState(false);
  const [todayNote, setTodayNote] = useState('');
  const [showReset, setShowReset] = useState(false);

  useEffect(() => { loadChallenge(); }, []);

  const completed = getCompletedCount();
  const todayNum = startDate
    ? Math.min(21, Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : null;
  const todayTask = todayNum ? CHALLENGE_TASKS.find((t) => t.day === todayNum) : null;
  const isTodayDone = todayNum ? isDayCompleted(todayNum) : false;
  const allDone = completed === 21;

  const handleStart = async () => {
    await startChallenge();
    toast.success('Desafio iniciado! Boa sorte! 🚀');
  };

  const handleComplete = async () => {
    await completeDay(todayNum, todayNote);
    if (completed + 1 === 21) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#D4537E','#1D9E75','#8B5CF6','#F59E0B'] });
      toast.success('🏆 Desafio completo! Incrível!');
    } else {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      toast.success(`Dia ${todayNum} concluído! ✓`);
    }
    setShowModal(false);
    setTodayNote('');
  };

  const handleReset = async () => {
    await resetChallenge();
    setShowReset(false);
    toast.success('Desafio reiniciado!');
  };

  return (
    <div className="page-content">
      <TopBar
        title="Desafio 21 dias"
        actions={
          startDate && (
            <button onClick={() => setShowReset(true)} className="p-2 rounded-full hover:bg-[var(--rose-light)] transition-colors" aria-label="Reiniciar">
              <RefreshCw size={18} className="text-[var(--muted)]" />
            </button>
          )
        }
      />

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
        {!startDate ? (
          /* Not started */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 py-8">
            <div className="text-6xl">⚡</div>
            <div>
              <h2 className="font-serif text-3xl text-[var(--ink)] mb-2">Desafio 21 dias</h2>
              <p className="font-sans text-base text-[var(--muted)] max-w-xs mx-auto">
                21 tarefas financeiras simples para fortalecer os hábitos e a comunicação do casal.
              </p>
            </div>
            <Card>
              <div className="space-y-2">
                {CHALLENGE_TASKS.slice(0, 3).map((t) => (
                  <div key={t.day} className="flex items-start gap-3 text-left">
                    <div className="w-7 h-7 rounded-full bg-[var(--rose-light)] flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[var(--rose)]">{t.day}</div>
                    <div>
                      <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">{t.title}</p>
                      <p className="font-sans text-xs text-[var(--muted)] line-clamp-1">{t.description}</p>
                    </div>
                  </div>
                ))}
                <p className="font-sans text-xs text-center text-[var(--muted)] pt-1">... e mais 18 dias de desafios</p>
              </div>
            </Card>
            <Button onClick={handleStart} size="lg" fullWidth>Iniciar o desafio! 🚀</Button>
          </motion.div>
        ) : allDone ? (
          /* Completed */
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 py-8">
            <div className="text-6xl">🏆</div>
            <h2 className="font-serif text-3xl text-[var(--ink)]">Desafio concluído!</h2>
            <p className="font-sans text-[var(--muted)]">Vocês completaram os 21 dias. Que conquista incrível!</p>
            <Card variant="rose">
              <p className="font-serif text-5xl text-white">21/21</p>
              <p className="font-sans text-sm text-white/80 mt-1">dias completados</p>
            </Card>
            <Button onClick={handleReset} variant="secondary" fullWidth>Reiniciar o desafio</Button>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-sans text-sm text-[var(--muted)]">Iniciado em {formatDate(startDate)}</p>
                <Badge variant="rose">{completed}/21 dias</Badge>
              </div>
              <ProgressBar value={completed} total={21} color="rose" height="h-2" />
            </div>

            {/* Today's task */}
            {todayTask && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card variant={isTodayDone ? 'teal' : 'rose'} className="relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isTodayDone ? 'teal' : 'rose'} className="bg-white/20 text-white">
                        Dia {todayTask.day}
                      </Badge>
                      {isTodayDone && <span className="text-white text-sm">✓ Concluído</span>}
                    </div>
                    <h3 className="font-serif text-2xl text-white mb-2">{todayTask.title}</h3>
                    <p className="font-sans text-sm text-white/80 mb-4">{todayTask.description}</p>
                    {!isTodayDone && (
                      <Button
                        onClick={() => setShowModal(true)}
                        className="bg-white !text-[var(--rose)] hover:bg-white/90"
                      >
                        Completar o dia de hoje ✓
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 21-day grid */}
            <Card>
              <h3 className="font-sans text-sm font-medium text-[var(--muted)] mb-3">Progresso geral</h3>
              <div className="grid grid-cols-7 gap-2">
                {CHALLENGE_TASKS.map((task) => {
                  const done = isDayCompleted(task.day);
                  const isToday = task.day === todayNum;
                  return (
                    <div
                      key={task.day}
                      title={task.title}
                      className={`aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        done
                          ? 'bg-[var(--rose)] text-white'
                          : isToday
                          ? 'border-2 border-[var(--rose)] text-[var(--rose)] pulse-rose'
                          : 'bg-gray-100 text-[var(--muted)]'
                      }`}
                    >
                      {done ? '✓' : task.day}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Upcoming tasks */}
            <div>
              <p className="font-serif text-lg text-[var(--ink)] mb-3">Próximos desafios</p>
              <div className="space-y-2">
                {CHALLENGE_TASKS.filter((t) => t.day > (todayNum || 0) && !isDayCompleted(t.day)).slice(0, 4).map((task) => (
                  <div key={task.day} className="flex items-start gap-3 p-3 bg-white rounded-card border border-[var(--border)] shadow-card">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[var(--muted)]">{task.day}</div>
                    <div>
                      <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">{task.title}</p>
                      <p className="font-sans text-xs text-[var(--muted)] line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Complete day modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={todayTask ? `Dia ${todayTask.day}: ${todayTask.title}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleComplete} fullWidth>Marcar como concluído ✓</Button>
          </>
        }
      >
        <div className="space-y-4">
          {todayTask && (
            <p className="font-sans text-sm text-[var(--ink-soft)] bg-[var(--rose-light)] p-3 rounded-element">{todayTask.description}</p>
          )}
          <textarea
            value={todayNote}
            onChange={(e) => setTodayNote(e.target.value)}
            placeholder="Como foi? (opcional)"
            className="w-full rounded-element border border-[var(--border)] px-4 py-3 font-sans text-sm focus:outline-none focus:border-[var(--rose)] resize-none min-h-[80px]"
          />
        </div>
      </Modal>

      {/* Reset confirm */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-t-card w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-[var(--ink)]">Reiniciar desafio?</h3>
            <p className="font-sans text-sm text-[var(--muted)]">Todos os dias completados serão apagados e o desafio começará do zero.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowReset(false)} fullWidth>Cancelar</Button>
              <Button variant="danger" onClick={handleReset} fullWidth>Reiniciar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
