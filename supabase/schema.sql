-- TABELA DE ASSINANTES (populada pelo webhook da Hotmart)
create table subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  hotmart_id text,
  status text default 'active', -- active, cancelled, expired
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- TABELA DE USUÁRIOS DO APP (criada no registro)
create table app_users (
  id uuid default gen_random_uuid() primary key,
  auth_id uuid references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  couple_id uuid,
  color text default '#D4537E',
  is_partner boolean default false,
  created_at timestamp with time zone default now()
);

-- TABELA DE CASAIS
create table couples (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  partner1_id uuid references app_users(id),
  partner2_id uuid references app_users(id),
  partner1_name text,
  partner1_color text default '#D4537E',
  partner2_name text,
  partner2_color text default '#1D9E75',
  invite_code text unique not null,
  currency text default 'BRL',
  closing_day integer default 5,
  salary1 numeric default 0,
  salary2 numeric default 0,
  monthly_savings_goal numeric default 0,
  created_at timestamp with time zone default now()
);

-- TABELA DE TRANSAÇÕES
create table transactions (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  amount numeric not null,
  type text not null, -- income | expense
  category text not null,
  description text,
  paid_by text not null,
  date timestamp with time zone not null,
  is_shared boolean default true,
  installments integer default 1,
  installment_current integer default 1,
  created_at timestamp with time zone default now()
);

-- TABELA DE METAS
create table goals (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  name text not null,
  emoji text default '🎯',
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline timestamp with time zone,
  color text default '#D4537E',
  priority text default 'média',
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- TABELA DE CONTRIBUIÇÕES DE METAS
create table goal_contributions (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  couple_id uuid references couples(id) on delete cascade not null,
  amount numeric not null,
  paid_by text not null,
  note text,
  date timestamp with time zone default now()
);

-- TABELA DE ORÇAMENTOS
create table budgets (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  month integer not null,
  year integer not null,
  category text not null,
  limit_amount numeric not null,
  created_at timestamp with time zone default now(),
  unique(couple_id, month, year, category)
);

-- TABELA DE REUNIÕES
create table meetings (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  month integer not null,
  year integer not null,
  answers jsonb,
  score integer default 0,
  completed_at timestamp with time zone default now(),
  unique(couple_id, month, year)
);

-- TABELA DE DESAFIO 21 DIAS
create table challenge_days (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  day integer not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  note text,
  unique(couple_id, day)
);

-- TABELA DE DIVISÃO DE CONTAS
create table split_bills (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  description text not null,
  total_amount numeric not null,
  paid_by text not null,
  split_type text not null,
  items jsonb,
  settled boolean default false,
  date timestamp with time zone default now()
);

-- TABELA DE CATEGORIAS CUSTOMIZADAS
create table categories (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  name text not null,
  icon text,
  color text,
  type text not null,
  created_at timestamp with time zone default now()
);

-- RLS (Row Level Security) — cada casal só vê seus próprios dados
alter table app_users enable row level security;
alter table couples enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;
alter table budgets enable row level security;
alter table meetings enable row level security;
alter table challenge_days enable row level security;
alter table split_bills enable row level security;
alter table categories enable row level security;
alter table subscribers enable row level security;

-- Policies para app_users
create policy "Usuário vê seu próprio perfil" on app_users
  for select using (auth.uid() = auth_id);

create policy "Usuário atualiza seu próprio perfil" on app_users
  for update using (auth.uid() = auth_id);

create policy "Usuário cria seu próprio perfil" on app_users
  for insert with check (auth.uid() = auth_id);

-- Policy helper: retorna o couple_id do usuário autenticado
create or replace function get_user_couple_id()
returns uuid language sql security definer as $$
  select couple_id from app_users where auth_id = auth.uid() limit 1;
$$;

-- Policies para todas as tabelas do casal
create policy "Casal acessa suas transações" on transactions
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa suas metas" on goals
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa contribuições" on goal_contributions
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa orçamentos" on budgets
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa reuniões" on meetings
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa desafio" on challenge_days
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa divisões" on split_bills
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa categorias" on categories
  for all using (couple_id = get_user_couple_id());

create policy "Casal acessa seu perfil" on couples
  for all using (id = get_user_couple_id());

create policy "Casal cria seu perfil" on couples
  for insert with check (partner1_id = (select id from app_users where auth_id = auth.uid() limit 1));

-- Subscribers só acessível via service role (webhook)
create policy "Apenas service role acessa subscribers" on subscribers
  for all using (false);
