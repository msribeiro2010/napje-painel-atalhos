import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Home,
  GraduationCap,
  Gift,
  AlertCircle,
  X,
  Video,
  BookOpen,
  Star,
  Umbrella,
  Sun,
  Shield
} from 'lucide-react';
import { LazyWeeklyPlanningData, WeeklyCalendarEvent } from '@/hooks/useWeeklyPlanningLazy';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyData: LazyWeeklyPlanningData;
}

const getEventIcon = (event: WeeklyCalendarEvent) => {
  if (event.type === 'custom') {
    switch (event.category) {
      case 'curso':
        return <GraduationCap className="h-4 w-4" />;
      case 'webinario':
        return <Video className="h-4 w-4" />;
      case 'reuniao':
        return <Users className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  }
  
  if (event.type === 'work') {
    switch (event.category) {
      case 'work_onsite':
        return <Briefcase className="h-4 w-4" />;
      case 'work_remote':
        return <Home className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  }
  
  switch (event.type) {
    case 'birthday':
      return <Gift className="h-4 w-4" />;
    case 'holiday':
      return <Star className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getEventColor = (event: WeeklyCalendarEvent) => {
  if (event.type === 'custom') {
    switch (event.category) {
      case 'curso':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'webinario':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reuniao':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  if (event.type === 'work') {
    switch (event.category) {
      case 'work_onsite':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'work_remote':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }
  
  switch (event.type) {
    case 'birthday':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'holiday':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit'
  });
};

const formatDateRange = (start: Date, end: Date): string => {
  return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

// Componente elegante para exibir dia da semana com borda
const DayWithBorder: React.FC<{ date: Date; colorClass: string }> = ({ date, colorClass }) => {
  return (
    <div className={`inline-block px-3 py-2 rounded-lg border-2 ${colorClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 font-roboto`}>
      <div className="text-xs font-semibold uppercase tracking-wide">
        {format(date, 'EEEE', { locale: ptBR })}
      </div>
      <div className="text-sm font-bold mt-1">
        {format(date, 'dd/MM', { locale: ptBR })}
      </div>
    </div>
  );
};

const groupEventsByDay = (events: WeeklyCalendarEvent[]) => {
  const grouped: { [key: string]: WeeklyCalendarEvent[] } = {};
  
  events.forEach(event => {
    const dateKey = event.date.toDateString();
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });
  
  return grouped;
};

export const WeeklyPlanningModal: React.FC<WeeklyPlanningModalProps> = ({
  isOpen,
  onClose,
  weeklyData
}) => {
  const { weekStart, weekEnd, weekNumber, events, summary } = weeklyData;
  const groupedEvents = groupEventsByDay(events || []);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Não mostrar notificações - apenas dados reais dos eventos
  const activeNotifications: any[] = [];
  
  // Usar dados do summary calculado no hook com fallback
  const { 
    totalEvents = 0, 
    workDays = 0, 
    workOnsite = 0, 
    workRemote = 0,
    vacation = 0,
    timeOff = 0,
    onCall = 0,
    courses = 0,
    meetings = 0,
    webinars = 0,
    birthdays = 0, 
    holidays = 0 
  } = summary || {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 border-0 shadow-2xl">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent font-roboto">
                Planejamento Semanal
              </DialogTitle>
              <DialogDescription className="text-xl text-slate-600 dark:text-slate-300 font-medium font-roboto mt-1">
                Semana {weekNumber} • {formatDateRange(weekStart, weekEnd)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Semana - Design Moderno */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 font-roboto">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              Resumo da Semana
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total de Eventos */}
              <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-700 dark:text-slate-200 mb-2 font-roboto">{totalEvents}</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide font-roboto">Total de Eventos</div>
                </CardContent>
              </Card>

              {/* Trabalho Presencial */}
              {workOnsite > 0 && (
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2 font-roboto">{workOnsite}</div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3 font-roboto">Presencial</div>
                    {(() => {
                      const onsiteDays = events.filter(e => e.category === 'work_onsite');
                      if (onsiteDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {onsiteDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Trabalho Remoto */}
              {workRemote > 0 && (
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-4xl font-bold text-green-700 dark:text-green-300 mb-2 font-roboto">{workRemote}</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-3 font-roboto">Remoto</div>
                    {(() => {
                      const remoteDays = events.filter(e => e.category === 'work_remote');
                      if (remoteDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {remoteDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-green-300 text-green-600 dark:border-green-500 dark:text-green-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Cursos */}
              {courses > 0 && (
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2 font-roboto">{courses}</div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-3 font-roboto">Cursos</div>
                    {(() => {
                      const courseDays = events.filter(e => e.category === 'curso');
                      if (courseDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {courseDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-purple-300 text-purple-600 dark:border-purple-500 dark:text-purple-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}


              {/* Férias */}
              {vacation > 0 && (
                <Card className="border-0 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Umbrella className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-4xl font-bold text-red-700 dark:text-red-300 mb-2 font-roboto">{vacation}</div>
                    <div className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 font-roboto">Férias</div>
                    {(() => {
                      const vacationDays = events.filter(e => e.category === 'vacation');
                      if (vacationDays.length > 0) {
                        return (
                          <div className="text-sm text-red-500 dark:text-red-400 space-y-1 font-roboto">
                            {vacationDays.map((day, idx) => (
                              <div key={idx}>
                                {format(day.date, 'EEEE', { locale: ptBR })}
                                <br />
                                {format(day.date, 'dd/MM', { locale: ptBR })}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Folgas */}
              {timeOff > 0 && (
                <Card className="border-0 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800/30 dark:to-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-roboto">{timeOff}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3 font-roboto">Folgas</div>
                    {(() => {
                      const timeOffDays = events.filter(e => e.category === 'time_off');
                      if (timeOffDays.length > 0) {
                        return (
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 font-roboto">
                            {timeOffDays.map((day, idx) => (
                              <div key={idx}>
                                {format(day.date, 'EEEE', { locale: ptBR })}
                                <br />
                                {format(day.date, 'dd/MM', { locale: ptBR })}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Plantão */}
              {onCall > 0 && (
                <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-300 mb-2 font-roboto">{onCall}</div>
                    <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-3 font-roboto">Plantão</div>
                    {(() => {
                      const onCallDays = events.filter(e => e.category === 'on_call');
                      if (onCallDays.length > 0) {
                        return (
                          <div className="text-sm text-yellow-500 dark:text-yellow-400 space-y-1 font-roboto">
                            {onCallDays.map((day, idx) => (
                              <div key={idx}>
                                {format(day.date, 'EEEE', { locale: ptBR })}
                                <br />
                                {format(day.date, 'dd/MM', { locale: ptBR })}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Reuniões */}
              {meetings > 0 && (
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-300 mb-2 font-roboto">{meetings}</div>
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3 font-roboto">Reuniões</div>
                    {(() => {
                      const meetingDays = events.filter(e => e.category === 'reuniao');
                      if (meetingDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {meetingDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-indigo-300 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Webinários */}
              {webinars > 0 && (
                <Card className="border-0 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Video className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="text-4xl font-bold text-teal-700 dark:text-teal-300 mb-2 font-roboto">{webinars}</div>
                    <div className="text-sm font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-3 font-roboto">Webinários</div>
                    {(() => {
                      const webinarDays = events.filter(e => e.category === 'webinario');
                      if (webinarDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {webinarDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-teal-300 text-teal-600 dark:border-teal-500 dark:text-teal-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Feriados */}
              {holidays > 0 && (
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-4xl font-bold text-orange-700 dark:text-orange-300 mb-2 font-roboto">{holidays}</div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-3 font-roboto">Feriados</div>
                    {(() => {
                      const holidayDays = events.filter(e => e.type === 'holiday');
                      if (holidayDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {holidayDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-orange-300 text-orange-600 dark:border-orange-500 dark:text-orange-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Aniversários */}
              {birthdays > 0 && (
                <Card className="border-0 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div className="text-4xl font-bold text-pink-700 dark:text-pink-300 mb-2 font-roboto">{birthdays}</div>
                    <div className="text-sm font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-3 font-roboto">Aniversários</div>
                    {(() => {
                      const birthdayDays = events.filter(e => e.type === 'birthday');
                      if (birthdayDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {birthdayDays.map((day, idx) => (
                              <DayWithBorder 
                                key={idx} 
                                date={day.date} 
                                colorClass="border-pink-300 text-pink-600 dark:border-pink-500 dark:text-pink-400" 
                              />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
};