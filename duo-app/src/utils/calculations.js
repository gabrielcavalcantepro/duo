export const getMonthlyStats = (transactions, month, year) => {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, savingRate: income > 0 ? ((income - expense) / income) * 100 : 0 };
};

export const getByCategory = (transactions, type = 'expense') => {
  const filtered = transactions.filter((t) => t.type === type);
  const map = {};
  filtered.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const getLast6MonthsStats = (transactions) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const stats = getMonthlyStats(transactions, month, year);
    months.push({ month, year, ...stats });
  }
  return months;
};

export const calculateSplitBalance = (splits, partner1Name) => {
  let balance = 0;
  splits.filter((s) => !s.settled).forEach((s) => {
    const { totalAmount, paidBy, splitType, customSplit } = s;
    if (splitType === '50/50') {
      const half = totalAmount / 2;
      if (paidBy === partner1Name) balance += half;
      else balance -= half;
    } else if (splitType === 'custom' && customSplit) {
      if (paidBy === partner1Name) balance += customSplit.person2;
      else balance -= customSplit.person1;
    } else if (splitType === 'proportional' && customSplit) {
      if (paidBy === partner1Name) balance += customSplit.person2;
      else balance -= customSplit.person1;
    }
  });
  return balance;
};

export const getBudgetInsight = (budgets, spentByCategory) => {
  const insights = [];
  budgets.forEach((b) => {
    const spent = spentByCategory[b.category] || 0;
    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    if (pct > 100) {
      insights.push({ type: 'danger', category: b.category, spent, limit: b.limit, pct });
    } else if (pct > 80) {
      insights.push({ type: 'warning', category: b.category, spent, limit: b.limit, pct });
    } else {
      insights.push({ type: 'ok', category: b.category, spent, limit: b.limit, pct });
    }
  });
  return insights.sort((a, b) => b.pct - a.pct);
};

export const calcMeetingScore = (transactions, goals, budgets, month, year) => {
  let score = 0;
  const stats = getMonthlyStats(transactions, month, year);
  if (stats.savingRate > 0) score += 30;
  if (stats.savingRate > 10) score += 10;
  if (goals.some((g) => g.currentAmount > 0)) score += 20;
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  score += completedGoals * 10;
  const spentByCategory = {};
  transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() + 1 === month && new Date(t.date).getFullYear() === year)
    .forEach((t) => { spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount; });
  const overBudget = budgets.filter((b) => b.month === month && b.year === year && (spentByCategory[b.category] || 0) > b.limit).length;
  score += Math.max(0, 30 - overBudget * 10);
  return Math.min(100, score);
};
