import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input, { CurrencyInput } from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useSplitStore from '../../store/splitStore';
import useAuthStore from '../../store/authStore';
import { formatBRL, formatDate } from '../../utils/formatters';
import { calculateSplitBalance } from '../../utils/calculations';
import toast from 'react-hot-toast';

export default function Split() {
  const { splits, loadSplits, addSplit, settleSplit, deleteSplit } = useSplitStore();
  const { couple } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSettled, setShowSettled] = useState(false);

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('50/50');
  const [custom1, setCustom1] = useState(0);
  const [custom2, setCustom2] = useState(0);

  useEffect(() => {
    loadSplits();
    if (couple) setPaidBy(couple.partner1Name);
  }, [couple]);

  const open = splits.filter((s) => !s.settled);
  const settled = splits.filter((s) => s.settled);
  const balance = couple ? calculateSplitBalance(splits, couple.partner1Name) : 0;

  const handleAdd = async () => {
    if (!description || !totalAmount) { toast.error('Preencha todos os campos'); return; }
    const customSplit = splitType === 'custom' ? {
      person1: custom1,
      person2: custom2,
    } : splitType === '50/50' ? {
      person1: totalAmount / 2,
      person2: totalAmount / 2,
    } : null;

    await addSplit({ description, totalAmount, paidBy, splitType, customSplit, date: new Date().toISOString() });
    toast.success('Divisão adicionada!');
    setDescription('');
    setTotalAmount(0);
    setCustom1(0);
    setCustom2(0);
    setShowForm(false);
  };

  const handleSettle = async (id) => {
    await settleSplit(id);
    toast.success('Marcado como quitado!');
  };

  const handleDelete = async () => {
    await deleteSplit(deleteId);
    toast.success('Divisão removida');
    setDeleteId(null);
  };

  return (
    <div className="page-content">
      <TopBar
        title="Dividir contas"
        showBack
        actions={
          <button onClick={() => setShowForm(true)} className="p-2 rounded-full bg-[var(--rose-light)] text-[var(--rose)] hover:bg-[var(--rose)] hover:text-white transition-all" aria-label="Nova divisão">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* Balance summary */}
        {couple && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant={balance > 0 ? 'teal' : balance < 0 ? 'rose' : 'muted'}>
              <div className="text-center">
                <p className="font-sans text-sm mb-1 opacity-80">Saldo entre vocês</p>
                {balance === 0 ? (
                  <p className="font-serif text-2xl">Estão quites! 🎉</p>
                ) : balance > 0 ? (
                  <>
                    <p className="font-serif text-2xl">{formatBRL(Math.abs(balance))}</p>
                    <p className="font-sans text-sm mt-1 opacity-80">{couple.partner2Name} deve para {couple.partner1Name}</p>
                  </>
                ) : (
                  <>
                    <p className="font-serif text-2xl">{formatBRL(Math.abs(balance))}</p>
                    <p className="font-sans text-sm mt-1 opacity-80">{couple.partner1Name} deve para {couple.partner2Name}</p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Open splits */}
        {open.length > 0 && (
          <div>
            <p className="font-serif text-lg text-[var(--ink)] mb-3">Em aberto</p>
            <div className="space-y-3">
              {open.map((split, i) => {
                const half = split.totalAmount / 2;
                const owedByP2 = split.paidBy === couple?.partner1Name;
                return (
                  <motion.div
                    key={split.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-sans text-base font-medium text-[var(--ink)]">{split.description}</p>
                          <p className="font-sans text-xs text-[var(--muted)]">{formatDate(split.date)} · Pago por {split.paidBy}</p>
                        </div>
                        <p className="font-serif text-lg text-[var(--ink)]">{formatBRL(split.totalAmount)}</p>
                      </div>
                      <div className="flex gap-2 bg-[var(--rose-light)] rounded-element p-3 mb-3">
                        {couple && [
                          { name: couple.partner1Name, amount: split.customSplit?.person1 ?? half },
                          { name: couple.partner2Name, amount: split.customSplit?.person2 ?? half },
                        ].map((p) => (
                          <div key={p.name} className="flex-1 text-center">
                            <p className="font-sans text-xs text-[var(--muted)]">{p.name}</p>
                            <p className="font-sans text-sm font-semibold text-[var(--rose-dark)]">{formatBRL(p.amount)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSettle(split.id)} variant="success" size="sm" className="flex-1">
                          <CheckCircle size={14} /> Quitar
                        </Button>
                        <button
                          onClick={() => setDeleteId(split.id)}
                          className="p-2 rounded-element hover:bg-[var(--rose-light)] transition-colors"
                          aria-label="Deletar"
                        >
                          <Trash2 size={16} className="text-[var(--muted)]" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {open.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <p className="text-4xl">✨</p>
            <p className="font-serif text-xl text-[var(--ink)]">Nenhuma divisão em aberto</p>
            <p className="font-sans text-sm text-[var(--muted)]">Adicione contas para dividir com seu parceiro</p>
            <Button onClick={() => setShowForm(true)} size="sm">+ Nova divisão</Button>
          </div>
        )}

        {/* Settled */}
        {settled.length > 0 && (
          <div>
            <button
              onClick={() => setShowSettled((v) => !v)}
              className="flex items-center gap-2 font-sans text-sm text-[var(--muted)] hover:text-[var(--ink-soft)]"
            >
              {showSettled ? '▾' : '▸'} Quitadas ({settled.length})
            </button>
            {showSettled && (
              <div className="mt-3 space-y-2">
                {settled.map((split) => (
                  <div key={split.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-card border border-[var(--border)] opacity-70">
                    <div>
                      <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">{split.description}</p>
                      <p className="font-sans text-xs text-[var(--muted)]">{formatDate(split.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm text-[var(--ink-soft)]">{formatBRL(split.totalAmount)}</span>
                      <Badge variant="teal">Quitado</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add split modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Nova divisão"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowForm(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleAdd} fullWidth>Adicionar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Jantar restaurante" />
          <CurrencyInput label="Valor total" value={totalAmount} onChange={setTotalAmount} />
          {couple && (
            <div>
              <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Quem pagou</p>
              <div className="flex gap-2">
                {[
                  { name: couple.partner1Name, color: couple.partner1Color, avatarUrl: couple.partner1AvatarUrl },
                  { name: couple.partner2Name, color: couple.partner2Color, avatarUrl: couple.partner2AvatarUrl },
                ].filter((p) => p.name && p.name.trim() !== '').map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPaidBy(p.name)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-pill text-sm font-sans border-2 transition-all ${paidBy === p.name ? 'border-[var(--rose)] bg-[var(--rose-light)] text-[var(--rose-dark)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
                  >
                    <Avatar name={p.name} color={p.color} src={p.avatarUrl} size="xs" />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Tipo de divisão</p>
            <div className="space-y-2">
              {['50/50', 'custom'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSplitType(t)}
                  className={`w-full flex items-center gap-3 p-3 rounded-element border-2 transition-all text-left ${splitType === t ? 'border-[var(--rose)] bg-[var(--rose-light)]' : 'border-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${splitType === t ? 'border-[var(--rose)] bg-[var(--rose)]' : 'border-gray-300'}`} />
                  <span className="font-sans text-sm text-[var(--ink-soft)]">
                    {t === '50/50' ? 'Divisão igual (50/50)' : 'Personalizado'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {splitType === 'custom' && couple && (
            <div className="flex gap-3">
              <CurrencyInput label={couple.partner1Name} value={custom1} onChange={setCustom1} className="flex-1" />
              <CurrencyInput label={couple.partner2Name} value={custom2} onChange={setCustom2} className="flex-1" />
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Deletar divisão" message="Tem certeza?" danger />
    </div>
  );
}
