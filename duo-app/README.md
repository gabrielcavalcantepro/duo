# Duo — Finanças do Casal

> Finanças que fortalecem o casal

Um Progressive Web App completo para gestão financeira de casais. Funciona 100% offline após o primeiro acesso, com dados armazenados localmente no dispositivo.

## Funcionalidades

- **Dashboard** — Visão geral do mês, saldo, metas e últimas transações
- **Transações** — Registro de receitas e despesas com categorias e filtros
- **Metas** — Metas financeiras com aportes e projeção de conclusão
- **Orçamento** — Limites mensais por categoria com alertas automáticos
- **Reunião mensal** — Wizard guiado de 7 etapas para a reunião financeira do casal
- **Desafio 21 dias** — 21 tarefas diárias para fortalecer hábitos financeiros
- **Divisão de contas** — Divisão de despesas entre o casal com saldo automático
- **Relatórios** — Gráficos e análises por período e por pessoa
- **Configurações** — Perfil do casal, finanças, exportação de dados

## Stack Técnica

- **React 18** + **Vite**
- **Tailwind CSS v3** + CSS custom properties
- **React Router v6**
- **Zustand** (estado global)
- **Dexie.js** (IndexedDB — offline)
- **Framer Motion** (animações)
- **Recharts** (gráficos)
- **Lucide React** (ícones)
- **Vite PWA Plugin** (service worker + manifest)
- **React Hook Form** + **Zod** (formulários)
- **date-fns** (datas)
- **react-hot-toast** (notificações)

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Visualizar o build
npm run preview
```

## PWA

O app funciona como PWA e pode ser instalado diretamente pelo browser. Após o primeiro acesso, todos os dados ficam disponíveis offline.

## Dados

Todos os dados são armazenados localmente no IndexedDB do dispositivo. Nenhuma informação é enviada para servidores externos.

Para exportar os dados, acesse **Configurações → Exportar dados**.
