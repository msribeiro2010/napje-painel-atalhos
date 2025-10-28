// Wrapper para o cliente Supabase que suporta modo de desenvolvimento offline
import { supabase } from '@/integrations/supabase/client';

const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === 'true';

// Dados mock para desenvolvimento
const mockData = {
  profiles: [
    {
      id: 'dev-user-1',
      email: 'dev@example.com',
      nome_completo: 'Usuário de Desenvolvimento',
      is_admin: true,
      status: 'aprovado',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  user_custom_events: [
    {
      id: 'event-1',
      user_id: 'dev-user-1',
      title: 'Reunião de Desenvolvimento',
      description: 'Reunião para discutir o projeto',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '10:00',
      category: 'meeting',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  feriados: [
    {
      id: 'holiday-1',
      nome: 'Dia do Desenvolvedor',
      data: '2024-09-13',
      tipo: 'nacional',
      created_at: new Date().toISOString()
    }
  ]
};

// Mock do usuário autenticado
const mockUser = {
  id: 'dev-user-1',
  email: 'dev@example.com',
  user_metadata: {
    nome_completo: 'Usuário de Desenvolvimento'
  }
};

// Wrapper que intercepta chamadas do Supabase em modo de desenvolvimento
export const createDevSupabaseClient = () => {
  if (!isDevelopmentMode || !isOfflineMode) {
    return supabase;
  }

  console.log('🔧 Modo de desenvolvimento offline ativado');

  // Mock das principais funções do Supabase
  return {
    ...supabase,
    
    auth: {
      ...supabase.auth,
      getUser: async () => ({
        data: { user: mockUser },
        error: null
      }),
      getSession: async () => ({
        data: { session: { user: mockUser } },
        error: null
      }),
      onAuthStateChange: (callback: any) => {
        // Simula usuário logado imediatamente
        setTimeout(() => {
          callback('SIGNED_IN', { user: mockUser });
        }, 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },

    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const data = mockData[table as keyof typeof mockData];
            if (Array.isArray(data)) {
              const item = data.find((item: any) => item[column] === value);
              return { data: item || null, error: null };
            }
            return { data: null, error: null };
          },
          limit: (count: number) => ({
            then: async (callback: any) => {
              const data = mockData[table as keyof typeof mockData] || [];
              return callback({ data: Array.isArray(data) ? data.slice(0, count) : [], error: null });
            }
          })
        }),
        limit: (count: number) => ({
          then: async (callback: any) => {
            const data = mockData[table as keyof typeof mockData] || [];
            return callback({ data: Array.isArray(data) ? data.slice(0, count) : [], error: null });
          }
        }),
        order: (column: string, options?: any) => ({
          then: async (callback: any) => {
            const data = mockData[table as keyof typeof mockData] || [];
            return callback({ data: Array.isArray(data) ? data : [], error: null });
          }
        }),
        then: async (callback: any) => {
          const data = mockData[table as keyof typeof mockData] || [];
          return callback({ data: Array.isArray(data) ? data : [], error: null });
        }
      }),
      insert: (data: any) => ({
        select: () => ({
          then: async (callback: any) => {
            console.log(`🔧 Mock insert em ${table}:`, data);
            return callback({ data: [{ ...data, id: `mock-${Date.now()}` }], error: null });
          }
        }),
        then: async (callback: any) => {
          console.log(`🔧 Mock insert em ${table}:`, data);
          return callback({ data: [{ ...data, id: `mock-${Date.now()}` }], error: null });
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => {
            console.log(`🔧 Mock update em ${table}:`, data);
            return callback({ data: [{ ...data, id: value }], error: null });
          }
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => {
            console.log(`🔧 Mock delete em ${table} onde ${column} = ${value}`);
            return callback({ data: [], error: null });
          }
        })
      })
    })
  };
};

export const devSupabase = createDevSupabaseClient();