#!/usr/bin/env node

/**
 * Script para configurar automaticamente a base de dados do Supabase
 * Execute após configurar as credenciais no .env
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Credenciais do Supabase não encontradas no .env');
  console.log('\n📋 Certifique-se de que as seguintes variáveis estão configuradas:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n📖 Consulte o arquivo GUIA_CONFIGURACAO_SUPABASE.md para instruções detalhadas.');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Iniciando configuração da base de dados do Supabase...');
  console.log(`📡 Conectando a: ${supabaseUrl}`);

  try {
    // 1. Criar tabela user_custom_events
    console.log('\n📋 Criando tabela user_custom_events...');
    
    const createTableSQL = `
      -- Criar tabela user_custom_events
      CREATE TABLE IF NOT EXISTS user_custom_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          event_date DATE NOT NULL,
          event_time TIME,
          category TEXT DEFAULT 'personal',
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          is_recurring BOOLEAN DEFAULT false,
          recurrence_pattern TEXT,
          notification_enabled BOOLEAN DEFAULT true,
          notification_time INTEGER DEFAULT 60,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_user_custom_events_user_id ON user_custom_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_custom_events_date ON user_custom_events(event_date);
      CREATE INDEX IF NOT EXISTS idx_user_custom_events_category ON user_custom_events(category);

      -- Trigger para atualizar updated_at automaticamente
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_user_custom_events_updated_at
          BEFORE UPDATE ON user_custom_events
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      // Tentar método alternativo se rpc não funcionar
      console.log('⚠️  Método RPC não disponível, tentando método alternativo...');
      
      // Executar comandos individuais
      const commands = [
        `CREATE TABLE IF NOT EXISTS user_custom_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          event_date DATE NOT NULL,
          event_time TIME,
          category TEXT DEFAULT 'personal',
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          is_recurring BOOLEAN DEFAULT false,
          recurrence_pattern TEXT,
          notification_enabled BOOLEAN DEFAULT true,
          notification_time INTEGER DEFAULT 60,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      ];
      
      for (const command of commands) {
        const { error } = await supabase.from('user_custom_events').select('id').limit(1);
        if (error && error.code === 'PGRST116') {
          console.log('❌ Tabela não existe. Execute manualmente o SQL no painel do Supabase.');
          console.log('\n📖 Consulte o arquivo GUIA_CONFIGURACAO_SUPABASE.md para o SQL completo.');
          break;
        }
      }
    } else {
      console.log('✅ Tabela user_custom_events criada com sucesso!');
    }

    // 2. Configurar políticas RLS
    console.log('\n🔒 Configurando políticas RLS (Row Level Security)...');
    
    const rlsSQL = `
      -- Habilitar RLS na tabela
      ALTER TABLE user_custom_events ENABLE ROW LEVEL SECURITY;

      -- Remover políticas existentes se houver
      DROP POLICY IF EXISTS "Users can view own events" ON user_custom_events;
      DROP POLICY IF EXISTS "Users can insert own events" ON user_custom_events;
      DROP POLICY IF EXISTS "Users can update own events" ON user_custom_events;
      DROP POLICY IF EXISTS "Users can delete own events" ON user_custom_events;

      -- Política para SELECT
      CREATE POLICY "Users can view own events" ON user_custom_events
          FOR SELECT USING (auth.uid() = user_id);

      -- Política para INSERT
      CREATE POLICY "Users can insert own events" ON user_custom_events
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Política para UPDATE
      CREATE POLICY "Users can update own events" ON user_custom_events
          FOR UPDATE USING (auth.uid() = user_id);

      -- Política para DELETE
      CREATE POLICY "Users can delete own events" ON user_custom_events
          FOR DELETE USING (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.log('⚠️  Configure as políticas RLS manualmente no painel do Supabase.');
      console.log('📖 Consulte o arquivo GUIA_CONFIGURACAO_SUPABASE.md para o SQL das políticas.');
    } else {
      console.log('✅ Políticas RLS configuradas com sucesso!');
    }

    // 3. Testar a tabela
    console.log('\n🧪 Testando acesso à tabela...');
    
    const { data, error: testError } = await supabase
      .from('user_custom_events')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro ao acessar a tabela:', testError.message);
      console.log('\n💡 Possíveis soluções:');
      console.log('1. Execute o SQL manualmente no painel do Supabase');
      console.log('2. Verifique se as credenciais estão corretas');
      console.log('3. Certifique-se de que a chave service_role está sendo usada');
    } else {
      console.log('✅ Tabela acessível com sucesso!');
    }

    console.log('\n🎉 Configuração da base de dados concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Reinicie o servidor de desenvolvimento: npm run dev');
    console.log('2. Teste a funcionalidade de eventos customizados');
    console.log('3. Verifique se a autenticação está funcionando');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    console.log('\n💡 Soluções:');
    console.log('1. Verifique se as credenciais do Supabase estão corretas');
    console.log('2. Certifique-se de que o projeto Supabase está ativo');
    console.log('3. Execute o SQL manualmente no painel do Supabase');
    console.log('\n📖 Consulte o arquivo GUIA_CONFIGURACAO_SUPABASE.md para instruções detalhadas.');
    process.exit(1);
  }
}

// Executar configuração
setupDatabase();