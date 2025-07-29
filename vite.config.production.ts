import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer para otimização
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Otimizações específicas para produção
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Desabilitar sourcemaps em produção para reduzir tamanho
    minify: 'terser',
    
    // Configurações avançadas de otimização
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Configuração de chunks para otimizar carregamento
    rollupOptions: {
      output: {
        // Estratégia de chunking automática
        manualChunks(id) {
          // Vendors principais
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
          
          // Funcionalidades IA
          if (id.includes('useSmartSearch') || 
              id.includes('useAIInsights') || 
              id.includes('useSmartFormFill') || 
              id.includes('useSmartNotifications') ||
              id.includes('SmartSearchDialog') ||
              id.includes('AIInsightsPanel')) {
            return 'ai-features';
          }
        },
        
        // Nomenclatura dos arquivos
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') 
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(assetInfo.name || '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[ext]/[name]-[hash][extname]';
        },
      },
      
      // Configurações de otimização externa
      external: [],
    },
    
    // Configurações de otimização de assets
    assetsInlineLimit: 4096, // 4KB - inline small assets
    cssCodeSplit: true,
    
    // Configurações de compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // 1MB warning limit
  },
  
  // Configurações de servidor para desenvolvimento
  server: {
    port: 5173,
    host: true,
    open: false,
  },
  
  // Configurações de preview
  preview: {
    port: 4173,
    host: true,
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      // Excluir dependências que podem causar problemas
    ],
  },
  
  // Configurações de ambiente
  define: {
    // Variáveis de build
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_COMMIT__: JSON.stringify(process.env.VITE_COMMIT_HASH || 'unknown'),
    __AI_FEATURES_ENABLED__: JSON.stringify(process.env.VITE_AI_FEATURES_ENABLED === 'true'),
  },
  
  // Configurações de CSS
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
    postcss: {
      plugins: [
        // PostCSS plugins serão carregados do postcss.config.js
      ],
    },
  },
  
  // Configurações de performance
  esbuild: {
    // Configurações do esbuild para produção
    legalComments: 'none',
    target: 'es2020',
    // Remove console.log em produção
    pure: ['console.log', 'console.info', 'console.debug'],
  },
  
  // Configurações experimentais
  experimental: {
    // Funcionalidades experimentais do Vite
  },
});