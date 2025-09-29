import React, { useEffect } from 'react';
import { usePJeSearch } from '@/hooks/usePJeSearch';

const TestPJeSearch: React.FC = () => {
  const { searchServidores, loading, error } = usePJeSearch();

  useEffect(() => {
    // Automatically trigger search when component mounts
    const testSearch = async () => {
      console.log('🧪 TESTE AUTOMATICO INICIADO - Buscando servidores...');
      try {
        const results = await searchServidores('1', { nome: 'TESTE_AUTOMATICO_DEBUG' });
        console.log('✅ TESTE AUTOMATICO CONCLUIDO:', results.length, 'resultados');
      } catch (err) {
        console.error('❌ TESTE AUTOMATICO FALHOU:', err);
      }
    };

    // Wait a bit for the component to fully mount
    setTimeout(testSearch, 1000);
  }, [searchServidores]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste PJe Search</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {loading ? 'Carregando...' : 'Pronto'}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>Este teste irá automaticamente executar uma busca por servidores.</p>
          <p>Abra o console do navegador (F12) para ver os logs detalhados.</p>
        </div>
      </div>
    </div>
  );
};

export default TestPJeSearch;