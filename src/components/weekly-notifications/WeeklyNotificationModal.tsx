import { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  titulo: string;
  categoria?: string;
}

interface WeeklyNotificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationItem[];
  onMarkAsRead: () => void;
}

export const WeeklyNotificationModal = ({
  isOpen,
  onOpenChange,
  notifications,
  onMarkAsRead
}: WeeklyNotificationModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const currentNotification = notifications[currentIndex];
  const totalNotifications = notifications.length;
  const hasMultiple = totalNotifications > 1;

  // Auto-advance para múltiplas notificações
  useEffect(() => {
    if (!isOpen || !hasMultiple) return;

    const timer = setTimeout(() => {
      if (currentIndex < totalNotifications - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 6000); // 6 segundos por notificação

    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, totalNotifications, hasMultiple]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onMarkAsRead();
      onOpenChange(false);
      setCurrentIndex(0);
      setIsClosing(false);
    }, 300);
  };

  const handleNext = () => {
    if (currentIndex < totalNotifications - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentNotification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-hidden border-0 shadow-2xl",
          "bg-gradient-to-br from-blue-50 via-white to-purple-50",
          "dark:from-gray-900 dark:via-gray-800 dark:to-blue-900",
          "transition-all duration-300",
          isClosing && "animate-out fade-out-0 zoom-out-95"
        )}
        onEscapeKeyDown={handleClose}
      >
        {/* Header com gradiente */}
        <DialogHeader className="relative p-8 pb-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10 rounded-t-lg" />
          
          <div className="relative">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
              <Bell className="h-8 w-8 text-white" />
            </div>
            
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔔 Notificação Semanal
            </DialogTitle>
            
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              Lembrete importante para hoje
            </DialogDescription>

            {hasMultiple && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {currentIndex + 1} de {totalNotifications}
                </Badge>
                <div className="flex gap-1">
                  {Array.from({ length: totalNotifications }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentIndex 
                          ? "bg-blue-500 w-6" 
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-gray-700/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Separator className="mx-8" />

        {/* Conteúdo principal */}
        <div className="p-8 pt-6 space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:border-blue-700 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-blue-900 dark:text-blue-100">
                  {currentNotification.titulo}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      📋 <strong>Lembrete:</strong> {currentNotification.titulo}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      Verifique os procedimentos relacionados a{' '}
                      <span className="font-medium text-blue-700 dark:text-blue-300">
                        {currentNotification.categoria || 'este item'}
                      </span>
                    </p>
                  </div>
                </div>

                {currentNotification.categoria && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>Categoria:</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700">
                        {currentNotification.categoria}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Hoje, {new Date().toLocaleString('pt-BR', { 
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer com ações */}
        <div className="p-8 pt-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasMultiple && currentIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Entendi
              </Button>
              
              {hasMultiple && currentIndex < totalNotifications - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  Próximo
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                    {currentIndex + 2}/{totalNotifications}
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Concluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};