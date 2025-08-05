import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  FileText, PenTool, Shield, Download, Eye, 
  Plus, Search, Filter, Clock, CheckCircle, 
  AlertTriangle, User, Calendar, Send, Copy,
  Signature, Certificate, Lock, Unlock, Zap
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  type: 'employment' | 'nda' | 'freelance' | 'internship' | 'custom';
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'expired' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  expiresAt?: string;
  templateId: string;
  templateName: string;
  signers: {
    id: string;
    name: string;
    email: string;
    role: 'candidate' | 'company' | 'witness';
    status: 'pending' | 'sent' | 'viewed' | 'signed';
    signedAt?: string;
    ipAddress?: string;
    location?: string;
  }[];
  documents: {
    id: string;
    name: string;
    url: string;
    pages: number;
    size: number;
  }[];
  metadata: {
    position: string;
    department: string;
    startDate: string;
    salary?: number;
    benefits?: string[];
  };
  auditTrail: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
    ipAddress: string;
  }[];
}

interface ContractTemplate {
  id: string;
  name: string;
  type: 'employment' | 'nda' | 'freelance' | 'internship' | 'custom';
  description: string;
  fields: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }[];
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DigitalSignature: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'contracts' | 'templates'>('contracts');

  // Mock data
  useEffect(() => {
    const mockContracts: Contract[] = [
      {
        id: '1',
        title: 'Contrato de Trabalho - Ana Silva',
        type: 'employment',
        candidateId: '1',
        candidateName: 'Ana Silva',
        candidateEmail: 'ana.silva@email.com',
        status: 'signed',
        createdAt: '2024-01-15T10:30:00Z',
        sentAt: '2024-01-15T11:00:00Z',
        viewedAt: '2024-01-15T14:20:00Z',
        signedAt: '2024-01-15T15:45:00Z',
        expiresAt: '2024-01-22T11:00:00Z',
        templateId: '1',
        templateName: 'Contrato CLT Padrão',
        signers: [
          {
            id: '1',
            name: 'Ana Silva',
            email: 'ana.silva@email.com',
            role: 'candidate',
            status: 'signed',
            signedAt: '2024-01-15T15:45:00Z',
            ipAddress: '192.168.1.100',
            location: 'São Paulo, SP'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria.santos@empresa.com',
            role: 'company',
            status: 'signed',
            signedAt: '2024-01-15T16:00:00Z',
            ipAddress: '192.168.1.50',
            location: 'São Paulo, SP'
          }
        ],
        documents: [
          {
            id: '1',
            name: 'Contrato_Ana_Silva.pdf',
            url: '/contracts/ana_silva.pdf',
            pages: 5,
            size: 2048576
          }
        ],
        metadata: {
          position: 'Desenvolvedora Full Stack Senior',
          department: 'Tecnologia',
          startDate: '2024-02-01',
          salary: 12000,
          benefits: ['Plano de Saúde', 'Vale Refeição', 'Home Office']
        },
        auditTrail: [
          {
            timestamp: '2024-01-15T10:30:00Z',
            action: 'Contrato Criado',
            user: 'Sistema',
            details: 'Contrato gerado a partir do template CLT Padrão',
            ipAddress: '192.168.1.10'
          },
          {
            timestamp: '2024-01-15T11:00:00Z',
            action: 'Contrato Enviado',
            user: 'Maria Santos',
            details: 'Contrato enviado para ana.silva@email.com',
            ipAddress: '192.168.1.50'
          },
          {
            timestamp: '2024-01-15T14:20:00Z',
            action: 'Contrato Visualizado',
            user: 'Ana Silva',
            details: 'Primeira visualização do contrato',
            ipAddress: '192.168.1.100'
          },
          {
            timestamp: '2024-01-15T15:45:00Z',
            action: 'Assinatura Digital',
            user: 'Ana Silva',
            details: 'Contrato assinado digitalmente',
            ipAddress: '192.168.1.100'
          }
        ]
      },
      {
        id: '2',
        title: 'Acordo de Confidencialidade - Carlos Santos',
        type: 'nda',
        candidateId: '2',
        candidateName: 'Carlos Santos',
        candidateEmail: 'carlos.santos@email.com',
        status: 'sent',
        createdAt: '2024-01-12T14:20:00Z',
        sentAt: '2024-01-12T14:30:00Z',
        expiresAt: '2024-01-19T14:30:00Z',
        templateId: '2',
        templateName: 'NDA Padrão',
        signers: [
          {
            id: '1',
            name: 'Carlos Santos',
            email: 'carlos.santos@email.com',
            role: 'candidate',
            status: 'sent'
          },
          {
            id: '2',
            name: 'João Oliveira',
            email: 'joao.oliveira@empresa.com',
            role: 'company',
            status: 'pending'
          }
        ],
        documents: [
          {
            id: '1',
            name: 'NDA_Carlos_Santos.pdf',
            url: '/contracts/nda_carlos.pdf',
            pages: 3,
            size: 1024000
          }
        ],
        metadata: {
          position: 'Analista de Marketing',
          department: 'Marketing',
          startDate: '2024-02-15'
        },
        auditTrail: [
          {
            timestamp: '2024-01-12T14:20:00Z',
            action: 'Contrato Criado',
            user: 'Sistema',
            details: 'NDA gerado para processo seletivo',
            ipAddress: '192.168.1.10'
          },
          {
            timestamp: '2024-01-12T14:30:00Z',
            action: 'Contrato Enviado',
            user: 'João Oliveira',
            details: 'NDA enviado para carlos.santos@email.com',
            ipAddress: '192.168.1.60'
          }
        ]
      },
      {
        id: '3',
        title: 'Contrato de Estágio - Pedro Costa',
        type: 'internship',
        candidateId: '4',
        candidateName: 'Pedro Costa',
        candidateEmail: 'pedro.costa@email.com',
        status: 'viewed',
        createdAt: '2024-01-10T16:45:00Z',
        sentAt: '2024-01-10T17:00:00Z',
        viewedAt: '2024-01-11T09:30:00Z',
        expiresAt: '2024-01-17T17:00:00Z',
        templateId: '3',
        templateName: 'Contrato de Estágio',
        signers: [
          {
            id: '1',
            name: 'Pedro Costa',
            email: 'pedro.costa@email.com',
            role: 'candidate',
            status: 'viewed'
          },
          {
            id: '2',
            name: 'Ana Costa',
            email: 'ana.costa@empresa.com',
            role: 'company',
            status: 'pending'
          }
        ],
        documents: [
          {
            id: '1',
            name: 'Estagio_Pedro_Costa.pdf',
            url: '/contracts/estagio_pedro.pdf',
            pages: 4,
            size: 1536000
          }
        ],
        metadata: {
          position: 'Estagiário de Design',
          department: 'Design',
          startDate: '2024-02-10'
        },
        auditTrail: [
          {
            timestamp: '2024-01-10T16:45:00Z',
            action: 'Contrato Criado',
            user: 'Sistema',
            details: 'Contrato de estágio gerado',
            ipAddress: '192.168.1.10'
          },
          {
            timestamp: '2024-01-10T17:00:00Z',
            action: 'Contrato Enviado',
            user: 'Ana Costa',
            details: 'Contrato enviado para pedro.costa@email.com',
            ipAddress: '192.168.1.70'
          },
          {
            timestamp: '2024-01-11T09:30:00Z',
            action: 'Contrato Visualizado',
            user: 'Pedro Costa',
            details: 'Contrato visualizado pelo candidato',
            ipAddress: '192.168.1.200'
          }
        ]
      }
    ];

    const mockTemplates: ContractTemplate[] = [
      {
        id: '1',
        name: 'Contrato CLT Padrão',
        type: 'employment',
        description: 'Template padrão para contratos de trabalho CLT com todos os termos legais',
        fields: [
          { name: 'candidateName', type: 'text', required: true, placeholder: 'Nome completo do candidato' },
          { name: 'position', type: 'text', required: true, placeholder: 'Cargo' },
          { name: 'department', type: 'text', required: true, placeholder: 'Departamento' },
          { name: 'salary', type: 'number', required: true, placeholder: 'Salário mensal' },
          { name: 'startDate', type: 'date', required: true },
          { name: 'workLocation', type: 'select', required: true, options: ['Presencial', 'Remoto', 'Híbrido'] }
        ],
        content: 'Template de contrato CLT...',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        name: 'NDA Padrão',
        type: 'nda',
        description: 'Acordo de confidencialidade para processos seletivos e projetos',
        fields: [
          { name: 'candidateName', type: 'text', required: true, placeholder: 'Nome completo' },
          { name: 'purpose', type: 'text', required: true, placeholder: 'Finalidade do acordo' },
          { name: 'duration', type: 'select', required: true, options: ['1 ano', '2 anos', '3 anos', '5 anos'] }
        ],
        content: 'Template de NDA...',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T15:00:00Z'
      },
      {
        id: '3',
        name: 'Contrato de Estágio',
        type: 'internship',
        description: 'Template para contratos de estágio com termos educacionais',
        fields: [
          { name: 'candidateName', type: 'text', required: true, placeholder: 'Nome do estagiário' },
          { name: 'institution', type: 'text', required: true, placeholder: 'Instituição de ensino' },
          { name: 'course', type: 'text', required: true, placeholder: 'Curso' },
          { name: 'duration', type: 'select', required: true, options: ['6 meses', '1 ano', '2 anos'] },
          { name: 'stipend', type: 'number', required: true, placeholder: 'Valor da bolsa' }
        ],
        content: 'Template de contrato de estágio...',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-08T12:00:00Z'
      }
    ];

    setContracts(mockContracts);
    setTemplates(mockTemplates);
    setFilteredContracts(mockContracts);
    setIsLoading(false);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = contracts;

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.templateName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(contract => contract.type === typeFilter);
    }

    setFilteredContracts(filtered);
  }, [contracts, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'sent': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'viewed': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'signed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'completed': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'expired': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviado';
      case 'viewed': return 'Visualizado';
      case 'signed': return 'Assinado';
      case 'completed': return 'Concluído';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'signed': return <PenTool className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employment': return '💼';
      case 'nda': return '🔒';
      case 'freelance': return '🤝';
      case 'internship': return '🎓';
      case 'custom': return '📄';
      default: return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'employment': return 'Contrato de Trabalho';
      case 'nda': return 'Acordo de Confidencialidade';
      case 'freelance': return 'Contrato Freelance';
      case 'internship': return 'Contrato de Estágio';
      case 'custom': return 'Personalizado';
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    sent: contracts.filter(c => c.status === 'sent').length,
    signed: contracts.filter(c => c.status === 'signed').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    expired: contracts.filter(c => c.status === 'expired').length
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
      title="Assinatura Digital"
      description="Gerencie contratos eletrônicos e assinaturas digitais com validade jurídica"
      actions={
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Relatório
          </button>
          <button
            onClick={() => navigate('/company/contracts/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Contrato
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
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/60">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.sent}</div>
                <div className="text-xs text-white/60">Enviados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <PenTool className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.signed}</div>
                <div className="text-xs text-white/60">Assinados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
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
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.expired}</div>
                <div className="text-xs text-white/60">Expirados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">100%</div>
                <div className="text-xs text-white/60">Segurança</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'contracts'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Contratos
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Copy className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <>
            {/* Search and Filters */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por título, candidato ou template..."
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
                    <option value="draft">Rascunho</option>
                    <option value="sent">Enviado</option>
                    <option value="viewed">Visualizado</option>
                    <option value="signed">Assinado</option>
                    <option value="completed">Concluído</option>
                    <option value="expired">Expirado</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="employment">Contrato de Trabalho</option>
                    <option value="nda">NDA</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Estágio</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contracts List */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Contratos ({filteredContracts.length})
                </h2>
              </div>

              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <div key={contract.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">
                          {getTypeIcon(contract.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{contract.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                            <User className="w-4 h-4" />
                            <span>{contract.candidateName}</span>
                            <span>•</span>
                            <span>{contract.candidateEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                            <span>{getTypeLabel(contract.type)}</span>
                            <span>•</span>
                            <span>Template: {contract.templateName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(contract.status)}`}>
                          {getStatusIcon(contract.status)}
                          {getStatusLabel(contract.status)}
                        </span>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white/70 text-sm">Criado</span>
                        </div>
                        <div className="text-white font-medium text-sm">
                          {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      {contract.sentAt && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Send className="w-4 h-4 text-green-400" />
                            <span className="text-white/70 text-sm">Enviado</span>
                          </div>
                          <div className="text-white font-medium text-sm">
                            {new Date(contract.sentAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}

                      {contract.signedAt && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <PenTool className="w-4 h-4 text-purple-400" />
                            <span className="text-white/70 text-sm">Assinado</span>
                          </div>
                          <div className="text-white font-medium text-sm">
                            {new Date(contract.signedAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}

                      {contract.expiresAt && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span className="text-white/70 text-sm">Expira</span>
                          </div>
                          <div className="text-white font-medium text-sm">
                            {new Date(contract.expiresAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Signers */}
                    <div className="mb-4">
                      <h4 className="text-white/70 text-sm font-medium mb-2">Signatários:</h4>
                      <div className="flex flex-wrap gap-2">
                        {contract.signers.map((signer) => (
                          <div key={signer.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                            signer.status === 'signed' ? 'bg-green-500/10 border-green-500/20 text-green-200' :
                            signer.status === 'viewed' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' :
                            signer.status === 'sent' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' :
                            'bg-gray-500/10 border-gray-500/20 text-gray-200'
                          }`}>
                            <User className="w-3 h-3" />
                            <span>{signer.name}</span>
                            <span className="text-xs opacity-80">({signer.role})</span>
                            {signer.status === 'signed' && <CheckCircle className="w-3 h-3" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    {contract.documents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-white/70 text-sm font-medium mb-2">Documentos:</h4>
                        <div className="space-y-2">
                          {contract.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-red-400" />
                                <span className="text-white text-sm">{doc.name}</span>
                                <span className="text-white/60 text-xs">
                                  {doc.pages} página(s) • {formatFileSize(doc.size)}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <button className="p-1 text-blue-400 hover:text-blue-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-green-400 hover:text-green-300">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/company/contracts/${contract.id}`)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </button>
                        {contract.status === 'draft' && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                            <Send className="w-4 h-4" />
                            Enviar
                          </button>
                        )}
                        {contract.status === 'sent' && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg transition-colors text-sm">
                            <Copy className="w-4 h-4" />
                            Reenviar
                          </button>
                        )}
                        <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>

                      <div className="text-right text-xs text-white/60">
                        <div>Cargo: {contract.metadata.position}</div>
                        <div>Departamento: {contract.metadata.department}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredContracts.length === 0 && (
                <div className="text-center py-12">
                  <PenTool className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum contrato encontrado</h3>
                  <p className="text-white/60 mb-4">Crie seu primeiro contrato ou ajuste os filtros de busca</p>
                  <button
                    onClick={() => navigate('/company/contracts/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Primeiro Contrato
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Templates de Contrato</h2>
                <p className="text-white/60 text-sm mt-1">Modelos pré-configurados para diferentes tipos de contrato</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Novo Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTypeIcon(template.type)}</div>
                      <div>
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        <span className="text-xs text-white/60 capitalize">{getTypeLabel(template.type)}</span>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${template.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </div>

                  <p className="text-white/70 text-sm mb-4">{template.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Campos:</span>
                      <span className="text-white font-medium">{template.fields.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Última atualização:</span>
                      <span className="text-white font-medium">
                        {new Date(template.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                      <Zap className="w-4 h-4" />
                      Usar Template
                    </button>
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
