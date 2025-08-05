import React, { useState, useEffect } from 'react';
import { Bot, ArrowLeft, CheckCircle2, Clock, X, Loader2, MapPin, Briefcase, Banknote, ExternalLink, Calendar, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface BotActivity {
  id: string;
  company: string;
  position: string;
  status: 'analyzing' | 'applying' | 'completed' | 'error';
  timestamp: Date;
  salary?: string;
  location?: string;
  workHours?: string;
  jobType?: string;
  applicationUrl?: string;
  matchScore?: number;
}

export const Activity: React.FC = () => {
  const { profile } = useAuthStore();
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [activities, setActivities] = useState<BotActivity[]>([
    {
      id: '1',
      company: 'Google',
      position: 'Senior Software Engineer',
      status: 'completed',
      timestamp: new Date(),
      salary: 'R$ 25.000 - R$ 30.000',
      location: 'São Paulo, SP (Híbrido)',
      workHours: '40h semanais',
      jobType: 'CLT',
      applicationUrl: 'https://careers.google.com/jobs/123',
      matchScore: 92
    },
    {
      id: '2',
      company: 'Microsoft',
      position: 'Full Stack Developer',
      status: 'analyzing',
      timestamp: new Date(),
      salary: 'R$ 18.000 - R$ 22.000',
      location: 'Remoto',
      workHours: '40h semanais',
      jobType: 'PJ',
      matchScore: 87
    },
    {
      id: '3',
      company: 'Amazon',
      position: 'Tech Lead',
      status: 'applying',
      timestamp: new Date(),
      salary: 'R$ 22.000 - R$ 28.000',
      location: 'São Paulo, SP (Presencial)',
      workHours: '44h semanais',
      jobType: 'CLT',
      matchScore: 95
    },
    {
      id: '4',
      company: 'Nubank',
      position: 'Desenvolvedor Backend Senior',
      status: 'analyzing',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      salary: 'R$ 20.000 - R$ 25.000',
      location: 'Remoto',
      workHours: '40h semanais',
      jobType: 'CLT',
      matchScore: 89
    },
    {
      id: '5',
      company: 'iFood',
      position: 'Engenheiro de Software',
      status: 'completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      salary: 'R$ 15.000 - R$ 18.000',
      location: 'Campinas, SP (Híbrido)',
      workHours: '40h semanais',
      jobType: 'CLT',
      applicationUrl: 'https://careers.ifood.com/jobs/456',
      matchScore: 84
    },
  ]);

  const toggleExpand = (id: string) => {
    if (expandedActivity === id) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(id);
    }
  };

  const getStatusIcon = (status: BotActivity['status']) => {
    switch (status) {
      case 'analyzing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'applying':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: BotActivity['status']) => {
    switch (status) {
      case 'analyzing':
        return 'Analisando vaga';
      case 'applying':
        return 'Aplicando para vaga';
      case 'completed':
        return 'Aplicado - Acompanhar';
      case 'error':
        return 'Erro na aplicação';
    }
  };

  const getStatusColor = (status: BotActivity['status']) => {
    switch (status) {
      case 'analyzing':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 'applying':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      case 'completed':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'error':
        return 'from-red-500/20 to-rose-500/20 border-red-500/30';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-purple-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-purple-200 hover:text-purple-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Atividade do Bot</h1>
              <p className="text-purple-200">Acompanhe as aplicações em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-200 font-medium">Bot ativo</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-white">{activities.length}</div>
            <div className="text-purple-200">Vagas encontradas</div>
          </div>
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-white">
              {activities.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-purple-200">Aplicações enviadas</div>
          </div>
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-white">
              {activities.filter(a => a.status === 'analyzing' || a.status === 'applying').length}
            </div>
            <div className="text-purple-200">Em andamento</div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`bg-gradient-to-br ${getStatusColor(activity.status)} backdrop-blur-xl rounded-xl border overflow-hidden transition-all duration-300`}
            >
              {/* Card Header - Always visible */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => toggleExpand(activity.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{activity.position}</h3>
                    {activity.matchScore && (
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1 ${getMatchScoreColor(activity.matchScore)}`}>
                        <BarChart className="w-3 h-3" />
                        {activity.matchScore}% match
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <span>{activity.company}</span>
                    {activity.location && (
                      <>
                        <span className="text-purple-400">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-purple-100 text-sm font-medium">
                    {getStatusText(activity.status)}
                  </div>
                  <div className="text-purple-300 text-xs">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  {expandedActivity === activity.id ? (
                    <ChevronUp className="w-5 h-5 text-purple-300" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-300" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedActivity === activity.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="w-full h-px bg-white/10 mb-4"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {activity.salary && (
                      <div className="flex items-center gap-2 text-purple-200">
                        <Banknote className="w-4 h-4 text-purple-400" />
                        <span>Salário: {activity.salary}</span>
                      </div>
                    )}
                    {activity.jobType && (
                      <div className="flex items-center gap-2 text-purple-200">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <span>Contratação: {activity.jobType}</span>
                      </div>
                    )}
                    {activity.workHours && (
                      <div className="flex items-center gap-2 text-purple-200">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>Carga horária: {activity.workHours}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-purple-200">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Data: {activity.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {activity.status === 'completed' && activity.applicationUrl && (
                      <a
                        href={activity.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Acompanhar aplicação
                      </a>
                    )}
                    {activity.status === 'analyzing' && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                        <Clock className="w-4 h-4" />
                        Verificar status
                      </button>
                    )}
                    {activity.status === 'applying' && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aplicando...
                      </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg transition-colors">
                      <Bot className="w-4 h-4" />
                      Ver detalhes da vaga
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};