// Script para testar a funcionalidade de distribuição no console do navegador
// Execute este script na página http://localhost:8082/consultas-pje

console.log('🔍 Iniciando teste da funcionalidade de distribuição...');

// Função para aguardar elemento aparecer
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
    }, timeout);
  });
}

// Função para simular clique
function simulateClick(element) {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
}

// Função para simular mudança de valor
function simulateChange(element, value) {
  element.value = value;
  const event = new Event('change', { bubbles: true });
  element.dispatchEvent(event);
  
  // Também disparar input event para React
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);
}

async function testDistribuicao() {
  try {
    console.log('📍 Verificando se estamos na página correta...');
    if (!window.location.href.includes('/consultas-pje')) {
      console.error('❌ Não estamos na página de consultas PJe');
      return;
    }

    console.log('✅ Página correta detectada');

    // Aguardar a seção de distribuição carregar
    console.log('⏳ Aguardando seção de distribuição...');
    await waitForElement('[data-testid="distribuicao-section"], .distribuicao-section, h3:contains("Distribuição")', 10000);
    
    console.log('✅ Seção de distribuição encontrada');

    // Procurar pelo select de grau
    console.log('🔍 Procurando campo de grau...');
    let grauSelect = document.querySelector('select[name*="grau"], select[id*="grau"], select:has(option[value="1"]):has(option[value="2"])');
    
    if (!grauSelect) {
      // Tentar encontrar por texto próximo
      const labels = Array.from(document.querySelectorAll('label, span, div')).filter(el => 
        el.textContent.toLowerCase().includes('grau') || 
        el.textContent.toLowerCase().includes('jurisdição')
      );
      
      for (let label of labels) {
        const select = label.querySelector('select') || 
                      label.nextElementSibling?.querySelector('select') ||
                      label.parentElement?.querySelector('select');
        if (select) {
          grauSelect = select;
          break;
        }
      }
    }

    if (grauSelect) {
      console.log('✅ Campo de grau encontrado:', grauSelect);
      console.log('📝 Selecionando 1º Grau...');
      simulateChange(grauSelect, '1');
      console.log('✅ 1º Grau selecionado');
    } else {
      console.warn('⚠️ Campo de grau não encontrado');
    }

    // Procurar pelo campo de data
    console.log('🔍 Procurando campo de data...');
    let dataInput = document.querySelector('input[type="date"], input[name*="data"], input[id*="data"], input[placeholder*="data"]');
    
    if (!dataInput) {
      // Tentar encontrar por texto próximo
      const labels = Array.from(document.querySelectorAll('label, span, div')).filter(el => 
        el.textContent.toLowerCase().includes('data') && 
        el.textContent.toLowerCase().includes('distribuição')
      );
      
      for (let label of labels) {
        const input = label.querySelector('input') || 
                     label.nextElementSibling?.querySelector('input') ||
                     label.parentElement?.querySelector('input');
        if (input) {
          dataInput = input;
          break;
        }
      }
    }

    if (dataInput) {
      console.log('✅ Campo de data encontrado:', dataInput);
      console.log('📝 Preenchendo data...');
      
      // Tentar diferentes formatos de data
      const dataValue = dataInput.type === 'date' ? '2025-09-28' : '28/09/2025';
      simulateChange(dataInput, dataValue);
      console.log('✅ Data preenchida:', dataValue);
    } else {
      console.warn('⚠️ Campo de data não encontrado');
    }

    // Procurar pelo botão de buscar distribuição
    console.log('🔍 Procurando botão de buscar distribuição...');
    let buscarBtn = document.querySelector('button:contains("BUSCAR DISTRIBUIÇÃO"), button:contains("Buscar Distribuição"), button[data-testid*="distribuicao"]');
    
    if (!buscarBtn) {
      // Procurar por texto
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.toLowerCase().includes('buscar') && 
        btn.textContent.toLowerCase().includes('distribuição')
      );
      if (buttons.length > 0) {
        buscarBtn = buttons[0];
      }
    }

    if (buscarBtn) {
      console.log('✅ Botão encontrado:', buscarBtn);
      console.log('🖱️ Clicando no botão...');
      
      // Verificar se o botão está habilitado
      if (buscarBtn.disabled) {
        console.warn('⚠️ Botão está desabilitado');
      } else {
        simulateClick(buscarBtn);
        console.log('✅ Botão clicado');
        
        // Aguardar resposta
        console.log('⏳ Aguardando resposta...');
        
        // Monitorar por mudanças na página ou mensagens
        setTimeout(() => {
          // Verificar por mensagens de toast/notificação
          const toasts = document.querySelectorAll('[role="alert"], .toast, .notification, .alert');
          if (toasts.length > 0) {
            console.log('📢 Mensagens encontradas:');
            toasts.forEach((toast, index) => {
              console.log(`  ${index + 1}. ${toast.textContent.trim()}`);
            });
          }
          
          // Verificar por dados de distribuição na página
          const distribuicaoData = document.querySelector('[data-testid*="distribuicao-result"], .distribuicao-result, .distribution-data');
          if (distribuicaoData) {
            console.log('📊 Dados de distribuição encontrados:', distribuicaoData.textContent.trim());
          }
          
          // Verificar console do navegador por erros
          console.log('🔍 Verificando console por erros...');
          
        }, 3000);
      }
    } else {
      console.error('❌ Botão de buscar distribuição não encontrado');
    }

    console.log('✅ Teste concluído');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testDistribuicao();

// Também disponibilizar as funções para uso manual
window.testDistribuicao = testDistribuicao;
window.waitForElement = waitForElement;

console.log('📋 Script carregado. Execute testDistribuicao() para testar novamente.');