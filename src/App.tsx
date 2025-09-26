import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import React, { Suspense, lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Calendario = lazy(() => import("./pages/Calendario"));
const CriarChamado = lazy(() => import("./pages/CriarChamado"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const ChamadosRecentes = lazy(() => import("./pages/ChamadosRecentes"));
const Atalhos = lazy(() => import("./pages/Atalhos"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminShortcuts = lazy(() => import("./pages/AdminShortcuts"));
const AdminMetrics = lazy(() => import("./pages/AdminMetrics"));
const AdminHolidays = lazy(() => import("./pages/AdminHolidays"));
const AdminSystemConfig = lazy(() => import("./pages/AdminSystemConfig"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const OrgaosJulgadores = lazy(() => import("./pages/OrgaosJulgadores"));
const ImportantMemories = lazy(() => import("./pages/ImportantMemories"));
const ConsultasPJe = lazy(() => import("./pages/ConsultasPJe"));
const ConfiguracaoPJe = lazy(() => import("./pages/ConfiguracaoPJe"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="jira-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Carregando...</div>}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendario"
                  element={
                    <ProtectedRoute>
                      <Calendario />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/criar-chamado"
                  element={
                    <ProtectedRoute>
                      <CriarChamado />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/base-conhecimento"
                  element={
                    <ProtectedRoute>
                      <KnowledgeBase />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chamados-recentes"
                  element={
                    <ProtectedRoute>
                      <ChamadosRecentes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/atalhos"
                  element={
                    <ProtectedRoute>
                      <Atalhos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/atalhos"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminShortcuts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notificacoes"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <NotificationSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/metricas"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminMetrics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/feriados"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminHolidays />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/configuracoes"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminSystemConfig />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orgaos-julgadores"
                  element={
                    <ProtectedRoute>
                      <OrgaosJulgadores />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/memorias-importantes"
                  element={
                    <ProtectedRoute>
                      <ImportantMemories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultas-pje"
                  element={
                    <ProtectedRoute>
                      <ConsultasPJe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracao-pje"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <ConfiguracaoPJe />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
