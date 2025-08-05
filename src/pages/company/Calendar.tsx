import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Video,
  MapPin,
  Users,
  Edit,
  Trash2,
  Bell,
  ExternalLink
} from 'lucide-react';

export const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data dos eventos
  const events = [
    {
      id: '1',
      title: 'Entrevista - Carlos Oliveira',
      candidate: 'Carlos Oliveira',
      job: 'Designer UX/UI',
      date: '2024-01-16',
      time: '10:00',
      duration: 60,
      type: 'interview',
      location: 'Sala de Reunião 1',
      attendees: ['Ana Costa', 'João Silva'],
      status: 'confirmed',
      meetingLink: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      title: 'Reunião de Alinhamento - Equipe RH',
      date: '2024-01-16',
      time: '14:00',
      duration: 30,
      type: 'meeting',
      location: 'Online',
      attendees: ['Equipe RH'],
      status: 'confirmed'
    },
    {
      id: '3',
      title: 'Entrevista - Ana Silva',
      candidate: 'Ana Silva',
      job: 'Desenvolvedora Backend',
      date: '2024-01-17',
      time: '09:00',
      duration: 45,
      type: 'interview',
      location: 'Online',
      attendees: ['Tech Lead'],
      status: 'pending',
      meetingLink: 'https://meet.google.com/xyz-abc-def'
    },
    {
      id: '4',
      title: 'Feedback Session - Maria Santos',
      candidate: 'Maria Santos',
      job: 'Product Manager',
      date: '2024-01-17',
      time: '15:30',
      duration: 30,
      type: 'feedback',
      location: 'Sala de Reunião 2',
      attendees: ['Product Team'],
      status: 'confirmed'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'meeting':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'feedback':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <User className="w-4 h-4" />;
      case 'meeting':
        return <Users className="w-4 h-4" />;
      case 'feedback':
        return <Bell className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Dias vazios do início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 p-2 border border-white/10 cursor-pointer transition-all hover:bg-white/5 ${
            isSelected ? 'bg-purple-500/20 border-purple-500/50' : ''
          } ${isToday ? 'ring-2 ring-blue-400/50' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-400' : 'text-white'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded bg-blue-500/20 text-blue-300 truncate"
              >
                {event.time} - {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-white/60">
                +{dayEvents.length - 2} mais
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <CompanyLayout
      title="Agenda"
      description="Gerencie entrevistas e reuniões"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-white/60">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid do Calendário */}
            <div className="grid grid-cols-7 gap-0 border border-white/10 rounded-lg overflow-hidden">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Sidebar - Eventos do Dia Selecionado */}
        <div className="space-y-6">
          {/* Data Selecionada */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              {formatDate(selectedDate)}
            </h3>
            <p className="text-white/60 text-sm">
              {selectedDateEvents.length} evento{selectedDateEvents.length !== 1 ? 's' : ''} agendado{selectedDateEvents.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Lista de Eventos */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Eventos do Dia</h3>
            
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <span className={`px-2 py-1 rounded-full text-xs border ${getEventTypeColor(event.type)}`}>
                          {event.type === 'interview' ? 'Entrevista' : 
                           event.type === 'meeting' ? 'Reunião' : 'Feedback'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-white font-medium mb-2">{event.title}</h4>
                    
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time} • {event.duration} min</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>

                      {event.candidate && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{event.candidate} • {event.job}</span>
                        </div>
                      )}

                      {event.attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {event.meetingLink && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          Entrar na Reunião
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 text-sm">Nenhum evento agendado para este dia</p>
              </div>
            )}
          </div>

          {/* Próximos Eventos */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{event.title}</p>
                    <p className="text-white/60 text-xs">
                      {new Date(event.date).toLocaleDateString('pt-BR')} • {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
