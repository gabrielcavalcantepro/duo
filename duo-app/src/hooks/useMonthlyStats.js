import { useMemo } from 'react';
import useTransactionStore from '../store/transactionStore';
import { getMonthlyStats, getByCategory, getLast6MonthsStats } from '../utils/calculations';
import { formatMonthShort } from '../utils/formatters';

export function useMonthlyStats(month, year) {
  const { transactions } = useTransactionStore();

  return useMemo(() => {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const stats = getMonthlyStats(transactions, m, y);
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear = m === 1 ? y - 1 : y;
    const prevStats = getMonthlyStats(transactions, prevMonth, prevYear);
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    });
    const byCategory = getByCategory(monthTransactions);
    const byCategoryIncome = getByCategory(monthTransactions, 'income');
    const last6 = getLast6MonthsStats(transactions).map((s) => ({
      label: formatMonthShort(s.month, s.year),
      income: s.income,
      expense: s.expense,
      balance: s.balance,
    }));
    return { stats, prevStats, monthTransactions, byCategory, byCategoryIncome, last6 };
  }, [transactions, month, year]);
}
