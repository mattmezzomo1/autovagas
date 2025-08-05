import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  Briefcase, FileText, CheckCircle, Clock, AlertTriangle,
  Download, Upload, Eye, Edit, MessageSquare, Plus,
  Shield, Award, TrendingUp, Users, Settings, Play
} from 'lucide-react';

interface AdmissionStep {
  id: string;
  name: string;
  type: 'document' | 'form' | 'meeting' | 'training' | 'validation';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  required: boolean;
  order: number;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
  documents?: {
    id: string;
    name: string;
    type: string;
    status: 'pending' | 'uploaded' | 'validated' | 'rejected';
    uploadedAt?: string;
    validatedAt?: string;
    rejectionReason?: string;
  }[];
}

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
  contractSigned: boolean;
  lastActivity: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  personalInfo: {
    cpf: string;
    rg: string;
    birthDate: string;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  steps: AdmissionStep[];
  timeline: {
    id: string;
    type: 'step_completed' | 'document_uploaded' | 'note_added' | 'status_changed';
    title: string;
    description: string;
    timestamp: string;
    user: string;
  }[];
}

export const AdmissionDetails: React.FC = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<AdmissionCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'documents' | 'timeline'>('overview');
  const [newNote, setNewNote] = useState('');

  // Mock data
  useEffect(() => {
    const mockCandidate: AdmissionCandidate = {
      id: candidateId || '1',
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
      contractSigned: true,
      lastActivity: '2024-01-15T10:30:00Z',
      assignedTo: 'Maria Santos (RH)',
      priority: 'high',
      tags: ['senior', 'tech', 'urgente'],
      personalInfo: {
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        birthDate: '1990-05-15',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        emergencyContact: {
          name: 'João Silva',
          phone: '(11) 88888-8888',
          relationship: 'Cônjuge'
        }
      },
      steps: [
        {
          id: '1',
          name: 'Documentos Pessoais',
          type: 'document',
          status: 'completed',
          required: true,
          order: 1,
          completedAt: '2024-01-10T09:00:00Z',
          assignedTo: 'Maria Santos',
          documents: [
            { id: '1', name: 'RG', type: 'image/jpeg', status: 'validated', uploadedAt: '2024-01-10T08:30:00Z', validatedAt: '2024-01-10T09:00:00Z' },
            { id: '2', name: 'CPF', type: 'image/jpeg', status: 'validated', uploadedAt: '2024-01-10T08:30:00Z', validatedAt: '2024-01-10T09:00:00Z' }
          ]
        },
        {
          id: '2',
          name: 'Comprovante de Residência',
          type: 'document',
          status: 'completed',
          required: true,
          order: 2,
          completedAt: '2024-01-11T14:00:00Z',
          assignedTo: 'Maria Santos',
          documents: [
            { id: '3', name: 'Conta de Luz', type: 'application/pdf', status: 'validated', uploadedAt: '2024-01-11T13:30:00Z', validatedAt: '2024-01-11T14:00:00Z' }
          ]
        },
        {
          id: '3',
          name: 'Documentos Acadêmicos',
          type: 'document',
          status: 'completed',
          required: true,
          order: 3,
          completedAt: '2024-01-12T10:00:00Z',
          assignedTo: 'Maria Santos',
          documents: [
            { id: '4', name: 'Diploma', type: 'application/pdf', status: 'validated', uploadedAt: '2024-01-12T09:30:00Z', validatedAt: '2024-01-12T10:00:00Z' },
            { id: '5', name: 'Histórico Escolar', type: 'application/pdf', status: 'validated', uploadedAt: '2024-01-12T09:30:00Z', validatedAt: '2024-01-12T10:00:00Z' }
          ]
        },
        {
          id: '4',
          name: 'Exames Médicos',
          type: 'document',
          status: 'completed',
          required: true,
          order: 4,
          completedAt: '2024-01-13T16:00:00Z',
          assignedTo: 'Dr. Carlos Medeiros',
          documents: [
            { id: '6', name: 'Exame Admissional', type: 'application/pdf', status: 'validated', uploadedAt: '2024-01-13T15:30:00Z', validatedAt: '2024-01-13T16:00:00Z' }
          ]
        },
        {
          id: '5',
          name: 'Assinatura de Contrato',
          type: 'form',
          status: 'completed',
          required: true,
          order: 5,
          completedAt: '2024-01-14T11:00:00Z',
          assignedTo: 'Ana Costa (Jurídico)'
        },
        {
          id: '6',
          name: 'Validação de Documentos',
          type: 'validation',
          status: 'in_progress',
          required: true,
          order: 6,
          assignedTo: 'Maria Santos',
          notes: 'Aguardando validação final dos documentos acadêmicos'
        },
        {
          id: '7',
          name: 'Treinamento de Integração',
          type: 'training',
          status: 'pending',
          required: true,
          order: 7,
          assignedTo: 'Pedro Oliveira (Treinamento)'
        },
        {
          id: '8',
          name: 'Reunião de Boas-vindas',
          type: 'meeting',
          status: 'pending',
          required: false,
          order: 8,
          assignedTo: 'Carlos Lima (Gestor)'
        }
      ],
      timeline: [
        {
          id: '1',
          type: 'step_completed',
          title: 'Assinatura de Contrato Concluída',
          description: 'Contrato assinado digitalmente com sucesso',
          timestamp: '2024-01-14T11:00:00Z',
          user: 'Ana Costa'
        },
        {
          id: '2',
          type: 'document_uploaded',
          title: 'Exame Admissional Enviado',
          description: 'Documento validado automaticamente',
          timestamp: '2024-01-13T15:30:00Z',
          user: 'Ana Silva'
        },
        {
          id: '3',
          type: 'step_completed',
          title: 'Documentos Acadêmicos Validados',
          description: 'Diploma e histórico escolar aprovados',
          timestamp: '2024-01-12T10:00:00Z',
          user: 'Maria Santos'
        },
        {
          id: '4',
          type: 'note_added',
          title: 'Nota Adicionada',
          description: 'Candidata demonstrou excelente qualificação técnica',
          timestamp: '2024-01-11T16:30:00Z',
          user: 'Maria Santos'
        }
      ]
    };

    setCandidate(mockCandidate);
    setIsLoading(false);
  }, [candidateId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'blocked': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'validated': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'uploaded': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'blocked': return 'Bloqueado';
      case 'validated': return 'Validado';
      case 'rejected': return 'Rejeitado';
      case 'uploaded': return 'Enviado';
      default: return status;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'form': return <Edit className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'training': return <Award className="w-4 h-4" />;
      case 'validation': return <Shield className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'step_completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'document_uploaded': return <Upload className="w-4 h-4 text-blue-400" />;
      case 'note_added': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'status_changed': return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
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

  if (!candidate) {
    return (
      <CompanyLayout title="Candidato não encontrado" description="">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Candidato não encontrado</h3>
          <p className="text-white/60 mb-4">O candidato solicitado não existe ou foi removido</p>
          <button
            onClick={() => navigate('/company/admission')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Lista
          </button>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout
      title={`Admissão - ${candidate.name}`}
      description={`${candidate.position} • ${candidate.department}`}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/admission')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Candidate Header */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{candidate.name}</h2>
                <p className="text-white/70 text-lg">{candidate.position}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {candidate.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Início: {new Date(candidate.startDate).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {candidate.assignedTo}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(candidate.status)}`}>
                {candidate.status === 'in_progress' && <Clock className="w-4 h-4" />}
                {candidate.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                {candidate.status === 'blocked' && <AlertTriangle className="w-4 h-4" />}
                {getStatusLabel(candidate.status)}
              </div>
              <div className="mt-2 text-white/60 text-sm">
                Progresso: {candidate.progress}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/70">Etapa Atual: {candidate.currentStep}</span>
              <span className="text-white font-medium">{candidate.completedSteps}/{candidate.totalSteps} etapas</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  candidate.progress === 100 ? 'bg-green-500' :
                  candidate.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${candidate.progress}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{candidate.steps.filter(s => s.documents).reduce((acc, s) => acc + (s.documents?.filter(d => d.status === 'validated').length || 0), 0)}</div>
              <div className="text-xs text-white/60">Docs Validados</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{candidate.contractSigned ? 'Sim' : 'Não'}</div>
              <div className="text-xs text-white/60">Contrato</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {Math.ceil((new Date(candidate.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs text-white/60">Dias para Início</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{candidate.priority === 'high' ? 'Alta' : candidate.priority === 'medium' ? 'Média' : 'Baixa'}</div>
              <div className="text-xs text-white/60">Prioridade</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('steps')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'steps'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Etapas
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documentos
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'timeline'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" />
              Timeline
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{candidate.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Telefone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span className="text-white">{candidate.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">CPF</label>
                    <div className="text-white mt-1">{candidate.personalInfo.cpf}</div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">RG</label>
                    <div className="text-white mt-1">{candidate.personalInfo.rg}</div>
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm">Data de Nascimento</label>
                  <div className="text-white mt-1">
                    {new Date(candidate.personalInfo.birthDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm">Endereço</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-white">{candidate.personalInfo.address}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-medium mb-2">Contato de Emergência</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-white/70 text-sm">Nome</label>
                      <div className="text-white">{candidate.personalInfo.emergencyContact.name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm">Telefone</label>
                        <div className="text-white">{candidate.personalInfo.emergencyContact.phone}</div>
                      </div>
                      <div>
                        <label className="text-white/70 text-sm">Parentesco</label>
                        <div className="text-white">{candidate.personalInfo.emergencyContact.relationship}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags and Notes */}
            <div className="space-y-6">
              {/* Tags */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Tags</h3>
                  <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-2 bg-purple-500/20 text-purple-200 rounded-lg text-sm border border-purple-500/30">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Add Note */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Adicionar Nota</h3>
                <div className="space-y-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Digite uma nota sobre o candidato..."
                  />
                  <button
                    onClick={() => {
                      if (newNote.trim()) {
                        // Add note logic here
                        setNewNote('');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Adicionar Nota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Etapas do Processo</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors">
                <Play className="w-4 h-4" />
                Avançar Etapa
              </button>
            </div>

            <div className="space-y-4">
              {candidate.steps.map((step, index) => (
                <div key={step.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500' :
                        step.status === 'in_progress' ? 'bg-blue-500/20 border-2 border-blue-500' :
                        step.status === 'blocked' ? 'bg-red-500/20 border-2 border-red-500' :
                        'bg-white/10 border-2 border-white/20'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <span className="text-white font-bold">{step.order}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{step.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getStepIcon(step.type)}
                          <span className="text-white/60 text-sm capitalize">{step.type}</span>
                          {step.required && (
                            <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded">
                              Obrigatória
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                        {getStatusLabel(step.status)}
                      </span>
                      {step.completedAt && (
                        <div className="text-white/60 text-xs mt-1">
                          {new Date(step.completedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {step.assignedTo && (
                    <div className="text-white/70 text-sm mb-2">
                      Responsável: {step.assignedTo}
                    </div>
                  )}

                  {step.notes && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
                      <p className="text-white/80 text-sm">{step.notes}</p>
                    </div>
                  )}

                  {step.documents && step.documents.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-white/70 text-sm font-medium">Documentos:</h5>
                      {step.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-white text-sm">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(doc.status)}`}>
                              {getStatusLabel(doc.status)}
                            </span>
                            <button className="p-1 text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Timeline de Atividades</h3>

            <div className="space-y-4">
              {candidate.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      {getTimelineIcon(event.type)}
                    </div>
                    {index < candidate.timeline.length - 1 && (
                      <div className="w-px h-8 bg-white/20 mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{event.title}</h4>
                      <span className="text-white/60 text-sm">
                        {new Date(event.timestamp).toLocaleDateString('pt-BR')} às {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{event.description}</p>
                    <span className="text-white/50 text-xs">Por: {event.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
};
