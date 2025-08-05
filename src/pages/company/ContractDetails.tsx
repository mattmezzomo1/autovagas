import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, FileText, PenTool, Shield, Download,
  Eye, Send, Copy, User, Calendar, Clock, CheckCircle,
  AlertTriangle, MapPin, Smartphone, Mail,
  Award, Lock, Unlock, RefreshCw, Edit, Save
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
    signature?: {
      type: 'digital' | 'drawn' | 'typed';
      data: string;
      certificate?: string;
    };
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

export const ContractDetails: React.FC = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'signers' | 'documents' | 'audit'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data
  useEffect(() => {
    const mockContract: Contract = {
      id: contractId || '1',
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
          location: 'São Paulo, SP',
          signature: {
            type: 'digital',
            data: 'signature_data_base64',
            certificate: 'ICP-Brasil A3'
          }
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria.santos@empresa.com',
          role: 'company',
          status: 'signed',
          signedAt: '2024-01-15T16:00:00Z',
          ipAddress: '192.168.1.50',
          location: 'São Paulo, SP',
          signature: {
            type: 'digital',
            data: 'signature_data_base64',
            certificate: 'ICP-Brasil A3'
          }
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
          details: 'Contrato assinado digitalmente com certificado ICP-Brasil',
          ipAddress: '192.168.1.100'
        },
        {
          timestamp: '2024-01-15T16:00:00Z',
          action: 'Assinatura Digital',
          user: 'Maria Santos',
          details: 'Contrato assinado pela empresa',
          ipAddress: '192.168.1.50'
        }
      ]
    };

    setContract(mockContract);
    setIsLoading(false);
  }, [contractId]);

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

  const getSignerStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-400 bg-gray-500/20';
      case 'sent': return 'text-blue-400 bg-blue-500/20';
      case 'viewed': return 'text-yellow-400 bg-yellow-500/20';
      case 'signed': return 'text-green-400 bg-green-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getSignerStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'sent': return 'Enviado';
      case 'viewed': return 'Visualizado';
      case 'signed': return 'Assinado';
      default: return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'candidate': return 'Candidato';
      case 'company': return 'Empresa';
      case 'witness': return 'Testemunha';
      default: return role;
    }
  };

  const getSignatureTypeIcon = (type: string) => {
    switch (type) {
      case 'digital': return <Award className="w-4 h-4 text-green-400" />;
      case 'drawn': return <PenTool className="w-4 h-4 text-blue-400" />;
      case 'typed': return <Edit className="w-4 h-4 text-purple-400" />;
      default: return <PenTool className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (!contract) {
    return (
      <CompanyLayout title="Contrato não encontrado" description="">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Contrato não encontrado</h3>
          <p className="text-white/60 mb-4">O contrato solicitado não existe ou foi removido</p>
          <button
            onClick={() => navigate('/company/digital-signature')}
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
      title={contract.title}
      description={`${contract.metadata.position} • ${contract.metadata.department}`}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/digital-signature')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Download
          </button>
          {contract.status === 'draft' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors">
              <Send className="w-4 h-4" />
              Enviar
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
            <Eye className="w-4 h-4" />
            Visualizar PDF
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Contract Header */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                <PenTool className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{contract.candidateName}</h2>
                <p className="text-white/70 text-lg">{contract.metadata.position}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {contract.candidateEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Início: {new Date(contract.metadata.startDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(contract.status)}`}>
                {contract.status === 'signed' && <CheckCircle className="w-4 h-4" />}
                {contract.status === 'sent' && <Send className="w-4 h-4" />}
                {contract.status === 'viewed' && <Eye className="w-4 h-4" />}
                {contract.status === 'expired' && <Clock className="w-4 h-4" />}
                {getStatusLabel(contract.status)}
              </div>
              <div className="mt-2 text-white/60 text-sm">
                Template: {contract.templateName}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <div className="text-xs text-white/60">Criado</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <User className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {contract.signers.filter(s => s.status === 'signed').length}/{contract.signers.length}
              </div>
              <div className="text-xs text-white/60">Assinado</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{contract.documents.length}</div>
              <div className="text-xs text-white/60">Documentos</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">100%</div>
              <div className="text-xs text-white/60">Segurança</div>
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
              <FileText className="w-4 h-4" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('signers')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'signers'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Signatários
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Download className="w-4 h-4" />
              Documentos
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" />
              Auditoria
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Information */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informações do Contrato</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">Tipo de Contrato</label>
                    <div className="text-white mt-1 capitalize">{contract.type}</div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Template</label>
                    <div className="text-white mt-1">{contract.templateName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">Data de Criação</label>
                    <div className="text-white mt-1">
                      {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Data de Envio</label>
                    <div className="text-white mt-1">
                      {contract.sentAt ? new Date(contract.sentAt).toLocaleDateString('pt-BR') : 'Não enviado'}
                    </div>
                  </div>
                </div>

                {contract.expiresAt && (
                  <div>
                    <label className="text-white/70 text-sm">Data de Expiração</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">
                        {new Date(contract.expiresAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}

                {contract.metadata.salary && (
                  <div>
                    <label className="text-white/70 text-sm">Salário</label>
                    <div className="text-white mt-1 font-medium">
                      R$ {contract.metadata.salary.toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}

                {contract.metadata.benefits && contract.metadata.benefits.length > 0 && (
                  <div>
                    <label className="text-white/70 text-sm">Benefícios</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {contract.metadata.benefits.map((benefit, index) => (
                        <span key={index} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-lg text-sm border border-green-500/30">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Signing Progress */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Progresso de Assinatura</h3>

              <div className="space-y-4">
                {contract.signers.map((signer, index) => (
                  <div key={signer.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      signer.status === 'signed' ? 'bg-green-500/20 border-2 border-green-500' :
                      signer.status === 'viewed' ? 'bg-yellow-500/20 border-2 border-yellow-500' :
                      signer.status === 'sent' ? 'bg-blue-500/20 border-2 border-blue-500' :
                      'bg-white/10 border-2 border-white/20'
                    }`}>
                      {signer.status === 'signed' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{signer.name}</h4>
                          <p className="text-white/60 text-sm">{getRoleLabel(signer.role)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getSignerStatusColor(signer.status)}`}>
                          {getSignerStatusLabel(signer.status)}
                        </span>
                      </div>

                      {signer.signedAt && (
                        <div className="text-white/50 text-xs mt-1">
                          Assinado em: {new Date(signer.signedAt).toLocaleDateString('pt-BR')} às {new Date(signer.signedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/70">Progresso de Assinatura</span>
                  <span className="text-white font-medium">
                    {contract.signers.filter(s => s.status === 'signed').length}/{contract.signers.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(contract.signers.filter(s => s.status === 'signed').length / contract.signers.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signers' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Detalhes dos Signatários</h3>

            <div className="space-y-6">
              {contract.signers.map((signer) => (
                <div key={signer.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {signer.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{signer.name}</h4>
                        <p className="text-white/60 text-sm">{getRoleLabel(signer.role)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span className="text-white/70 text-sm">{signer.email}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSignerStatusColor(signer.status)}`}>
                      {getSignerStatusLabel(signer.status)}
                    </span>
                  </div>

                  {signer.status === 'signed' && signer.signature && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        {getSignatureTypeIcon(signer.signature.type)}
                        <h5 className="font-medium text-white">Assinatura Digital</h5>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-white/70 text-sm">Tipo</label>
                          <div className="text-white mt-1 capitalize">{signer.signature.type}</div>
                        </div>

                        {signer.signature.certificate && (
                          <div>
                            <label className="text-white/70 text-sm">Certificado</label>
                            <div className="text-white mt-1">{signer.signature.certificate}</div>
                          </div>
                        )}

                        <div>
                          <label className="text-white/70 text-sm">Data/Hora</label>
                          <div className="text-white mt-1">
                            {signer.signedAt && new Date(signer.signedAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      {signer.ipAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="text-white/70 text-sm">IP Address</label>
                            <div className="text-white mt-1 font-mono text-sm">{signer.ipAddress}</div>
                          </div>

                          {signer.location && (
                            <div>
                              <label className="text-white/70 text-sm">Localização</label>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-purple-400" />
                                <span className="text-white text-sm">{signer.location}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {signer.status !== 'signed' && (
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                        <Send className="w-4 h-4" />
                        Reenviar
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg transition-colors text-sm">
                        <RefreshCw className="w-4 h-4" />
                        Lembrete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Documentos do Contrato</h3>

            <div className="space-y-4">
              {contract.documents.map((document) => (
                <div key={document.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{document.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                          <span>{document.pages} página(s)</span>
                          <span>{formatFileSize(document.size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Trilha de Auditoria</h3>

            <div className="space-y-4">
              {contract.auditTrail.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                      <Shield className="w-4 h-4 text-purple-400" />
                    </div>
                    {index < contract.auditTrail.length - 1 && (
                      <div className="w-px h-8 bg-white/20 mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{event.action}</h4>
                      <span className="text-white/60 text-sm">
                        {new Date(event.timestamp).toLocaleDateString('pt-BR')} às {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{event.details}</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>Por: {event.user}</span>
                      <span>IP: {event.ipAddress}</span>
                    </div>
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
