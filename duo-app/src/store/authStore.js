import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// Maps Supabase snake_case couple to camelCase for use throughout the app
function mapCouple(c) {
  if (!c) return null;
  return {
    ...c,
    partner1Name: c.partner1_name || '',
    partner1Color: c.partner1_color || '#D4537E',
    partner2Name: c.partner2_name || '',
    partner2Color: c.partner2_color || '#1D9E75',
    closingDay: c.closing_day || 5,
    monthlySavingsGoal: c.monthly_savings_goal || 0,
  };
}

// Converts camelCase couple fields to snake_case and strips unknown keys for Supabase
// Only includes columns that exist in the couples table schema
const COUPLE_DB_COLUMNS = new Set([
  'name', 'closing_day', 'salary1', 'salary2', 'monthly_savings_goal', 'currency',
  'partner1_id', 'partner2_id', 'invite_code',
]);

function toDbCouple(data) {
  const result = {};
  if ('name' in data) result.name = data.name;
  if ('closingDay' in data) result.closing_day = data.closingDay;
  if ('salary1' in data) result.salary1 = data.salary1;
  if ('salary2' in data) result.salary2 = data.salary2;
  if ('monthlySavingsGoal' in data) result.monthly_savings_goal = data.monthlySavingsGoal;
  if ('currency' in data) result.currency = data.currency;
  return result;
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,
      appUser: null,
      couple: null,
      activeUser: null,
      isAuthenticated: false,
      isOnboarded: false,
      needsProfileSetup: false,
      loading: true,

      initialize: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await get().loadUserData(session);
        } else {
          set({ loading: false });
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            await get().loadUserData(session);
          } else if (event === 'SIGNED_OUT') {
            set({
              session: null,
              appUser: null,
              couple: null,
              activeUser: null,
              isAuthenticated: false,
              isOnboarded: false,
              loading: false,
            });
          }
        });
      },

      loadUserData: async (session) => {
        set({ session, isAuthenticated: true });

        const { data: appUser } = await supabase
          .from('app_users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (!appUser) {
          set({ loading: false });
          return;
        }

        const existingAppUser = get().appUser;
        const mergedAppUser = {
          ...existingAppUser,
          ...appUser,
          avatar_url: appUser.avatar_url || existingAppUser?.avatar_url || null,
        };
        set({ appUser: mergedAppUser, activeUser: get().activeUser || appUser.name });

        if (appUser.couple_id) {
          const { data: couple } = await supabase
            .from('couples')
            .select('*')
            .eq('id', appUser.couple_id)
            .single();

          if (couple) {
            const partnerIds = [couple.partner1_id, couple.partner2_id].filter(Boolean);
            const { data: partners } = await supabase
              .from('app_users')
              .select('id, name, color, avatar_url, is_partner')
              .in('id', partnerIds);

            const partner1 = partners?.find((p) => p.id === couple.partner1_id);
            const partner2 = partners?.find((p) => p.id === couple.partner2_id);

            const enrichedCouple = {
              ...mapCouple(couple),
              partner1AvatarUrl: partner1?.avatar_url || null,
              partner2AvatarUrl: partner2?.avatar_url || null,
            };

            set({ couple: enrichedCouple, isOnboarded: true, loading: false });
          } else {
            set({ loading: false });
          }
        } else {
          set({ loading: false });
        }
      },

      registerWithEmail: async (email, password, name) => {
        const { data: subscriber, error: subError } = await supabase
          .from('subscribers')
          .select('email, status')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (subError || !subscriber) {
          throw new Error('Email não encontrado. Confirme o email usado na compra na Hotmart.');
        }

        if (subscriber.status !== 'active') {
          throw new Error('Sua assinatura está inativa. Entre em contato com o suporte.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: { data: { name } },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Este email já possui uma conta. Faça login.');
          }
          throw error;
        }

        const { error: userError } = await supabase
          .from('app_users')
          .insert({
            auth_id: data.user.id,
            email: email.toLowerCase().trim(),
            name,
            color: '#D4537E',
            is_partner: false,
          });

        if (userError) throw userError;

        // Aguarda o app_users ser inserido antes de carregar os dados
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Tenta carregar até 5 vezes com intervalo de 500ms
          let attempts = 0;
          while (attempts < 5) {
            const { data: appUser } = await supabase
              .from('app_users')
              .select('*')
              .eq('auth_id', session.user.id)
              .single();

            if (appUser) {
              await get().loadUserData(session);
              break;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        return data;
      },

      registerWithCoupleCode: async (code, name, email, password) => {
        const { data: couple, error: coupleError } = await supabase
          .from('couples')
          .select('*')
          .eq('invite_code', code.toUpperCase().trim())
          .single();

        if (coupleError || !couple) {
          throw new Error('Código inválido. Verifique com seu parceiro(a).');
        }

        if (couple.partner2_id) {
          throw new Error('Este casal já tem dois membros vinculados.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: { data: { name } },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Este email já possui uma conta. Faça login.');
          }
          throw error;
        }

        const { data: appUser, error: userError } = await supabase
          .from('app_users')
          .insert({
            auth_id: data.user.id,
            email: email.toLowerCase().trim(),
            name,
            couple_id: couple.id,
            color: '#1D9E75',
            is_partner: true,
          })
          .select()
          .single();

        if (userError) throw userError;

        await supabase
          .from('couples')
          .update({ partner2_id: appUser.id })
          .eq('id', couple.id);

        // Load user data immediately so state is ready before navigate('/dashboard')
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await get().loadUserData(session);

        // Flag so RootRedirect sends Pessoa 2 to PartnerSetup
        set({ needsProfileSetup: true });

        return data;
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou senha incorretos.');
          }
          throw error;
        }

        console.log('[login] session:', data.session);
        await get().loadUserData(data.session);
        return data;
      },

      logout: async () => {
        await supabase.auth.signOut();
      },

      setCouple: (couple) => set({ couple: mapCouple(couple), isOnboarded: true }),

      setActiveUser: (user) => set({ activeUser: user }),

      updateCouple: async (data) => {
        const { couple } = get();
        if (!couple) return;

        const dbData = toDbCouple(data);

        const { error } = await supabase
          .from('couples')
          .update(dbData)
          .eq('id', couple.id);

        if (!error) set({ couple: mapCouple({ ...couple, ...data, ...dbData }) });
      },

      generateInviteCode: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'DUO-';
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      },
    }),
    {
      name: 'duo-auth',
      partialize: (state) => ({
        activeUser: state.activeUser,
        appUser: state.appUser,
        couple: state.couple,
      }),
    }
  )
);

export default useAuthStore;
