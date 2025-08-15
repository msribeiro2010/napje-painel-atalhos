// vite.config.production.ts
import { defineConfig } from "file:///Users/marceloribeiro/Desktop/MESA-ICLOUD/PROJETOS_EM_ANDAMENTO/napje-painel-atalhos/node_modules/vite/dist/node/index.js";
import react from "file:///Users/marceloribeiro/Desktop/MESA-ICLOUD/PROJETOS_EM_ANDAMENTO/napje-painel-atalhos/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { visualizer } from "file:///Users/marceloribeiro/Desktop/MESA-ICLOUD/PROJETOS_EM_ANDAMENTO/napje-painel-atalhos/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/Users/marceloribeiro/Desktop/MESA-ICLOUD/PROJETOS_EM_ANDAMENTO/napje-painel-atalhos";
var vite_config_production_default = defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/napje-painel-atalhos/" : "/",
  plugins: [
    react(),
    // Bundle analyzer para otimização
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Otimizações específicas para produção
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    // Desabilitar sourcemaps em produção para reduzir tamanho
    minify: "terser",
    // Configurações avançadas de otimização
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug", "console.warn"]
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Configuração de chunks para otimizar carregamento
    rollupOptions: {
      output: {
        // Estratégia de chunking automática
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            return "vendor";
          }
          if (id.includes("useSmartSearch") || id.includes("useAIInsights") || id.includes("useSmartFormFill") || id.includes("useSmartNotifications") || id.includes("SmartSearchDialog") || id.includes("AIInsightsPanel")) {
            return "ai-features";
          }
        },
        // Nomenclatura dos arquivos
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split("/").pop()?.replace(".tsx", "").replace(".ts", "") : "chunk";
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if (/\.css$/i.test(assetInfo.name || "")) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash][extname]";
        }
      },
      // Configurações de otimização externa
      external: []
    },
    // Configurações de otimização de assets
    assetsInlineLimit: 4096,
    // 4KB - inline small assets
    cssCodeSplit: true,
    // Configurações de compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1e3
    // 1MB warning limit
  },
  // Configurações de servidor para desenvolvimento
  server: {
    port: 5173,
    host: true,
    open: false
  },
  // Configurações de preview
  preview: {
    port: 4173,
    host: true
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@supabase/supabase-js",
      "lucide-react",
      "date-fns",
      "clsx",
      "tailwind-merge"
    ],
    exclude: [
      // Excluir dependências que podem causar problemas
    ]
  },
  // Configurações de ambiente
  define: {
    // Variáveis de build
    __BUILD_TIME__: JSON.stringify((/* @__PURE__ */ new Date()).toISOString()),
    __GIT_COMMIT__: JSON.stringify(process.env.VITE_COMMIT_HASH || "unknown"),
    __AI_FEATURES_ENABLED__: JSON.stringify(process.env.VITE_AI_FEATURES_ENABLED === "true")
  },
  // Configurações de CSS
  css: {
    modules: {
      localsConvention: "camelCase"
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    postcss: {
      plugins: [
        // PostCSS plugins serão carregados do postcss.config.js
      ]
    }
  },
  // Configurações de performance
  esbuild: {
    // Configurações do esbuild para produção
    legalComments: "none",
    target: "es2020",
    // Remove console.log em produção
    pure: ["console.log", "console.info", "console.debug"]
  },
  // Configurações experimentais
  experimental: {
    // Funcionalidades experimentais do Vite
  }
});
export {
  vite_config_production_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcucHJvZHVjdGlvbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9tYXJjZWxvcmliZWlyby9EZXNrdG9wL01FU0EtSUNMT1VEL1BST0pFVE9TX0VNX0FOREFNRU5UTy9uYXBqZS1wYWluZWwtYXRhbGhvc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hcmNlbG9yaWJlaXJvL0Rlc2t0b3AvTUVTQS1JQ0xPVUQvUFJPSkVUT1NfRU1fQU5EQU1FTlRPL25hcGplLXBhaW5lbC1hdGFsaG9zL3ZpdGUuY29uZmlnLnByb2R1Y3Rpb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hcmNlbG9yaWJlaXJvL0Rlc2t0b3AvTUVTQS1JQ0xPVUQvUFJPSkVUT1NfRU1fQU5EQU1FTlRPL25hcGplLXBhaW5lbC1hdGFsaG9zL3ZpdGUuY29uZmlnLnByb2R1Y3Rpb24udHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiBwcm9jZXNzLmVudi5HSVRIVUJfQUNUSU9OUyA/ICcvbmFwamUtcGFpbmVsLWF0YWxob3MvJyA6ICcvJyxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gQnVuZGxlIGFuYWx5emVyIHBhcmEgb3RpbWl6YVx1MDBFN1x1MDBFM29cbiAgICB2aXN1YWxpemVyKHtcbiAgICAgIGZpbGVuYW1lOiAnZGlzdC9zdGF0cy5odG1sJyxcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIFxuICAvLyBPdGltaXphXHUwMEU3XHUwMEY1ZXMgZXNwZWNcdTAwRURmaWNhcyBwYXJhIHByb2R1XHUwMEU3XHUwMEUzb1xuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBEZXNhYmlsaXRhciBzb3VyY2VtYXBzIGVtIHByb2R1XHUwMEU3XHUwMEUzbyBwYXJhIHJlZHV6aXIgdGFtYW5ob1xuICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgXG4gICAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEY1ZXMgYXZhblx1MDBFN2FkYXMgZGUgb3RpbWl6YVx1MDBFN1x1MDBFM29cbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsIC8vIFJlbW92ZSBjb25zb2xlLmxvZyBlbSBwcm9kdVx1MDBFN1x1MDBFM29cbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgICAgcHVyZV9mdW5jczogWydjb25zb2xlLmxvZycsICdjb25zb2xlLmluZm8nLCAnY29uc29sZS5kZWJ1ZycsICdjb25zb2xlLndhcm4nXSxcbiAgICAgIH0sXG4gICAgICBtYW5nbGU6IHtcbiAgICAgICAgc2FmYXJpMTA6IHRydWUsXG4gICAgICB9LFxuICAgICAgZm9ybWF0OiB7XG4gICAgICAgIGNvbW1lbnRzOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBcbiAgICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRTNvIGRlIGNodW5rcyBwYXJhIG90aW1pemFyIGNhcnJlZ2FtZW50b1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBFc3RyYXRcdTAwRTlnaWEgZGUgY2h1bmtpbmcgYXV0b21cdTAwRTF0aWNhXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIC8vIFZlbmRvcnMgcHJpbmNpcGFpc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcmVhY3QnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAdGFuc3RhY2svcmVhY3QtcXVlcnknKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1xdWVyeSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0LXJvdXRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJvdXRlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BzdXBhYmFzZScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXN1cGFiYXNlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbHVjaWRlLXJlYWN0JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItaWNvbnMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBGdW5jaW9uYWxpZGFkZXMgSUFcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3VzZVNtYXJ0U2VhcmNoJykgfHwgXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCd1c2VBSUluc2lnaHRzJykgfHwgXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCd1c2VTbWFydEZvcm1GaWxsJykgfHwgXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCd1c2VTbWFydE5vdGlmaWNhdGlvbnMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnU21hcnRTZWFyY2hEaWFsb2cnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnQUlJbnNpZ2h0c1BhbmVsJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnYWktZmVhdHVyZXMnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIE5vbWVuY2xhdHVyYSBkb3MgYXJxdWl2b3NcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBmYWNhZGVNb2R1bGVJZCA9IGNodW5rSW5mby5mYWNhZGVNb2R1bGVJZCBcbiAgICAgICAgICAgID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy50c3gnLCAnJykucmVwbGFjZSgnLnRzJywgJycpIFxuICAgICAgICAgICAgOiAnY2h1bmsnO1xuICAgICAgICAgIHJldHVybiBgYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanNgO1xuICAgICAgICB9LFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWU/LnNwbGl0KCcuJykgfHwgW107XG4gICAgICAgICAgY29uc3QgZXh0ID0gaW5mb1tpbmZvLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICgvXFwuKHBuZ3xqcGU/Z3xnaWZ8c3ZnfHdlYnB8YXZpZikkL2kudGVzdChhc3NldEluZm8ubmFtZSB8fCAnJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKC9cXC4od29mZjI/fGVvdHx0dGZ8b3RmKSQvaS50ZXN0KGFzc2V0SW5mby5uYW1lIHx8ICcnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvZm9udHMvW25hbWVdLVtoYXNoXVtleHRuYW1lXSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgvXFwuY3NzJC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUgfHwgJycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9jc3MvW25hbWVdLVtoYXNoXVtleHRuYW1lXSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tleHRdL1tuYW1lXS1baGFzaF1bZXh0bmFtZV0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIFxuICAgICAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEY1ZXMgZGUgb3RpbWl6YVx1MDBFN1x1MDBFM28gZXh0ZXJuYVxuICAgICAgZXh0ZXJuYWw6IFtdLFxuICAgIH0sXG4gICAgXG4gICAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEY1ZXMgZGUgb3RpbWl6YVx1MDBFN1x1MDBFM28gZGUgYXNzZXRzXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsIC8vIDRLQiAtIGlubGluZSBzbWFsbCBhc3NldHNcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgXG4gICAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEY1ZXMgZGUgY29tcHJlc3Npb25cbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsIC8vIDFNQiB3YXJuaW5nIGxpbWl0XG4gIH0sXG4gIFxuICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRjVlcyBkZSBzZXJ2aWRvciBwYXJhIGRlc2Vudm9sdmltZW50b1xuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3BlbjogZmFsc2UsXG4gIH0sXG4gIFxuICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRjVlcyBkZSBwcmV2aWV3XG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICAgIGhvc3Q6IHRydWUsXG4gIH0sXG4gIFxuICAvLyBPdGltaXphXHUwMEU3XHUwMEY1ZXMgZGUgZGVwZW5kXHUwMEVBbmNpYXNcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3JlYWN0JyxcbiAgICAgICdyZWFjdC1kb20nLFxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxuICAgICAgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsXG4gICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJyxcbiAgICAgICdsdWNpZGUtcmVhY3QnLFxuICAgICAgJ2RhdGUtZm5zJyxcbiAgICAgICdjbHN4JyxcbiAgICAgICd0YWlsd2luZC1tZXJnZSdcbiAgICBdLFxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgIC8vIEV4Y2x1aXIgZGVwZW5kXHUwMEVBbmNpYXMgcXVlIHBvZGVtIGNhdXNhciBwcm9ibGVtYXNcbiAgICBdLFxuICB9LFxuICBcbiAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEY1ZXMgZGUgYW1iaWVudGVcbiAgZGVmaW5lOiB7XG4gICAgLy8gVmFyaVx1MDBFMXZlaXMgZGUgYnVpbGRcbiAgICBfX0JVSUxEX1RJTUVfXzogSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKS50b0lTT1N0cmluZygpKSxcbiAgICBfX0dJVF9DT01NSVRfXzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuVklURV9DT01NSVRfSEFTSCB8fCAndW5rbm93bicpLFxuICAgIF9fQUlfRkVBVFVSRVNfRU5BQkxFRF9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5WSVRFX0FJX0ZFQVRVUkVTX0VOQUJMRUQgPT09ICd0cnVlJyksXG4gIH0sXG4gIFxuICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRjVlcyBkZSBDU1NcbiAgY3NzOiB7XG4gICAgbW9kdWxlczoge1xuICAgICAgbG9jYWxzQ29udmVudGlvbjogJ2NhbWVsQ2FzZScsXG4gICAgfSxcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQGltcG9ydCBcIkAvc3R5bGVzL3ZhcmlhYmxlcy5zY3NzXCI7YCxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIC8vIFBvc3RDU1MgcGx1Z2lucyBzZXJcdTAwRTNvIGNhcnJlZ2Fkb3MgZG8gcG9zdGNzcy5jb25maWcuanNcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbiAgXG4gIC8vIENvbmZpZ3VyYVx1MDBFN1x1MDBGNWVzIGRlIHBlcmZvcm1hbmNlXG4gIGVzYnVpbGQ6IHtcbiAgICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRjVlcyBkbyBlc2J1aWxkIHBhcmEgcHJvZHVcdTAwRTdcdTAwRTNvXG4gICAgbGVnYWxDb21tZW50czogJ25vbmUnLFxuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgLy8gUmVtb3ZlIGNvbnNvbGUubG9nIGVtIHByb2R1XHUwMEU3XHUwMEUzb1xuICAgIHB1cmU6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJywgJ2NvbnNvbGUuZGVidWcnXSxcbiAgfSxcbiAgXG4gIC8vIENvbmZpZ3VyYVx1MDBFN1x1MDBGNWVzIGV4cGVyaW1lbnRhaXNcbiAgZXhwZXJpbWVudGFsOiB7XG4gICAgLy8gRnVuY2lvbmFsaWRhZGVzIGV4cGVyaW1l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
