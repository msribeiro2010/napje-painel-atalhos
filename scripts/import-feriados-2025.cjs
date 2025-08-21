#!/usr/bin/env node

/**
 * Script para importar feriados de 2025 do arquivo JSON para o banco Supabase
 * 
 * Uso: node scripts/import-feriados-2025.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
  console.error('Configure as variáveis no arquivo .env ou .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importarFeriados() {
  try {
    console.log('🚀 Iniciando importação de feriados de 2025...');
    
    // Ler arquivo JSON
    const feriadosPath = path.join(__dirname, '..', 'feriados_2025.json');
    
    if (!fs.existsSync(feriadosPath)) {
      console.error('❌ Arquivo feriados_2025.json não encontrado');
      process.exit(1);
    }
    
    const feriadosData = JSON.parse(fs.readFileSync(feriadosPath, 'utf8'));
    const feriados = feriadosData.feriados;
    
    console.log(`📅 Encontrados ${feriados.length} feriados para importar`);
    
    // Verificar se já existem feriados de 2025
    const { data: feriadosExistentes, error: errorCheck } = await supabase
      .from('feriados')
      .select('data')
      .gte('data', '2025-01-01')
      .lte('data', '2025-12-31');
    
    if (errorCheck) {
      console.error('❌ Erro ao verificar feriados existentes:', errorCheck);
      process.exit(1);
    }
    
    if (feriadosExistentes && feriadosExistentes.length > 0) {
      console.log(`⚠️  Encontrados ${feriadosExistentes.length} feriados de 2025 já cadastrados`);
      console.log('Deseja continuar e sobrescrever? (y/N)');
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const resposta = await new Promise(resolve => {
        rl.question('', (answer) => {
          rl.close();
          resolve(answer.toLowerCase());
        });
      });
      
      if (resposta !== 'y' && resposta !== 'yes') {
        console.log('❌ Importação cancelada pelo usuário');
        process.exit(0);
      }
      
      // Remover feriados existentes de 2025
      console.log('🗑️  Removendo feriados existentes de 2025...');
      const { error: errorDelete } = await supabase
        .from('feriados')
        .delete()
        .gte('data', '2025-01-01')
        .lte('data', '2025-12-31');
      
      if (errorDelete) {
        console.error('❌ Erro ao remover feriados existentes:', errorDelete);
        process.exit(1);
      }
    }
    
    // Inserir novos feriados
    console.log('📝 Inserindo feriados...');
    
    const { data, error } = await supabase
      .from('feriados')
      .insert(feriados)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir feriados:', error);
      process.exit(1);
    }
    
    console.log(`✅ Sucesso! ${data.length} feriados importados com sucesso`);
    
    // Mostrar resumo
    console.log('\n📊 Resumo dos feriados importados:');
    data.forEach(feriado => {
      const data = new Date(feriado.data).toLocaleDateString('pt-BR');
      console.log(`  • ${data} - ${feriado.descricao} (${feriado.tipo})`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    process.exit(1);
  }
}

// Executar importação
importarFeriados();