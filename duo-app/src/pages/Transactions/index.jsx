import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Filter, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import TransactionForm from '../../components/forms/TransactionForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import useTransactionStore from '../../store/transactionStore';
import useAuthStore from '../../store/authStore';
import { formatBRL, formatRelativeDate, formatDate } from '../../utils/formatters';
import { getPartnerAvatar } from '../../utils/avatarHelper';
import { getCategoryByName, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/categories';
import { getMonthlyStats } from '../../utils/calculations';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const PERIODS = [
  { label: 'Este mês', value: 'this' },
  { label: 'Mês passado', value: 'last' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
];

export default function Transactions() {
  const { transactions, loadTransactions, deleteTransaction } = useTransactionStore();
  const { couple } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('this');
  const [typeFilter, setTypeFilter] = useState('all');
  const [whoFilter, setWhoFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadTransactions(); }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    let start, end;
    if (period === 'this') { start = startOfMonth(now); end = endOfMonth(now); }
    else if (period === 'last') { const lm = subMonths(now, 1); start = startOfMonth(lm); end = endOfMonth(lm); }
    else if (period === '3m') { start = startOfMonth(subMonths(now, 2)); end = endOfMonth(now); }
    else { start = startOfMonth(subMonths(now, 5)); end = endOfMonth(now); }

    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (d < start || d > end) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (whoFilter !== 'all' && t.paidBy !== whoFilter) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, period, typeFilter, whoFilter, search]);

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const key = formatDate(t.date, 'yyyy-MM-dd');
      if (!map[key]) map[key] = { label: formatRelativeDate(t.date), items: [] };
      map[key].items.push(t);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const handleDelete = async () => {
    await deleteTransaction(deleteId);
    toast.success('Transação removida');
    setDeleteId(null);
  };

  return (
    <div className="page-content">
      <TopBar
        title="Gastos"
        actions={
          <button onClick={() => setShowFilters((v) => !v)} className="p-2 rounded-full hover:bg-[var(--rose-light)] transition-colors" aria-label="Filtros">
            <Filter size={20} className={showFilters ? 'text-[var(--rose)]' : 'text-[var(--muted)]'} />
          </button>
        }
      />

      {/* Summary */}
      <div className="px-4 py-3 bg-white border-b border-[var(--border)] flex gap-4">
        <div>
          <p className="label-sm text-[var(--teal)]">Receitas</p>
          <p className="font-sans font-semibold text-[var(--teal)]">{formatBRL(income)}</p>
        </div>
        <div className="w-px bg-[var(--border)]" />
        <div>
          <p className="label-sm text-[var(--rose)]">Despesas</p>
          <p className="font-sans font-semibold text-[var(--rose)]">{formatBRL(expense)}</p>
        </div>
        <div className="w-px bg-[var(--border)]" />
        <div>
          <p className="label-sm text-[var(--muted)]">Saldo</p>
          <p className={`font-sans font-semibold ${income - expense >= 0 ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>{formatBRL(income - expense)}</p>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[var(--rose-light)] border-b border-[var(--border)] px-4 py-3 space-y-3"
          >
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por descrição ou categoria..."
                className="w-full rounded-pill border border-[var(--border)] bg-white pl-9 pr-4 py-2.5 font-sans text-sm focus:outline-none focus:border-[var(--rose)]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-[var(--muted)]" />
                </button>
              )}
            </div>

            {/* Period */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-sans whitespace-nowrap transition-all ${period === p.value ? 'bg-[var(--rose)] text-white' : 'bg-white text-[var(--muted)] border border-[var(--border)]'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Type + who */}
            <div className="flex gap-2">
              <div className="flex gap-1 bg-white rounded-pill border border-[var(--border)] p-1">
                {['all', 'expense', 'income'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-pill text-xs font-sans transition-all ${typeFilter === t ? 'bg-[var(--rose)] text-white' : 'text-[var(--muted)]'}`}
                  >
                    {t === 'all' ? 'Tudo' : t === 'expense' ? 'Despesa' : 'Receita'}
                  </button>
                ))}
              </div>
              {couple && (
                <div className="flex gap-1 bg-white rounded-pill border border-[var(--border)] p-1">
                  {['all', couple.partner1Name, couple.partner2Name].map((w) => (
                    <button
                      key={w}
                      onClick={() => setWhoFilter(w)}
                      className={`px-2.5 py-1 rounded-pill text-xs font-sans transition-all ${whoFilter === w ? 'bg-[var(--rose)] text-white' : 'text-[var(--muted)]'}`}
                    >
                      {w === 'all' ? 'Todos' : w.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {grouped.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhuma transação"
            subtitle="Adicione receitas e despesas para acompanhar suas finanças"
            action={() => setShowForm(true)}
            actionLabel="Adicionar transação"
          />
        ) : (
          grouped.map(([date, { label, items }]) => (
            <div key={date}>
              <p className="label-sm mb-2">{label}</p>
              <div className="space-y-2">
                {items.map((t) => {
                  const cat = getCategoryByName(t.category);
                  const IconComp = Icons[cat.icon] || Icons.MoreHorizontal;
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 bg-white rounded-card p-3 shadow-card border border-[var(--border)] cursor-pointer"
                      onClick={() => setEditTx(t)}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                        <IconComp size={18} color={cat.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-[var(--ink)] truncate">{t.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="muted" className="text-[10px]">{t.category}</Badge>
                          {couple && (
                            <Avatar
                              name={t.paidBy}
                              color={t.paidBy === couple.partner1Name ? couple.partner1Color : couple.partner2Color}
                              src={getPartnerAvatar(couple, t.paidBy)}
                              size="xs"
                            />
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-sans text-sm font-semibold ${t.type === 'income' ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>
                          {t.type === 'expense' ? '-' : '+'}{formatBRL(t.amount)}
                        </p>
                        {t.installments && (
                          <p className="text-[10px] text-[var(--muted)]">{t.installmentCurrent}/{t.installments}x</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}
                        className="p-1.5 rounded-full hover:bg-[var(--rose-light)] transition-colors ml-1"
                        aria-label="Deletar"
                      >
                        <Trash2 size={15} className="text-[var(--muted)]" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShowForm(true)}
        aria-label="Nova transação"
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-[var(--rose)] text-white shadow-rose flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={24} />
      </motion.button>

      <TransactionForm open={showForm || !!editTx} onClose={() => { setShowForm(false); setEditTx(null); }} defaultValues={editTx} />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deletar transação"
        message="Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita."
        danger
      />
    </div>
  );
}
