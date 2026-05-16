import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import BudgetForm from '../../components/forms/BudgetForm';
import DonutChart from '../../components/charts/DonutChart';
import useBudgetStore from '../../store/budgetStore';
import useTransactionStore from '../../store/transactionStore';
import { formatBRL, formatPercentNumber } from '../../utils/formatters';
import { getCategoryByName } from '../../utils/categories';
import { getBudgetInsight } from '../../utils/calculations';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Budget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const { budgets, loadBudgets } = useBudgetStore();
  const { transactions, loadTransactions } = useTransactionStore();

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  useEffect(() => { loadBudgets(); loadTransactions(); }, []);

  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month && b.year === year), [budgets, month, year]);
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

  const insights = useMemo(() => getBudgetInsight(monthBudgets, spentByCategory), [monthBudgets, spentByCategory]);

  const totalBudgeted = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);

  const donutData = monthBudgets.map((b) => {
    const cat = getCategoryByName(b.category);
    return { name: b.category, value: spentByCategory[b.category] || 0, color: cat.color };
  }).filter((d) => d.value > 0);

  return (
    <div className="page-content">
      <TopBar
        title="Orçamento"
        actions={
          <button onClick={() => setShowForm(true)} className="p-2 rounded-full bg-[var(--rose-light)] text-[var(--rose)] hover:bg-[var(--rose)] hover:text-white transition-all" aria-label="Nova categoria">
            <Plus size={20} />
          </button>
        }
      />

      {/* Month selector */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--border)]">
        <button onClick={() => setCurrentDate((d) => subMonths(d, 1))} className="p-2 rounded-full hover:bg-[var(--rose-light)] transition-colors">
          <ChevronLeft size={20} className="text-[var(--muted)]" />
        </button>
        <span className="font-serif text-lg text-[var(--ink)] capitalize">{monthName}</span>
        <button onClick={() => setCurrentDate((d) => addMonths(d, 1))} className="p-2 rounded-full hover:bg-[var(--rose-light)] transition-colors">
          <ChevronRight size={20} className="text-[var(--muted)]" />
        </button>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Summary */}
        {totalBudgeted > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex justify-between mb-3">
                <div>
                  <p className="label-sm">Total orçado</p>
                  <p className="font-serif text-xl">{formatBRL(totalBudgeted)}</p>
                </div>
                <div className="text-right">
                  <p className="label-sm">Total gasto</p>
                  <p className={`font-serif text-xl ${totalSpent > totalBudgeted ? 'text-[var(--rose)]' : 'text-[var(--ink)]'}`}>
                    {formatBRL(totalSpent)}
                  </p>
                </div>
              </div>
              <ProgressBar value={totalSpent} total={totalBudgeted} color={totalSpent > totalBudgeted ? 'rose' : 'teal'} height="h-2" />
              <p className="font-sans text-xs text-[var(--muted)] mt-1.5 text-right">{formatPercentNumber(totalSpent, totalBudgeted)}% utilizado</p>
            </Card>
          </motion.div>
        )}

        {/* Insights */}
        {insights.filter((i) => i.type !== 'ok').length > 0 && (
          <div className="space-y-2">
            {insights.filter((i) => i.type !== 'ok').map((ins) => (
              <div
                key={ins.category}
                className={`flex items-start gap-3 p-3 rounded-element border ${ins.type === 'danger' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}
              >
                {ins.type === 'danger' ? <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />}
                <p className="font-sans text-xs text-[var(--ink-soft)]">
                  {ins.type === 'danger'
                    ? `Atenção: ${ins.category} ultrapassou o limite em ${formatBRL(ins.spent - ins.limit)}.`
                    : `Vocês já gastaram ${Math.round(ins.pct)}% do orçamento de ${ins.category}.`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Donut */}
        {donutData.length > 0 && (
          <Card>
            <h3 className="font-serif text-base text-[var(--ink)] mb-3">Gastos por categoria</h3>
            <DonutChart data={donutData} height={220} />
          </Card>
        )}

        {/* Budget list */}
        {monthBudgets.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="font-serif text-xl text-[var(--ink)]">Nenhum orçamento definido</p>
            <p className="font-sans text-sm text-[var(--muted)]">Defina limites por categoria para controlar os gastos</p>
            <button onClick={() => setShowForm(true)} className="font-sans text-sm text-[var(--rose)] font-medium">
              + Definir primeiro orçamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-serif text-lg text-[var(--ink)]">Por categoria</p>
            {insights.map((ins, i) => {
              const cat = getCategoryByName(ins.category);
              const IconComp = Icons[cat.icon] || Icons.MoreHorizontal;
              const color = ins.type === 'danger' ? 'rose' : ins.type === 'warning' ? 'amber' : 'teal';
              const budget = monthBudgets.find((b) => b.category === ins.category);
              return (
                <motion.div
                  key={ins.category}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => { setEditCategory(ins.category); setShowForm(true); }}
                  className="bg-white rounded-card p-4 shadow-card border border-[var(--border)] cursor-pointer hover:shadow-rose transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                        <IconComp size={16} color={cat.color} />
                      </div>
                      <span className="font-sans text-sm font-medium text-[var(--ink-soft)]">{ins.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ins.type === 'danger' && <AlertTriangle size={14} className="text-[var(--rose)]" />}
                      {ins.type === 'ok' && <CheckCircle size={14} className="text-[var(--teal)]" />}
                      <Badge variant={color === 'rose' ? 'rose' : color === 'amber' ? 'amber' : 'teal'}>
                        {Math.round(ins.pct)}%
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar value={ins.spent} total={ins.limit} color={color} height="h-2" />
                  <div className="flex justify-between mt-1.5 text-xs font-sans text-[var(--muted)]">
                    <span>Gasto: {formatBRL(ins.spent)}</span>
                    <span>Limite: {formatBRL(ins.limit)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BudgetForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditCategory(null); }}
        month={month}
        year={year}
        existingCategory={editCategory}
      />
    </div>
  );
}
