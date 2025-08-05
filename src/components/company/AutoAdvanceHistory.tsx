import React, { useState } from 'react';
import { 
  Clock, User, ArrowRight, CheckCircle, XCircle, 
  Zap, Filter, Calendar, Download, Eye, BarChart3
} from 'lucide-react';

interface AutoAdvanceEvent {
  id: string;
  candidateId: string;
  candidateName: string;
  ruleId: string;
  ruleName: string;
  fromStep: string;
  toStep: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  score: number;
  conditions: {
    field: string;
    expected: string | number;
    actual: string | number;
    met: boolean;
  }[];
  actions: string[];
  duration: number; // em segundos
  error?: string;
}

interface AutoAdvanceHistoryProps {
  events: AutoAdvanceEvent[];
  className?: string;
}

export const AutoAdvanceHistory: React.FC<AutoAdvanceHistoryProps> = ({ 
  events, 
  className = '' 
}) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [selectedEvent, setSelectedEvent] = useState<AutoAdvanceEvent | null>(null);

  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.status !== filter) return false;
    
    const eventDate = new Date(event.timestamp);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return eventDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return eventDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return eventDate >= monthAgo;
      default:
        return true;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Sucesso';
      case 'failed': return 'Falhou';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const stats = {
    total: filteredEvents.length,
    success: filteredEvents.filter(e => e.status === 'success').length,
    failed: filteredEvents.filter(e => e.status === 'failed').length,
    pending: filteredEvents.filter(e => e.status === 'pending').length,
    avgDuration: filteredEvents.length > 0 
      ? Math.round(filteredEvents.reduce((acc, e) => acc + e.duration, 0) / filteredEvents.length)
      : 0
  };

  return (
    <div className={`bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Histórico de Movimentos Automáticos</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm">
            <BarChart3 className="w-4 h-4" />
            Relatório
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os Status</option>
            <option value="success">Sucesso</option>
            <option value="failed">Falhou</option>
            <option value="pending">Pendente</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="today">Hoje</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-lg font-bold text-white">{stats.total}</div>
          <div className="text-xs text-white/60">Total</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-lg font-bold text-green-400">{stats.success}</div>
          <div className="text-xs text-white/60">Sucessos</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-lg font-bold text-red-400">{stats.failed}</div>
          <div className="text-xs text-white/60">Falhas</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-lg font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-white/60">Pendentes</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-lg font-bold text-blue-400">{formatDuration(stats.avgDuration)}</div>
          <div className="text-xs text-white/60">Duração Média</div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(event.status)}
                <div>
                  <h4 className="font-medium text-white">{event.candidateName}</h4>
                  <p className="text-white/60 text-sm">{event.ruleName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {getStatusLabel(event.status)}
                </span>
                <div className="text-right">
                  <div className="text-white text-sm">{event.score}</div>
                  <div className="text-white/60 text-xs">Score</div>
                </div>
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/70 text-sm">{event.fromStep}</span>
              <ArrowRight className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-sm">{event.toStep}</span>
              <span className="text-white/50 text-xs ml-auto">
                {new Date(event.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>

            {/* Conditions Summary */}
            <div className="flex flex-wrap gap-2">
              {event.conditions.slice(0, 3).map((condition, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    condition.met 
                      ? 'bg-green-500/20 text-green-200' 
                      : 'bg-red-500/20 text-red-200'
                  }`}
                >
                  {condition.field}: {condition.actual} {condition.met ? '✓' : '✗'}
                </span>
              ))}
              {event.conditions.length > 3 && (
                <span className="text-xs text-white/60 px-2 py-1">
                  +{event.conditions.length - 3} mais
                </span>
              )}
            </div>

            {event.error && (
              <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                <div className="text-red-400 text-xs">{event.error}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum evento encontrado</h3>
          <p className="text-white/60">Ajuste os filtros ou aguarde atividade das regras automáticas</p>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Detalhes do Movimento</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white/70 text-sm">Candidato</div>
                  <div className="text-white font-medium">{selectedEvent.candidateName}</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Regra</div>
                  <div className="text-white font-medium">{selectedEvent.ruleName}</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Status</div>
                  <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-sm ${getStatusColor(selectedEvent.status)}`}>
                    {getStatusIcon(selectedEvent.status)}
                    {getStatusLabel(selectedEvent.status)}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Duração</div>
                  <div className="text-white font-medium">{formatDuration(selectedEvent.duration)}</div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Condições Avaliadas</h4>
                <div className="space-y-2">
                  {selectedEvent.conditions.map((condition, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      condition.met 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{condition.field}</span>
                        {condition.met ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        Esperado: {condition.expected} | Atual: {condition.actual}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Ações Executadas</h4>
                <div className="space-y-1">
                  {selectedEvent.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>

              {selectedEvent.error && (
                <div>
                  <h4 className="text-white font-medium mb-3">Erro</h4>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="text-red-400 text-sm">{selectedEvent.error}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
