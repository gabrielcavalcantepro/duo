import { formatDistanceToNow, format, differenceInDays, differenceInMonths, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export const formatBRLCompact = (value) => {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value || 0);
  }
  return formatBRL(value);
};

export const formatPercent = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatPercentNumber = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const formatRelativeDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = differenceInDays(now, date);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return format(date, 'dd/MM', { locale: ptBR });
};

export const formatDate = (dateStr, fmt = 'dd/MM/yyyy') => {
  if (!dateStr) return '';
  return format(new Date(dateStr), fmt, { locale: ptBR });
};

export const formatMonthYear = (dateStr) => {
  return format(new Date(dateStr), "MMMM 'de' yyyy", { locale: ptBR });
};

export const formatMonthShort = (month, year) => {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMM/yy', { locale: ptBR });
};

export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isPast(date)) return 0;
  return differenceInDays(date, new Date());
};

export const monthsUntil = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isPast(date)) return 0;
  return differenceInMonths(date, new Date());
};

export const formatDeadline = (dateStr) => {
  if (!dateStr) return '';
  const days = daysUntil(dateStr);
  if (days === 0) return 'Venceu hoje';
  if (days < 0) return `Venceu há ${Math.abs(days)} dias`;
  if (days < 30) return `Faltam ${days} dias`;
  const months = monthsUntil(dateStr);
  if (months < 12) return `Faltam ${months} meses`;
  return `Faltam ${Math.round(months / 12)} anos`;
};

export const projectGoalDate = (current, target, monthlyContribution) => {
  if (!monthlyContribution || monthlyContribution <= 0) return null;
  const remaining = target - current;
  if (remaining <= 0) return new Date();
  const months = Math.ceil(remaining / monthlyContribution);
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

export const MOTIVATIONAL_PHRASES = [
  'Juntos, cada real conta mais.',
  'Planejar juntos é o primeiro passo para sonhar junto.',
  'O casal que poupa junto, cresce junto.',
  'Pequenos hábitos, grandes conquistas.',
  'Transparência financeira é um ato de amor.',
  'Cada meta é um sonho com data marcada.',
  'Dinheiro bem gerido é mais tempo para quem você ama.',
  'Construam riqueza e memórias ao mesmo tempo.',
  'O melhor investimento é o que fazem juntos.',
  'Finanças saudáveis, relacionamento mais forte.',
];
