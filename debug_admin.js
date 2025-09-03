// Script de debug para verificar configuração de admin
// Execute no console do navegador quando estiver logado no sistema

console.log('🔍 Debug: Verificando configuração de admin...');

// Verificar se está no contexto correto
if (typeof supabase === 'undefined') {
  console.log('❌ Supabase não encontrado. Execute este script na página do sistema.');
} else {
  // Buscar perfil do usuário atual
  supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return;
    }
    
    if (!user) {
      console.log('❌ Usuário não logado');
      return;
    }
    
    console.log('👤 Usuário logado:', {
      id: user.id,
      email: user.email
    });
    
    // Buscar perfil completo
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data: profile, error: profileError }) => {
        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError);
          return;
        }
        
        console.log('📋 Perfil completo:', profile);
        
        const isAdmin = profile?.is_admin === true;
        const isApproved = profile?.status === 'aprovado';
        
        console.log('🔑 Status de permissões:', {
          is_admin: profile?.is_admin,
          status: profile?.status,
          hasAdminAccess: isAdmin && isApproved,
          shouldSeeAdminMenu: isAdmin
        });
        
        if (!isAdmin) {
          console.log('⚠️  PROBLEMA: Usuário não é admin');
          console.log('💡 SOLUÇÃO: Execute este comando para tornar-se admin:');
          console.log(`
            supabase
              .from('profiles')
              .update({ is_admin: true, status: 'aprovado' })
              .eq('id', '${user.id}')
              .then(console.log);
          `);
        } else if (!isApproved) {
          console.log('⚠️  PROBLEMA: Usuário admin não aprovado');
          console.log('💡 SOLUÇÃO: Execute este comando para aprovar:');
          console.log(`
            supabase
              .from('profiles')
              .update({ status: 'aprovado' })
              .eq('id', '${user.id}')
              .then(console.log);
          `);
        } else {
          console.log('✅ Usuário tem permissões de admin corretas!');
          console.log('🔄 Recarregue a página se o menu não aparecer.');
        }
      });
  });
}