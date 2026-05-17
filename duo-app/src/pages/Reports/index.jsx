import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import { getPartnerAvatar } from '../../utils/avatarHelper';
import Badge from '../../components/ui/Badge';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import useTransactionStore from '../../store/transactionStore';
import useGoalStore from '../../store/goalStore';
import useAuthStore from '../../store/authStore';
import { formatBRL, formatBRLCompact, formatMonthShort, formatDeadline } from '../../utils/formatters';
import { getMonthlyStats, getByCategory, getLast6MonthsStats } from '../../utils/calculations';
import { getCategoryByName } from '../../utils/categories';
import { subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

const PERIODS = [
  { label: 'Este mês', value: '1m' },
  { label: 'Mês passado', value: 'last' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: 'Este ano', value: 'year' },
];

export default function Reports() {
  const { transactions, loadTransactions } = useTransactionStore();
  const { goals, loadGoals } = useGoalStore();
  const { couple } = useAuthStore();
  const [period, setPeriod] = useState('1m');

  useEffect(() => { loadTransactions(); loadGoals(); }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    let start, end = endOfMonth(now);
    if (period === '1m') { start = startOfMonth(now); }
    else if (period === 'last') { const lm = subMonths(now, 1); start = startOfMonth(lm); end = endOfMonth(lm); }
    else if (period === '3m') { start = startOfMonth(subMonths(now, 2)); }
    else if (period === '6m') { start = startOfMonth(subMonths(now, 5)); }
    else { start = startOfYear(now); }
    return transactions.filter((t) => { const d = new Date(t.date); return d >= start && d <= end; });
  }, [transactions, period]);

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  const byCategory = getByCategory(filtered);
  const donutData = byCategory.map((c) => {
    const cat = getCategoryByName(c.category);
    return { name: c.category, value: c.amount, color: cat.color };
  });

  const last6 = getLast6MonthsStats(transactions).map((s) => ({
    label: formatMonthShort(s.month, s.year),
    income: s.income,
    expense: s.expense,
    balance: s.balance,
  }));

  const p1Transactions = filtered.filter((t) => t.paidBy === couple?.partner1Name && t.type === 'expense');
  const p2Transactions = filtered.filter((t) => t.paidBy === couple?.partner2Name && t.type === 'expense');
  const p1Total = p1Transactions.reduce((s, t) => s + t.amount, 0);
  const p2Total = p2Transactions.reduce((s, t) => s + t.amount, 0);

  const prevPeriodTransactions = useMemo(() => {
    const now = new Date();
    if (period === '1m') {
      const lm = subMonths(now, 1);
      return transactions.filter((t) => { const d = new Date(t.date); return d >= startOfMonth(lm) && d <= endOfMonth(lm); });
    }
    return [];
  }, [transactions, period]);
  const prevByCategory = getByCategory(prevPeriodTransactions);

  return (
    <div className="page-content">
      <TopBar title="Relatórios" />

      {/* Period selector */}
      <div className="px-4 py-3 bg-white border-b border-[var(--border)] flex gap-2 overflow-x-auto no-scrollbar">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-pill text-sm font-sans whitespace-nowrap transition-all ${period === p.value ? 'bg-[var(--rose)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Overview cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-card p-4 shadow-card border border-[var(--border)]">
            <p className="label-sm text-[var(--teal)]">Receitas</p>
            <p className="font-serif text-2xl text-[var(--teal)] mt-1">{formatBRL(income)}</p>
          </div>
          <div className="bg-white rounded-card p-4 shadow-card border border-[var(--border)]">
            <p className="label-sm text-[var(--rose)]">Despesas</p>
            <p className="font-serif text-2xl text-[var(--rose)] mt-1">{formatBRL(expense)}</p>
          </div>
          <div className="bg-white rounded-card p-4 shadow-card border border-[var(--border)]">
            <p className="label-sm text-[var(--muted)]">Saldo</p>
            <p className={`font-serif text-2xl mt-1 ${income - expense >= 0 ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>{formatBRL(income - expense)}</p>
          </div>
          <div className="bg-white rounded-card p-4 shadow-card border border-[var(--border)]">
            <p className="label-sm text-[var(--muted)]">Taxa poupança</p>
            <p className={`font-serif text-2xl mt-1 ${savingRate >= 0 ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>{savingRate}%</p>
          </div>
        </motion.div>

        {/* Bar chart: income vs expense */}
        <Card className="hover:border-[var(--rose-mid)] transition-colors duration-200">
          <h3 className="font-serif text-base text-[var(--ink)] mb-3">Receitas vs Despesas</h3>
          <BarChart
            data={last6}
            height={200}
            bars={[
              { dataKey: 'income', name: 'Receitas', fill: 'var(--teal)' },
              { dataKey: 'expense', name: 'Despesas', fill: 'var(--rose)' },
            ]}
          />
        </Card>

        {/* Line chart: balance evolution */}
        <Card className="hover:border-[var(--rose-mid)] transition-colors duration-200">
          <h3 className="font-serif text-base text-[var(--ink)] mb-3">Evolução do saldo</h3>
          <LineChart data={last6} dataKey="balance" height={160} />
        </Card>

        {/* By category */}
        {donutData.length > 0 && (
          <Card className="hover:border-[var(--rose-mid)] transition-colors duration-200">
            <h3 className="font-serif text-base text-[var(--ink)] mb-3">Gastos por categoria</h3>
            <DonutChart data={donutData} height={220} />
            <div className="mt-4 space-y-2">
              {byCategory.map((cat) => {
                const catData = getCategoryByName(cat.category);
                const IconComp = Icons[catData.icon] || Icons.MoreHorizontal;
                const prevCat = prevByCategory.find((c) => c.category === cat.category);
                const diff = prevCat ? ((cat.amount - prevCat.amount) / prevCat.amount) * 100 : null;
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${catData.color}20` }}>
                      <IconComp size={14} color={catData.color} />
                    </div>
                    <span className="font-sans text-sm text-[var(--ink-soft)] flex-1">{cat.category}</span>
                    {diff !== null && (
                      <span className={`font-sans text-xs ${diff > 0 ? 'text-[var(--rose)]' : 'text-[var(--teal)]'}`}>
                        {diff > 0 ? '↑' : '↓'} {Math.abs(Math.round(diff))}%
                      </span>
                    )}
                    <span className="font-sans text-sm font-semibold text-[var(--ink)]">{formatBRL(cat.amount)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* By person */}
        {couple && (p1Total > 0 || p2Total > 0) && (
          <Card className="hover:border-[var(--rose-mid)] transition-colors duration-200">
            <h3 className="font-serif text-base text-[var(--ink)] mb-3">Por pessoa</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: couple.partner1Name, color: couple.partner1Color, total: p1Total, avatarUrl: couple.partner1AvatarUrl },
                { name: couple.partner2Name, color: couple.partner2Color, total: p2Total, avatarUrl: couple.partner2AvatarUrl },
              ].filter((p) => p.name && p.name.trim() !== '').map((p) => (
                <div key={p.name} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Avatar name={p.name} color={p.color} src={p.avatarUrl} size="md" />
                  </div>
                  <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">{p.name}</p>
                  <p className="font-serif text-xl text-[var(--ink)]">{formatBRL(p.total)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Goals progress */}
        {goals.length > 0 && (
          <Card className="hover:border-[var(--rose-mid)] transition-colors duration-200">
            <h3 className="font-serif text-base text-[var(--ink)] mb-3">Progresso das metas</h3>
            <div className="space-y-4">
              {goals.map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{g.emoji}</span>
                        <span className="font-sans text-sm text-[var(--ink-soft)]">{g.name}</span>
                      </div>
                      <span className="font-sans text-xs text-[var(--muted)]">{pct}% · {formatDeadline(g.deadline)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color || 'var(--rose)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
