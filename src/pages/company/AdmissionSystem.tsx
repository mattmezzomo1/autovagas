import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  Users, Clock, CheckCircle, AlertTriangle, 
  FileText, Calendar, TrendingUp, Plus, 
  Filter, Search, Eye, Settings, Download,
  UserCheck, UserX, BarChart3,
  Briefcase, GraduationCap, Shield, Award
} from 'lucide-react';

interface AdmissionCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  documents: {
    uploaded: number;
    required: number;
    validated: number;
  };
  contractSigned: boolean;
  lastActivity: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface AdmissionStep {
  id: string;
  name: string;
  type: 'document' | 'form' | 'meeting' | 'training' | 'validation';
  required: boolean;
  order: number;
  estimatedDuration: number; // em dias
  description: string;
  dependencies: string[];
}

export const AdmissionSystem: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<AdmissionCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<AdmissionCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    const mockCandidates: AdmissionCandidate[] = [
      {
        id: '1',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-9999',
        position: 'Desenvolvedora Full Stack Senior',
        department: 'Tecnologia',
        startDate: '2024-02-01',
        status: 'in_progress',
        progress: 65,
        currentStep: 'Validação de Documentos',
        totalSteps: 8,
        completedSteps: 5,
        documents: {
          uploaded: 7,
          required: 8,
          validated: 5
        },
        contractSigned: true,
        lastActivity: '2024-01-15T10:30:00Z',
        assignedTo: 'Maria Santos (RH)',
        priority: 'high',
        tags: ['senior', 'tech', 'urgente']
      },
      {
        id: '2',
        name: 'Carlos Santos',
        email: 'carlos.santos@email.com',
        phone: '(11) 88888-8888',
        position: 'Analista de Marketing',
        department: 'Marketing',
        startDate: '2024-02-15',
        status: 'pending',
        progress: 25,
        currentStep: 'Documentos Pessoais',
        totalSteps: 6,
        completedSteps: 1,
        documents: {
          uploaded: 2,
          required: 6,
          validated: 1
        },
        contractSigned: false,
        lastActivity: '2024-01-12T14:20:00Z',
        assignedTo: 'João Oliveira (RH)',
        priority: 'medium',
        tags: ['marketing', 'junior']
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        phone: '(11) 77777-7777',
        position: 'Gerente de Vendas',
        department: 'Comercial',
        startDate: '2024-01-20',
        status: 'completed',
        progress: 100,
        currentStep: 'Concluído',
        totalSteps: 7,
        completedSteps: 7,
        documents: {
          uploaded: 8,
          required: 8,
          validated: 8
        },
        contractSigned: true,
        lastActivity: '2024-01-18T09:15:00Z',
        assignedTo: 'Ana Costa (RH)',
        priority: 'high',
        tags: ['liderança', 'vendas', 'concluído']
      },
      {
        id: '4',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 66666-6666',
        position: 'Designer UX/UI',
        department: 'Design',
        startDate: '2024-02-10',
        status: 'blocked',
        progress: 40,
        currentStep: 'Aguardando Documentos',
        totalSteps: 6,
        completedSteps: 2,
        documents: {
          uploaded: 3,
          required: 6,
          validated: 2
        },
        contractSigned: false,
        lastActivity: '2024-01-10T16:45:00Z',
        assignedTo: 'Maria Santos (RH)',
        priority: 'medium',
        tags: ['design', 'bloqueado']
      }
    ];

    setCandidates(mockCandidates);
    setFilteredCandidates(mockCandidates);
    setIsLoading(false);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.priority === priorityFilter);
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'blocked': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'cancelled': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'blocked': return 'Bloqueado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <UserCheck className="w-4 h-4" />;
      case 'blocked': return <UserX className="w-4 h-4" />;
      case 'cancelled': return <UserX className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    inProgress: candidates.filter(c => c.status === 'in_progress').length,
    completed: candidates.filter(c => c.status === 'completed').length,
    blocked: candidates.filter(c => c.status === 'blocked').length,
    avgProgress: Math.round(candidates.reduce((acc, c) => acc + c.progress, 0) / candidates.length)
  };

  if (isLoading) {
    return (
      <CompanyLayout title="Carregando..." description="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout
      title="Sistema de Admissão"
      description="Gerencie o processo de onboarding e admissão digital de novos colaboradores"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/admission/config')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
          <button
            onClick={() => navigate('/company/admission/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Admissão
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/60">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.pending}</div>
                <div className="text-xs text-white/60">Pendentes</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.inProgress}</div>
                <div className="text-xs text-white/60">Em Andamento</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.completed}</div>
                <div className="text-xs text-white/60">Concluídos</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.blocked}</div>
                <div className="text-xs text-white/60">Bloqueados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.avgProgress}%</div>
                <div className="text-xs text-white/60">Progresso Médio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, email, cargo ou departamento..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="blocked">Bloqueado</option>
                <option value="cancelled">Cancelado</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCandidates.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 mb-4">
              <div className="text-purple-200 text-sm">
                {selectedCandidates.length} candidato(s) selecionado(s)
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                  <FileText className="w-4 h-4" />
                  Gerar Relatório
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Candidates List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">
                Candidatos em Admissão ({filteredCandidates.length})
              </h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {selectedCandidates.length === filteredCandidates.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                    />
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{candidate.name}</h3>
                      <p className="text-white/60 text-sm">{candidate.position}</p>
                      <p className="text-white/50 text-xs">{candidate.department} • Início: {new Date(candidate.startDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(candidate.priority)}`}>
                      {getPriorityLabel(candidate.priority)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(candidate.status)}`}>
                      {getStatusIcon(candidate.status)}
                      {getStatusLabel(candidate.status)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/70">Progresso: {candidate.currentStep}</span>
                    <span className="text-white font-medium">{candidate.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        candidate.progress === 100 ? 'bg-green-500' :
                        candidate.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${candidate.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>{candidate.completedSteps}/{candidate.totalSteps} etapas</span>
                    <span>Responsável: {candidate.assignedTo}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-white/70 text-sm">Documentos</span>
                    </div>
                    <div className="text-white font-medium">
                      {candidate.documents.validated}/{candidate.documents.required}
                    </div>
                    <div className="text-white/60 text-xs">
                      {candidate.documents.uploaded} enviados
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-white/70 text-sm">Contrato</span>
                    </div>
                    <div className={`font-medium ${candidate.contractSigned ? 'text-green-400' : 'text-yellow-400'}`}>
                      {candidate.contractSigned ? 'Assinado' : 'Pendente'}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70 text-sm">Última Atividade</span>
                    </div>
                    <div className="text-white font-medium text-sm">
                      {new Date(candidate.lastActivity).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {candidate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded border border-purple-500/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/company/admission/${candidate.id}`)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                      <Calendar className="w-4 h-4" />
                      Agendar
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-white/60 text-xs">
                      Contato: {candidate.email}
                    </div>
                    <div className="text-white/60 text-xs">
                      {candidate.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum candidato encontrado</h3>
              <p className="text-white/60">Tente ajustar os filtros ou adicione novos candidatos ao processo de admissão</p>
            </div>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
};
