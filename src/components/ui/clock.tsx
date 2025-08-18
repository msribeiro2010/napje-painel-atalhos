import { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

export const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <ClockIcon className="h-4 w-4 text-primary" />
      <div className="font-mono font-bold text-lg text-primary">
        {formatTime(time)}
      </div>
    </div>
  );
};