import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpcomingEventsButtonProps {
  eventCount: number;
  onClick: () => void;
  hasNewEvents?: boolean;
}

const UpcomingEventsButton: React.FC<UpcomingEventsButtonProps> = ({
  eventCount,
  onClick,
  hasNewEvents = false
}) => {
  if (eventCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={onClick}
        className={cn(
          "relative h-14 px-6 rounded-full shadow-2xl transition-all duration-300",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          "text-white font-semibold",
          "hover:scale-105 hover:shadow-3xl",
          "animate-pulse-slow"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {hasNewEvents && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-none">
              Eventos Próximos
            </span>
            <span className="text-xs opacity-90 leading-none mt-0.5">
              {eventCount} evento{eventCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-white/30 font-bold min-w-[24px] h-6 flex items-center justify-center"
          >
            {eventCount}
          </Badge>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-50" />
        
        {hasNewEvents && (
          <div className="absolute -top-2 -right-2">
            <div className="relative">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-spin-slow" />
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-sm opacity-50 animate-pulse" />
            </div>
          </div>
        )}
      </Button>
      
      {/* Floating background effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl animate-pulse-slow" />
    </div>
  );
};

export default UpcomingEventsButton;