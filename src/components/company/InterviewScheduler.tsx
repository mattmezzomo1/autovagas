import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Send,
  X,
  CheckCircle,
  User,
  Video,
  MapPin,
  MessageSquare
} from 'lucide-react';

interface InterviewSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    email: string;
    currentRole: string;
  } | null;
  onSchedule: (scheduleData: any) => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  isOpen,
  onClose,
  candidate,
  onSchedule
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [interviewType, setInterviewType] = useState<'video' | 'presencial'>('video');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !candidate) return null;

  // Gerar horários disponíveis (9h às 18h, de hora em hora)
  const availableTimes = [];
  for (let hour = 9; hour <= 18; hour++) {
    availableTimes.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      availableTimes.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Gerar próximos 14 dias úteis
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1); // Começar amanhã

    while (dates.length < 14) {
      const dayOfWeek = currentDate.getDay();
      // Pular fins de semana (0 = domingo, 6 = sábado)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleSendSuggestion = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor, selecione data e horário');
      return;
    }

    setIsLoading(true);

    // Simular envio da sugestão
    setTimeout(() => {
      const scheduleData = {
        candidateId: candidate.id,
        date: selectedDate,
        time: selectedTime,
        type: interviewType,
        location: interviewType === 'presencial' ? location : 'Video chamada',
        notes,
        status: 'pending_confirmation'
      };

      onSchedule(scheduleData);
      setIsLoading(false);
      onClose();
      
      // Mostrar confirmação
      alert(`Sugestão de horário enviada para ${candidate.name}!\n\nData: ${new Date(selectedDate).toLocaleDateString('pt-BR')}\nHorário: ${selectedTime}\nTipo: ${interviewType === 'video' ? 'Video chamada' : 'Presencial'}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Agendar Entrevista</h2>
              <p className="text-white/60 text-sm">Enviar sugestão de horário para {candidate.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-medium">{candidate.name}</h3>
                <p className="text-white/60 text-sm">{candidate.currentRole}</p>
                <p className="text-white/40 text-xs">{candidate.email}</p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-white font-medium mb-3">Selecionar Data</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-500 border-purple-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="text-xs">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-white font-medium mb-3">Selecionar Horário</label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {availableTimes.map((time) => {
                const isSelected = selectedTime === time;
                
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-500 border-purple-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">{time}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-white font-medium mb-3">Tipo de Entrevista</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInterviewType('video')}
                className={`p-4 rounded-lg border transition-all ${
                  interviewType === 'video'
                    ? 'bg-purple-500 border-purple-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Video Chamada</div>
                <div className="text-xs text-white/60">Entrevista online com IA</div>
              </button>
              
              <button
                onClick={() => setInterviewType('presencial')}
                className={`p-4 rounded-lg border transition-all ${
                  interviewType === 'presencial'
                    ? 'bg-purple-500 border-purple-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Presencial</div>
                <div className="text-xs text-white/60">No escritório</div>
              </button>
            </div>
          </div>

          {/* Location (if presencial) */}
          {interviewType === 'presencial' && (
            <div>
              <label className="block text-white font-medium mb-2">Local da Entrevista</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Sala 456"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-white font-medium mb-2">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre a entrevista..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSendSuggestion}
            disabled={!selectedDate || !selectedTime || isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Sugestão de Horário
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
