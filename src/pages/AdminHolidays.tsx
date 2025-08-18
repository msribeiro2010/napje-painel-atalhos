import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Database, Sparkles, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HolidayUploadManager } from '@/components/admin/HolidayUploadManager';
import { VacationSuggestionsPanel } from '@/components/VacationSuggestionsPanel';
import { ImportFeriados2025 } from '@/components/admin/ImportFeriados2025';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminHolidays = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Administração de Feriados"
          subtitle="Gerencie feriados e visualize sugestões de férias inteligentes"
        />
        
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Tabs defaultValue="import2025" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="import2025" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Feriados 2025
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Gerenciar Feriados
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Sugestões de IA
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visualização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import2025">
            <ImportFeriados2025 />
          </TabsContent>

          <TabsContent value="upload">
            <HolidayUploadManager />
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VacationSuggestionsPanel year={new Date().getFullYear()} />
              <VacationSuggestionsPanel year={new Date().getFullYear() + 1} />
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Visualização de Calendário
              </h3>
              <p className="text-gray-600 mb-4">
                Acesse o calendário principal para ver os feriados aplicados
              </p>
              <Button onClick={() => navigate('/calendario')}>
                <Calendar className="h-4 w-4 mr-2" />
                Ir para Calendário
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminHolidays;
