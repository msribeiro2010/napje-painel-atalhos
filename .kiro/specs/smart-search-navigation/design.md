# Design Document

## Overview

O sistema de navegação da busca inteligente precisa ser redesenhado para fornecer navegação específica e contextual para cada tipo de resultado. Atualmente, a busca encontra os resultados corretos, mas a navegação é genérica, levando apenas para páginas de listagem ao invés dos itens específicos.

## Architecture

### Current Architecture Issues
- `handleSearchResult` no Dashboard navega apenas para páginas genéricas
- Não há passagem de IDs específicos ou contexto de busca
- Falta de tratamento diferenciado por tipo de resultado
- Ausência de destacamento do termo pesquisado no destino

### Proposed Architecture
```
SmartSearchDialog
    ↓ (result with ID and metadata)
handleSearchResult (Dashboard)
    ↓ (enhanced navigation with context)
Specific Pages (with search context)
    ↓ (highlight search terms)
User sees specific content
```

## Components and Interfaces

### 1. Enhanced SearchResult Interface
```typescript
interface SearchResult {
  id: string;
  type: 'chamado' | 'conhecimento' | 'atalho' | 'usuario';
  title: string;
  description: string;
  url?: string;
  score: number;
  metadata?: {
    // Existing metadata
    status?: string;
    categoria?: string;
    criado_por?: string;
    data_criacao?: string;
    tags?: string[];
    
    // New navigation metadata
    specificId?: string;        // ID específico do item
    searchTerm?: string;        // Termo que gerou o resultado
    highlightText?: string;     // Texto a ser destacado
    directUrl?: string;         // URL direta para o item
  };
}
```

### 2. Navigation Handler Enhancement
```typescript
interface NavigationContext {
  searchTerm: string;
  resultType: string;
  itemId: string;
  highlightText?: string;
}

const handleSearchResult = (result: SearchResult, searchTerm: string) => {
  const context: NavigationContext = {
    searchTerm,
    resultType: result.type,
    itemId: result.id,
    highlightText: result.metadata?.highlightText
  };
  
  navigateToSpecificResult(result, context);
};
```

### 3. Specific Navigation Functions
```typescript
// Para chamados
const navigateToChamado = (result: SearchResult, context: NavigationContext) => {
  navigate(`/chamado/${result.id}?search=${encodeURIComponent(context.searchTerm)}&highlight=${encodeURIComponent(context.highlightText || '')}`);
};

// Para base de conhecimento
const navigateToKnowledge = (result: SearchResult, context: NavigationContext) => {
  navigate(`/base-conhecimento/${result.id}?search=${encodeURIComponent(context.searchTerm)}`);
};

// Para atalhos
const navigateToAtalho = (result: SearchResult, context: NavigationContext) => {
  if (result.url) {
    window.open(result.url, '_blank');
  } else {
    navigate(`/atalhos?search=${encodeURIComponent(context.searchTerm)}`);
  }
};
```

## Data Models

### 1. Enhanced Search Data Structure
```typescript
// Modificar getExampleChamados para incluir IDs reais
const getExampleChamados = (query: string): SearchResult[] => {
  return filteredChamados.map((chamado, index) => ({
    id: chamado.id,  // ID real do chamado
    type: 'chamado' as const,
    title: chamado.assunto,
    description: chamado.descricao,
    score: calculateScore(query, chamado),
    metadata: {
      status: chamado.status,
      categoria: chamado.categoria,
      criado_por: chamado.usuario_criador_nome,
      data_criacao: chamado.created_at,
      specificId: chamado.id,           // ID específico
      searchTerm: query,                // Termo pesquisado
      highlightText: extractHighlight(query, chamado), // Texto a destacar
      directUrl: `/chamado/${chamado.id}` // URL direta
    }
  }));
};
```

### 2. Search Context Preservation
```typescript
interface SearchContext {
  originalQuery: string;
  timestamp: string;
  resultCount: number;
  selectedResult?: SearchResult;
}

// Armazenar contexto no sessionStorage
const preserveSearchContext = (context: SearchContext) => {
  sessionStorage.setItem('smartSearchContext', JSON.stringify(context));
};
```

## Error Handling

### 1. Navigation Error Handling
```typescript
const safeNavigateToResult = async (result: SearchResult, context: NavigationContext) => {
  try {
    // Verificar se o item ainda existe
    const exists = await verifyItemExists(result.type, result.id);
    
    if (!exists) {
      toast({
        title: "Item não encontrado",
        description: "Este item pode ter sido removido ou não está mais disponível.",
        variant: "destructive"
      });
      return;
    }
    
    // Navegar para o item específico
    await navigateToSpecificResult(result, context);
    
  } catch (error) {
    console.error('Erro na navegação:', error);
    
    // Fallback para navegação genérica
    toast({
      title: "Erro na navegação",
      description: "Redirecionando para a lista geral...",
      variant: "destructive"
    });
    
    navigateToGenericPage(result.type, context.searchTerm);
  }
};
```

### 2. Item Verification
```typescript
const verifyItemExists = async (type: string, id: string): Promise<boolean> => {
  try {
    switch (type) {
      case 'chamado':
        const { data } = await supabase
          .from('chamados')
          .select('id')
          .eq('id', id)
          .single();
        return !!data;
        
      case 'conhecimento':
        // Similar verification for knowledge base
        return true; // Placeholder
        
      default:
        return true;
    }
  } catch {
    return false;
  }
};
```

## Testing Strategy

### 1. Unit Tests
- Test navigation functions for each result type
- Test error handling scenarios
- Test search context preservation
- Test URL parameter handling

### 2. Integration Tests
- Test complete search-to-navigation flow
- Test search term highlighting in destination pages
- Test back navigation maintaining search context
- Test error scenarios (deleted items, network errors)

### 3. User Acceptance Tests
- User searches for "Perito" and clicks on specific chamado
- System opens that specific chamado with "Perito" highlighted
- User can navigate back to search results
- Error handling works when items are deleted

## Implementation Phases

### Phase 1: Core Navigation Enhancement
- Enhance SearchResult interface with navigation metadata
- Implement specific navigation functions for each result type
- Add error handling and item verification

### Phase 2: Search Context Preservation
- Implement search context storage
- Add URL parameters for search terms
- Implement back navigation with preserved context

### Phase 3: Visual Enhancements
- Add search term highlighting in destination pages
- Improve error messages and user feedback
- Add loading states during navigation

### Phase 4: Advanced Features
- Add search analytics and usage tracking
- Implement smart suggestions based on navigation patterns
- Add keyboard shortcuts for common navigation actions