export const EXPENSE_CATEGORIES = [
  { name: 'Moradia',      icon: 'Home',            color: '#8B5CF6' },
  { name: 'Alimentação',  icon: 'UtensilsCrossed',  color: '#F59E0B' },
  { name: 'Transporte',   icon: 'Car',             color: '#3B82F6' },
  { name: 'Saúde',        icon: 'Heart',           color: '#EF4444' },
  { name: 'Lazer',        icon: 'Smile',           color: '#EC4899' },
  { name: 'Vestuário',    icon: 'Shirt',           color: '#06B6D4' },
  { name: 'Educação',     icon: 'GraduationCap',   color: '#10B981' },
  { name: 'Assinaturas',  icon: 'CreditCard',      color: '#6366F1' },
  { name: 'Viagem',       icon: 'Plane',           color: '#D4537E' },
  { name: 'Pet',          icon: 'PawPrint',        color: '#92400E' },
  { name: 'Beleza',       icon: 'Sparkles',        color: '#F472B6' },
  { name: 'Presentes',    icon: 'Gift',            color: '#A78BFA' },
  { name: 'Outros',       icon: 'MoreHorizontal',  color: '#9CA3AF' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salário',          icon: 'Briefcase',   color: '#1D9E75' },
  { name: 'Freelance',        icon: 'Laptop',      color: '#0EA5E9' },
  { name: 'Investimentos',    icon: 'TrendingUp',  color: '#10B981' },
  { name: 'Aluguel recebido', icon: 'Building',    color: '#8B5CF6' },
  { name: 'Outros',           icon: 'Plus',        color: '#6B7280' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryByName = (name) =>
  ALL_CATEGORIES.find((c) => c.name === name) || { name, icon: 'MoreHorizontal', color: '#9CA3AF' };

export const GOAL_EMOJIS = [
  '✈️','🏠','🚗','💍','🎓','🏖️','💻','🍼','🐕','🌎',
  '🛋️','📱','🎸','🚀','💪','🎂','🏋️','🏄','🎮','💎',
  '🛡️','🎯','🌱','🏡','⛵','🎹','🐈','🌸','🏔️','🍕',
];

export const PARTNER_COLORS = [
  { label: 'Rose',   value: '#D4537E' },
  { label: 'Teal',   value: '#1D9E75' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Amber',  value: '#F59E0B' },
  { label: 'Blue',   value: '#3B82F6' },
  { label: 'Coral',  value: '#F97316' },
];

export const CHALLENGE_TASKS = [
  { day: 1,  title: 'Descoberta',          description: 'Cada um lista os 3 maiores gastos do último mês. Compartilhem sem julgamento.' },
  { day: 2,  title: 'Sonhos',             description: 'Escrevam juntos 5 coisas que querem conquistar financeiramente nos próximos 12 meses.' },
  { day: 3,  title: 'Revisão',            description: 'Revisem todas as assinaturas e serviços que pagam. Alguém para cancelar?' },
  { day: 4,  title: 'Emergência',         description: 'Calculem quanto precisariam para 6 meses de despesas fixas. Onde estão nisso?' },
  { day: 5,  title: 'Hábito positivo',    description: 'Identifiquem um hábito de gasto que podem substituir por algo mais barato.' },
  { day: 6,  title: 'Gratidão financeira',description: 'Cada um fala uma coisa pela qual é grato nas finanças do casal.' },
  { day: 7,  title: 'Revisão semanal',    description: 'Revisem os gastos da semana. Sem surpresas?' },
  { day: 8,  title: 'Categoria surpresa', description: 'Olhem uma categoria que nunca prestaram atenção. O que encontraram?' },
  { day: 9,  title: 'Meta aporte',        description: 'Façam um aporte em qualquer meta, mesmo que pequeno. R$10 já conta.' },
  { day: 10, title: 'Conversa difícil',   description: 'Falem sobre algo financeiro que um de vocês evita. 10 minutos, sem julgamento.' },
  { day: 11, title: 'Comparação saudável',description: 'Onde estavam financeiramente há 1 ano? Celebrem o que melhorou.' },
  { day: 12, title: 'Automatização',      description: 'Configurem pelo menos 1 débito automático ou transferência programada.' },
  { day: 13, title: 'Lazer sem culpa',    description: 'Planejem um programa juntos com orçamento combinado.' },
  { day: 14, title: 'Checkpoint',         description: 'São 14 dias! Revisem o desafio. O que já mudou no jeito de vocês falarem de dinheiro?' },
  { day: 15, title: 'Detox digital',      description: 'Revisem apps de compra, redes sociais e gatilhos de consumo.' },
  { day: 16, title: 'Herança de hábitos', description: 'De onde vêm os hábitos financeiros de cada um? Família? Passado?' },
  { day: 17, title: 'Próxima compra',     description: 'Planejem a próxima compra grande. Quando? Quanto poupar por mês?' },
  { day: 18, title: 'Reconhecimento',     description: 'Cada um reconhece algo que o parceiro faz bem nas finanças.' },
  { day: 19, title: 'Sem gastar',         description: 'Passem o dia sem gastos não essenciais. Como foi?' },
  { day: 20, title: 'Projeção',           description: 'Onde vocês querem estar financeiramente em 5 anos? Visualizem juntos.' },
  { day: 21, title: 'Celebração',         description: 'Chegaram ao final! Façam algo especial dentro do orçamento. Vocês merecem.' },
];
