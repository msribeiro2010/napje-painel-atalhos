import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Home, Umbrella, Laptop, ArrowLeft } from 'lucide-react';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

const calendarLabels = {
  presencial: { label: 'Presencial', color: '#f5e7c4', icon: <Home className="h-4 w-4 text-[#bfae7c]" /> },
  ferias: { label: 'Férias', color: '#ffe6e6', icon: <Umbrella className="h-4 w-4 text-[#e6a1a1]" /> },
  remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Laptop className="h-4 w-4 text-[#7cc3e6]" /> },
  none: { label: '', color: '#fff', icon: null },
};

function CalendarComponent() {
  const today = new Date();
  const [month, setMonth] = useState(today);
  
  const [marks, setMarks] = useState<{ [date: string]: 'presencial' | 'ferias' | 'remoto' | 'none' }>(() => {
    try {
      const saved = localStorage.getItem('calendar-marks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const current = marks[key] || 'none';
    const next = current === 'none' ? 'presencial' : current === 'presencial' ? 'ferias' : current === 'ferias' ? 'remoto' : 'none';
    const newMarks = { ...marks, [key]: next };
    setMarks(newMarks);
    
    try {
      localStorage.setItem('calendar-marks', JSON.stringify(newMarks));
    } catch (error) {
      console.warn('Não foi possível salvar as marcações do calendário:', error);
    }
  };

  const clearAllMarks = () => {
    setMarks({});
    try {
      localStorage.removeItem('calendar-marks');
    } catch (error) {
      console.warn('Não foi possível limpar as marcações do calendário:', error);
    }
  };

  return (
    <div className="bg-[#f8f5e4] border border-[#e2d8b8] rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="font-semibold text-[#7c6a3c] text-xl flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-[#bfae7c]" />
            Meu Calendário de Trabalho
          </span>
          <span className="text-[#bfae7c] text-base">{format(month, 'MMMM yyyy')}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="px-3 py-2" onClick={() => setMonth(addDays(month, -30))}>Anterior</Button>
          <Button size="sm" variant="outline" className="px-3 py-2" onClick={() => setMonth(addDays(month, 30))}>Próximo</Button>
          <Button size="sm" variant="destructive" className="px-3 py-2" onClick={clearAllMarks} title="Limpar todas as marcações">Limpar</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-[#bfae7c] font-semibold text-center py-2 text-sm">{d}</div>
        ))}
        {Array(days[0].getDay()).fill(null).map((_, i) => (
          <div key={'empty-' + i}></div>
        ))}
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const mark = marks[key] || 'none';
          const isCurrent = isToday(date);
          return (
            <button
              key={key}
              onClick={() => handleDayClick(date)}
              className={`rounded-lg border border-[#e2d8b8] flex flex-col items-center justify-center h-16 w-full transition-all duration-150 focus:outline-none hover:shadow-md ${isCurrent ? 'ring-2 ring-[#bfae7c]' : ''}`}
              style={{ background: calendarLabels[mark].color }}
              title={calendarLabels[mark].label}
            >
              <span className="font-semibold text-[#7c6a3c] text-base">{date.getDate()}</span>
              {calendarLabels[mark].icon}
            </button>
          );
        })}
      </div>
      
      <div className="flex gap-6 justify-center text-sm bg-white/50 p-3 rounded-lg">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-[#f5e7c4] border border-[#e2d8b8]"></span>
          <Home className="h-4 w-4 text-[#bfae7c]" />
          Presencial
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-[#ffe6e6] border border-[#e2d8b8]"></span>
          <Umbrella className="h-4 w-4 text-[#e6a1a1]" />
          Férias
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-[#e6f7ff] border border-[#e2d8b8]"></span>
          <Laptop className="h-4 w-4 text-[#7cc3e6]" />
          Remoto
        </span>
      </div>
      
      <div className="mt-4 text-center text-sm text-[#bfae7c]">
        <p>Clique nos dias para marcar seu tipo de trabalho</p>
      </div>
    </div>
  );
}

const Calendario = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Calendário de Trabalho"
          subtitle="Organize sua agenda de trabalho presencial, remoto e férias"
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

        <CalendarComponent />
      </div>
    </div>
  );
};

export default Calendario;
