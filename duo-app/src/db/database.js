import Dexie from 'dexie';

const db = new Dexie('DuoDB');

db.version(1).stores({
  couple:
    '++id, name, partner1Name, partner1Color, partner2Name, partner2Color, createdAt',
  transactions:
    '++id, amount, type, category, description, paidBy, date, isShared, installments, installmentCurrent, createdAt',
  goals:
    '++id, name, emoji, targetAmount, currentAmount, deadline, color, priority, createdAt',
  goalContributions:
    '++id, goalId, amount, paidBy, note, date',
  budgets:
    '++id, month, year, category, limit, createdAt',
  meetings:
    '++id, month, year, completedAt, answers, score',
  challengeDays:
    '++id, day, completed, completedAt, note',
  splitBills:
    '++id, description, totalAmount, paidBy, splitType, items, settled, date',
  categories:
    '++id, name, icon, color, type, isCustom',
});

export async function seedDemoData() {
  const coupleCount = await db.couple.count();
  if (coupleCount > 0) return;

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  await db.couple.add({
    name: 'Ana & Rafael',
    partner1Name: 'Ana',
    partner1Color: '#D4537E',
    partner2Name: 'Rafael',
    partner2Color: '#1D9E75',
    currency: 'BRL',
    closingDay: 5,
    salary1: 5800,
    salary2: 6200,
    monthlySavingsGoal: 1500,
    createdAt: now.toISOString(),
  });

  const makeDate = (d) => {
    const date = new Date(thisMonth);
    date.setDate(d);
    return date.toISOString();
  };
  const makeLastDate = (d) => {
    const date = new Date(lastMonth);
    date.setDate(d);
    return date.toISOString();
  };

  await db.transactions.bulkAdd([
    { amount: 5800, type: 'income', category: 'Salário', description: 'Salário Ana', paidBy: 'Ana', date: makeDate(1), isShared: true, createdAt: makeDate(1) },
    { amount: 6200, type: 'income', category: 'Salário', description: 'Salário Rafael', paidBy: 'Rafael', date: makeDate(1), isShared: true, createdAt: makeDate(1) },
    { amount: 1800, type: 'expense', category: 'Moradia', description: 'Aluguel', paidBy: 'Rafael', date: makeDate(5), isShared: true, createdAt: makeDate(5) },
    { amount: 320, type: 'expense', category: 'Alimentação', description: 'Supermercado Semana 1', paidBy: 'Ana', date: makeDate(7), isShared: true, createdAt: makeDate(7) },
    { amount: 89, type: 'expense', category: 'Assinaturas', description: 'Netflix, Spotify, iCloud', paidBy: 'Rafael', date: makeDate(8), isShared: true, createdAt: makeDate(8) },
    { amount: 450, type: 'expense', category: 'Transporte', description: 'Combustível + Uber', paidBy: 'Rafael', date: makeDate(10), isShared: true, createdAt: makeDate(10) },
    { amount: 180, type: 'expense', category: 'Alimentação', description: 'Delivery semana', paidBy: 'Ana', date: makeDate(12), isShared: true, createdAt: makeDate(12) },
    { amount: 230, type: 'expense', category: 'Lazer', description: 'Cinema + jantar especial', paidBy: 'Ana', date: makeDate(14), isShared: true, createdAt: makeDate(14) },
    { amount: 120, type: 'expense', category: 'Saúde', description: 'Farmácia', paidBy: 'Ana', date: makeDate(15), isShared: false, createdAt: makeDate(15) },
    { amount: 280, type: 'expense', category: 'Alimentação', description: 'Supermercado Semana 3', paidBy: 'Rafael', date: makeDate(18), isShared: true, createdAt: makeDate(18) },
    { amount: 95, type: 'expense', category: 'Beleza', description: 'Salão de beleza', paidBy: 'Ana', date: makeDate(19), isShared: false, createdAt: makeDate(19) },
    { amount: 350, type: 'expense', category: 'Vestuário', description: 'Roupas temporada', paidBy: 'Rafael', date: makeDate(20), isShared: false, createdAt: makeDate(20) },
    { amount: 500, type: 'income', category: 'Freelance', description: 'Projeto freelance Rafael', paidBy: 'Rafael', date: makeDate(21), isShared: true, createdAt: makeDate(21) },
    { amount: 75, type: 'expense', category: 'Pet', description: 'Ração e petiscos', paidBy: 'Ana', date: makeDate(22), isShared: true, createdAt: makeDate(22) },

    // Last month transactions
    { amount: 5800, type: 'income', category: 'Salário', description: 'Salário Ana', paidBy: 'Ana', date: makeLastDate(1), isShared: true, createdAt: makeLastDate(1) },
    { amount: 6200, type: 'income', category: 'Salário', description: 'Salário Rafael', paidBy: 'Rafael', date: makeLastDate(1), isShared: true, createdAt: makeLastDate(1) },
    { amount: 1800, type: 'expense', category: 'Moradia', description: 'Aluguel', paidBy: 'Rafael', date: makeLastDate(5), isShared: true, createdAt: makeLastDate(5) },
    { amount: 410, type: 'expense', category: 'Alimentação', description: 'Supermercado', paidBy: 'Ana', date: makeLastDate(8), isShared: true, createdAt: makeLastDate(8) },
    { amount: 89, type: 'expense', category: 'Assinaturas', description: 'Netflix, Spotify, iCloud', paidBy: 'Rafael', date: makeLastDate(8), isShared: true, createdAt: makeLastDate(8) },
    { amount: 520, type: 'expense', category: 'Transporte', description: 'Combustível + Uber', paidBy: 'Rafael', date: makeLastDate(12), isShared: true, createdAt: makeLastDate(12) },
    { amount: 315, type: 'expense', category: 'Lazer', description: 'Show de música', paidBy: 'Ana', date: makeLastDate(15), isShared: true, createdAt: makeLastDate(15) },
    { amount: 200, type: 'expense', category: 'Alimentação', description: 'Delivery semana', paidBy: 'Rafael', date: makeLastDate(18), isShared: true, createdAt: makeLastDate(18) },
  ]);

  await db.goals.bulkAdd([
    { name: 'Viagem Portugal', emoji: '✈️', targetAmount: 12000, currentAmount: 7680, deadline: new Date(now.getFullYear(), now.getMonth() + 5, 1).toISOString(), color: '#D4537E', priority: 'alta', createdAt: now.toISOString() },
    { name: 'Reserva emergência', emoji: '🛡️', targetAmount: 18000, currentAmount: 6840, deadline: new Date(now.getFullYear() + 1, now.getMonth(), 1).toISOString(), color: '#1D9E75', priority: 'alta', createdAt: now.toISOString() },
    { name: 'Novo sofá', emoji: '🛋️', targetAmount: 3500, currentAmount: 2835, deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString(), color: '#8B5CF6', priority: 'média', createdAt: now.toISOString() },
  ]);

  await db.budgets.bulkAdd([
    { month: now.getMonth() + 1, year: now.getFullYear(), category: 'Alimentação', limit: 800, createdAt: now.toISOString() },
    { month: now.getMonth() + 1, year: now.getFullYear(), category: 'Lazer', limit: 400, createdAt: now.toISOString() },
    { month: now.getMonth() + 1, year: now.getFullYear(), category: 'Transporte', limit: 500, createdAt: now.toISOString() },
    { month: now.getMonth() + 1, year: now.getFullYear(), category: 'Assinaturas', limit: 150, createdAt: now.toISOString() },
    { month: now.getMonth() + 1, year: now.getFullYear(), category: 'Moradia', limit: 2000, createdAt: now.toISOString() },
  ]);
}

export default db;
