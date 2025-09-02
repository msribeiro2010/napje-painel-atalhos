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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Planejamento Semanal
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600">
                  Semana {weekNumber} • {formatDateRange(weekStart, weekEnd)}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Semana - Design Moderno */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Resumo da Semana
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Total de Eventos */}
              <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-1">{totalEvents}</div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total de Eventos</div>
                </CardContent>
              </Card>

              {/* Trabalho Presencial */}
              {workOnsite > 0 && (
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">{workOnsite}</div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Presencial</div>
                    {(() => {
                      const onsiteDays = events.filter(e => e.category === 'work_onsite');
                      if (onsiteDays.length > 0) {
                        const firstDay = onsiteDays[0];
                        return (
                          <div className="text-xs text-blue-500 dark:text-blue-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1">{workRemote}</div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">Remoto</div>
                    {(() => {
                      const remoteDays = events.filter(e => e.category === 'work_remote');
                      if (remoteDays.length > 0) {
                        const firstDay = remoteDays[0];
                        return (
                          <div className="text-xs text-green-500 dark:text-green-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{courses}</div>
                    <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">Cursos</div>
                    {(() => {
                      const courseDays = events.filter(e => e.category === 'curso');
                      if (courseDays.length > 0) {
                        const firstDay = courseDays[0];
                        return (
                          <div className="text-xs text-purple-500 dark:text-purple-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Umbrella className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-1">{vacation}</div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">Férias</div>
                    {(() => {
                      const vacationDays = events.filter(e => e.type === 'vacation');
                      if (vacationDays.length > 0) {
                        const firstDay = vacationDays[0];
                        return (
                          <div className="text-xs text-red-500 dark:text-red-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-1">{timeOff}</div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Folgas</div>
                    {(() => {
                      const timeOffDays = events.filter(e => e.type === 'time_off');
                      if (timeOffDays.length > 0) {
                        const firstDay = timeOffDays[0];
                        return (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">{onCall}</div>
                    <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-2">Plantão</div>
                    {(() => {
                      const onCallDays = events.filter(e => e.type === 'on_call');
                      if (onCallDays.length > 0) {
                        const firstDay = onCallDays[0];
                        return (
                          <div className="text-xs text-yellow-500 dark:text-yellow-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">{meetings}</div>
                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">Reuniões</div>
                    {(() => {
                      const meetingDays = events.filter(e => e.category === 'reuniao');
                      if (meetingDays.length > 0) {
                        const firstDay = meetingDays[0];
                        return (
                          <div className="text-xs text-indigo-500 dark:text-indigo-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Video className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">{webinars}</div>
                    <div className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-2">Webinários</div>
                    {(() => {
                      const webinarDays = events.filter(e => e.category === 'webinario');
                      if (webinarDays.length > 0) {
                        const firstDay = webinarDays[0];
                        return (
                          <div className="text-xs text-teal-500 dark:text-teal-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-1">{holidays}</div>
                    <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">Feriados</div>
                    {(() => {
                      const holidayDays = events.filter(e => e.type === 'holiday');
                      if (holidayDays.length > 0) {
                        const firstDay = holidayDays[0];
                        return (
                          <div className="text-xs text-orange-500 dark:text-orange-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div className="text-3xl font-bold text-pink-700 dark:text-pink-300 mb-1">{birthdays}</div>
                    <div className="text-xs font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Aniversários</div>
                    {(() => {
                      const birthdayDays = events.filter(e => e.type === 'birthday');
                      if (birthdayDays.length > 0) {
                        const firstDay = birthdayDays[0];
                        return (
                          <div className="text-xs text-pink-500 dark:text-pink-400">
                            {format(firstDay.date, 'EEEE', { locale: ptBR })}
                            <br />
                            {format(firstDay.date, 'dd/MM', { locale: ptBR })}
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

          {/* Eventos por Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agenda da Semana</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedDates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum evento encontrado para esta semana
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedDates.map((dateKey, index) => {
                    const date = new Date(dateKey);
                    const dayEvents = groupedEvents[dateKey];
                    
                    return (
                      <div key={dateKey}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg text-gray-900 capitalize">
                            {formatDate(date)}
                          </h3>
                          <div className="grid gap-3">
                            {dayEvents.map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className={`p-3 rounded-lg border ${getEventColor(event)}`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="mt-0.5">
                                    {getEventIcon(event)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium">{event.title}</div>
                                    {event.description && (
                                      <div className="text-sm opacity-80 mt-1">
                                        {event.description}
                                      </div>
                                    )}
                                    {event.time && (
                                      <div className="flex items-center space-x-1 text-xs opacity-70 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{event.time}</span>
                                      </div>
                                    )}
                                    {event.location && (
                                      <div className="flex items-center space-x-1 text-xs opacity-70 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {event.type === 'custom' ? event.category : 
                                       event.type === 'work' ? (
                                         event.category === 'work_onsite' ? 'Presencial' :
                                         event.category === 'work_remote' ? 'Remoto' : 'Trabalho'
                                       ) : event.type}
                                    </Badge>
                                    {event.allDay && (
                                      <Badge variant="outline" className="text-xs">
                                        Dia inteiro
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
};