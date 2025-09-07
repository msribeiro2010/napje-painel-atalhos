import React from 'react';
import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorar se estiver em um input, textarea ou elemento editável
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcuts.map(shortcut => ({
      ...shortcut,
      displayKey: formatShortcutDisplay(shortcut)
    }))
  };
};

const formatShortcutDisplay = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.metaKey) parts.push('⌘');
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};

// Hook específico para atalhos do formulário
export const useFormKeyboardShortcuts = ({
  onSave,
  onGenerateDescription,
  onShowTemplates,
  onShowKeyboardHelp,
  onFocusResumo,
  onFocusNotas,
  enabled = true
}: {
  onSave: () => void;
  onGenerateDescription: () => void;
  onShowTemplates: () => void;
  onShowKeyboardHelp: () => void;
  onFocusResumo: () => void;
  onFocusNotas: () => void;
  enabled?: boolean;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      ctrlKey: true,
      action: onSave,
      description: 'Salvar chamado',
      category: 'Geral'
    },
    {
      key: 'g',
      ctrlKey: true,
      action: onGenerateDescription,
      description: 'Gerar descrição com IA',
      category: 'IA'
    },
    {
      key: 't',
      ctrlKey: true,
      action: onShowTemplates,
      description: 'Abrir templates',
      category: 'Templates'
    },

    {
      key: '1',
      ctrlKey: true,
      action: onFocusResumo,
      description: 'Focar no campo Resumo',
      category: 'Navegação'
    },
    {
      key: '2',
      ctrlKey: true,
      action: onFocusNotas,
      description: 'Focar no campo Notas',
      category: 'Navegação'
    },
    {
      key: '?',
      ctrlKey: true,
      action: onShowKeyboardHelp,
      description: 'Mostrar atalhos de teclado',
      category: 'Ajuda'
    }
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
};

// Componente para exibir atalhos disponíveis
interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsHelp = ({ shortcuts, open, onOpenChange }: KeyboardShortcutsHelpProps) => {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  if (!open) return null;

  const categoryIcons: Record<string, string> = {
    'Geral': '⚡',
    'IA': '🤖',
    'Templates': '📋',
    'Navegação': '🧭',
    'Ajuda': '❓'
  };

  const categoryColors: Record<string, string> = {
    'Geral': 'bg-blue-50 border-blue-200 text-blue-800',
    'IA': 'bg-purple-50 border-purple-200 text-purple-800',
    'Templates': 'bg-green-50 border-green-200 text-green-800',
    'Navegação': 'bg-amber-50 border-amber-200 text-amber-800',
    'Ajuda': 'bg-gray-50 border-gray-200 text-gray-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Atalhos de Teclado</h2>
                <p className="text-sm text-gray-600">Acelere seu trabalho com esses atalhos úteis</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(category => (
              <div key={category} className={`rounded-lg border-2 p-4 ${categoryColors[category] || categoryColors['Ajuda']}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{categoryIcons[category] || '📌'}</span>
                  <h3 className="font-semibold text-sm uppercase tracking-wider">{category}</h3>
                </div>
                <div className="space-y-2">
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-700/60 rounded-md">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {formatShortcutDisplay(shortcut).split(' + ').map((part, i, arr) => (
                            <React.Fragment key={i}>
                              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-xs font-mono font-semibold text-gray-700 dark:text-gray-200 shadow-sm">
                                {part}
                              </kbd>
                              {i < arr.length - 1 && <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Dica</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Os atalhos não funcionam quando você está digitando em campos de texto. 
                  Para usar um atalho, clique fora dos campos primeiro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};