import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CriarChamado from "./pages/CriarChamado";
import KnowledgeBase from "./pages/KnowledgeBase";
import ChamadosRecentes from "./pages/ChamadosRecentes";
import Atalhos from "./pages/Atalhos";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminShortcuts from "./pages/AdminShortcuts";
import OrgaosJulgadores from "./pages/OrgaosJulgadores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="jira-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/criar-chamado" element={
              <ProtectedRoute>
                <CriarChamado />
              </ProtectedRoute>
            } />
            <Route path="/base-conhecimento" element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            } />
             <Route path="/chamados-recentes" element={
               <ProtectedRoute>
                 <ChamadosRecentes />
               </ProtectedRoute>
              } />
              <Route path="/atalhos" element={
                <ProtectedRoute>
                  <Atalhos />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
               <ProtectedRoute>
                 <Profile />
               </ProtectedRoute>
             } />
             <Route path="/admin/usuarios" element={
               <ProtectedRoute requireAdmin={true}>
                 <AdminUsers />
               </ProtectedRoute>
             } />
             <Route path="/admin/atalhos" element={
               <ProtectedRoute requireAdmin={true}>
                 <AdminShortcuts />
               </ProtectedRoute>
             } />
             <Route path="/orgaos-julgadores" element={
               <ProtectedRoute>
                 <OrgaosJulgadores />
               </ProtectedRoute>
             } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
