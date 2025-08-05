import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { DocumentViewerModal } from '../../components/company/DocumentViewerModal';
import {
  Upload, FileText, CheckCircle, AlertTriangle, X,
  Eye, Download, RefreshCw, Zap, Brain, Shield,
  Clock, User, Calendar, Search, Filter, Plus,
  Image, FileCheck, FileX, Loader, Camera, Scan
} from 'lucide-react';

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  candidateId: string;
  candidateName: string;
  stepId: string;
  stepName: string;
  status: 'pending' | 'processing' | 'validated' | 'rejected' | 'requires_review';
  validationScore: number;
  aiAnalysis?: {
    documentType: string;
    confidence: number;
    extractedData: Record<string, any>;
    issues: {
      type: 'warning' | 'error' | 'info';
      message: string;
      field?: string;
    }[];
    recommendations: string[];
  };
  manualReview?: {
    reviewedBy: string;
    reviewedAt: string;
    notes: string;
    approved: boolean;
  };
  validationHistory: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
}

export const DocumentValidation: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mock data
  useEffect(() => {
    const mockDocuments: DocumentFile[] = [
      {
        id: '1',
        name: 'RG_Ana_Silva.jpg',
        type: 'image/jpeg',
        size: 2048576,
        url: '/mock/rg_ana.jpg',
        uploadedAt: '2024-01-15T10:30:00Z',
        candidateId: '1',
        candidateName: 'Ana Silva',
        stepId: '1',
        stepName: 'Documentos Pessoais',
        status: 'validated',
        validationScore: 95,
        aiAnalysis: {
          documentType: 'RG',
          confidence: 95,
          extractedData: {
            nome: 'ANA SILVA',
            rg: '12.345.678-9',
            cpf: '123.456.789-00',
            nascimento: '15/05/1990',
            orgaoEmissor: 'SSP/SP'
          },
          issues: [],
          recommendations: ['Documento em excelente estado', 'Todos os dados foram extraídos com sucesso']
        },
        validationHistory: [
          {
            timestamp: '2024-01-15T10:35:00Z',
            action: 'Validação Automática',
            user: 'Sistema IA',
            details: 'Documento validado automaticamente com score 95%'
          }
        ]
      },
      {
        id: '2',
        name: 'CPF_Ana_Silva.pdf',
        type: 'application/pdf',
        size: 1024000,
        url: '/mock/cpf_ana.pdf',
        uploadedAt: '2024-01-15T10:32:00Z',
        candidateId: '1',
        candidateName: 'Ana Silva',
        stepId: '1',
        stepName: 'Documentos Pessoais',
        status: 'validated',
        validationScore: 98,
        aiAnalysis: {
          documentType: 'CPF',
          confidence: 98,
          extractedData: {
            nome: 'ANA SILVA',
            cpf: '123.456.789-00',
            situacao: 'REGULAR'
          },
          issues: [],
          recommendations: ['CPF válido e regular na Receita Federal']
        },
        validationHistory: [
          {
            timestamp: '2024-01-15T10:33:00Z',
            action: 'Validação Automática',
            user: 'Sistema IA',
            details: 'CPF validado na Receita Federal'
          }
        ]
      },
      {
        id: '3',
        name: 'Diploma_Carlos_Santos.jpg',
        type: 'image/jpeg',
        size: 3072000,
        url: '/mock/diploma_carlos.jpg',
        uploadedAt: '2024-01-12T14:20:00Z',
        candidateId: '2',
        candidateName: 'Carlos Santos',
        stepId: '2',
        stepName: 'Documentos Acadêmicos',
        status: 'requires_review',
        validationScore: 72,
        aiAnalysis: {
          documentType: 'Diploma',
          confidence: 72,
          extractedData: {
            nome: 'CARLOS SANTOS',
            curso: 'ENGENHARIA DE SOFTWARE',
            instituicao: 'UNIVERSIDADE FEDERAL DO RIO DE JANEIRO',
            dataColacao: '15/12/2020'
          },
          issues: [
            {
              type: 'warning',
              message: 'Qualidade da imagem pode afetar a leitura de alguns campos',
              field: 'qualidade'
            },
            {
              type: 'info',
              message: 'Instituição reconhecida pelo MEC',
              field: 'instituicao'
            }
          ],
          recommendations: [
            'Solicitar nova foto com melhor qualidade',
            'Verificar manualmente os dados extraídos'
          ]
        },
        validationHistory: [
          {
            timestamp: '2024-01-12T14:25:00Z',
            action: 'Análise IA',
            user: 'Sistema IA',
            details: 'Documento requer revisão manual devido à qualidade da imagem'
          }
        ]
      },
      {
        id: '4',
        name: 'Exame_Medico_Pedro.pdf',
        type: 'application/pdf',
        size: 512000,
        url: '/mock/exame_pedro.pdf',
        uploadedAt: '2024-01-10T16:45:00Z',
        candidateId: '4',
        candidateName: 'Pedro Costa',
        stepId: '3',
        stepName: 'Exames Médicos',
        status: 'rejected',
        validationScore: 25,
        aiAnalysis: {
          documentType: 'Exame Médico',
          confidence: 25,
          extractedData: {
            paciente: 'PEDRO COSTA',
            data: '05/01/2024',
            medico: 'DR. JOÃO SILVA'
          },
          issues: [
            {
              type: 'error',
              message: 'Documento não possui assinatura digital válida',
              field: 'assinatura'
            },
            {
              type: 'error',
              message: 'CRM do médico não foi encontrado no documento',
              field: 'crm'
            }
          ],
          recommendations: [
            'Solicitar novo exame com assinatura digital',
            'Verificar se o médico possui CRM válido'
          ]
        },
        manualReview: {
          reviewedBy: 'Maria Santos',
          reviewedAt: '2024-01-11T09:00:00Z',
          notes: 'Documento rejeitado por não atender aos requisitos mínimos de segurança',
          approved: false
        },
        validationHistory: [
          {
            timestamp: '2024-01-10T16:50:00Z',
            action: 'Análise IA',
            user: 'Sistema IA',
            details: 'Documento com problemas de validação'
          },
          {
            timestamp: '2024-01-11T09:00:00Z',
            action: 'Revisão Manual',
            user: 'Maria Santos',
            details: 'Documento rejeitado após revisão manual'
          }
        ]
      },
      {
        id: '5',
        name: 'Comprovante_Residencia_Maria.pdf',
        type: 'application/pdf',
        size: 768000,
        url: '/mock/comprovante_maria.pdf',
        uploadedAt: '2024-01-18T09:15:00Z',
        candidateId: '3',
        candidateName: 'Maria Oliveira',
        stepId: '1',
        stepName: 'Documentos Pessoais',
        status: 'processing',
        validationScore: 0,
        validationHistory: [
          {
            timestamp: '2024-01-18T09:15:00Z',
            action: 'Upload',
            user: 'Maria Oliveira',
            details: 'Documento enviado para análise'
          }
        ]
      }
    ];

    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
    setIsLoading(false);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.stepName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.aiAnalysis?.documentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    try {
      // Simular upload e processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Array.from(files).forEach(file => {
        const newDoc: DocumentFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          candidateId: '1',
          candidateName: 'Novo Candidato',
          stepId: '1',
          stepName: 'Documentos Pessoais',
          status: 'processing',
          validationScore: 0,
          validationHistory: [
            {
              timestamp: new Date().toISOString(),
              action: 'Upload',
              user: 'Sistema',
              details: 'Documento enviado para análise'
            }
          ]
        };

        setDocuments(prev => [newDoc, ...prev]);
      });
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'processing': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'validated': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'requires_review': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'validated': return 'Validado';
      case 'rejected': return 'Rejeitado';
      case 'requires_review': return 'Requer Revisão';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Loader className="w-4 h-4 animate-spin" />;
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <FileX className="w-4 h-4" />;
      case 'requires_review': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-400" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    processing: documents.filter(d => d.status === 'processing').length,
    validated: documents.filter(d => d.status === 'validated').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
    requiresReview: documents.filter(d => d.status === 'requires_review').length
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
      title="Validação de Documentos"
      description="Sistema inteligente de upload, validação e verificação de documentos com IA"
      actions={
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
            <Scan className="w-4 h-4" />
            Processar Lote
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
                <Loader className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.processing}</div>
                <div className="text-xs text-white/60">Processando</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.validated}</div>
                <div className="text-xs text-white/60">Validados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.requiresReview}</div>
                <div className="text-xs text-white/60">Revisão</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FileX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.rejected}</div>
                <div className="text-xs text-white/60">Rejeitados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {Math.round(documents.reduce((acc, d) => acc + d.validationScore, 0) / documents.length) || 0}%
                </div>
                <div className="text-xs text-white/60">Score Médio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                <h3 className="text-lg font-medium text-white">Processando documentos...</h3>
                <p className="text-white/60">Aguarde enquanto analisamos os arquivos com IA</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Arraste documentos aqui</h3>
                  <p className="text-white/60 mb-4">ou clique para selecionar arquivos</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Selecionar Arquivos
                  </label>
                </div>
                <div className="text-xs text-white/50">
                  Formatos aceitos: JPG, PNG, PDF • Tamanho máximo: 10MB por arquivo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do arquivo, candidato ou tipo de documento..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
              <option value="validated">Validado</option>
              <option value="requires_review">Requer Revisão</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Documentos ({filteredDocuments.length})
            </h2>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      {getFileIcon(document.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{document.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                        <User className="w-4 h-4" />
                        <span>{document.candidateName}</span>
                        <span>•</span>
                        <span>{document.stepName}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {document.validationScore > 0 && (
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          document.validationScore >= 80 ? 'text-green-400' :
                          document.validationScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {document.validationScore}%
                        </div>
                        <div className="text-xs text-white/60">Score IA</div>
                      </div>
                    )}

                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                      {getStatusLabel(document.status)}
                    </span>
                  </div>
                </div>

                {/* AI Analysis */}
                {document.aiAnalysis && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <h4 className="font-medium text-white">Análise IA</h4>
                      <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                        {document.aiAnalysis.documentType}
                      </span>
                      <span className="text-xs text-white/60">
                        Confiança: {document.aiAnalysis.confidence}%
                      </span>
                    </div>

                    {/* Extracted Data */}
                    {Object.keys(document.aiAnalysis.extractedData).length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-white/80 mb-2">Dados Extraídos:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(document.aiAnalysis.extractedData).map(([key, value]) => (
                            <div key={key} className="bg-white/5 rounded p-2 border border-white/10">
                              <div className="text-xs text-white/60 capitalize">{key}</div>
                              <div className="text-sm text-white font-medium">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Issues */}
                    {document.aiAnalysis.issues.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-white/80 mb-2">Problemas Identificados:</h5>
                        <div className="space-y-1">
                          {document.aiAnalysis.issues.map((issue, index) => (
                            <div key={index} className={`flex items-start gap-2 p-2 rounded text-sm ${
                              issue.type === 'error' ? 'bg-red-500/10 text-red-200' :
                              issue.type === 'warning' ? 'bg-yellow-500/10 text-yellow-200' :
                              'bg-blue-500/10 text-blue-200'
                            }`}>
                              {issue.type === 'error' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                              {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                              {issue.type === 'info' && <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                              <span>{issue.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {document.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-white/80 mb-2">Recomendações:</h5>
                        <ul className="space-y-1">
                          {document.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                              <Zap className="w-3 h-3 mt-1 text-green-400 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Review */}
                {document.manualReview && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <h4 className="font-medium text-white">Revisão Manual</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        document.manualReview.approved ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                      }`}>
                        {document.manualReview.approved ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{document.manualReview.notes}</p>
                    <div className="text-xs text-white/60">
                      Por: {document.manualReview.reviewedBy} • {new Date(document.manualReview.reviewedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    {document.status === 'requires_review' && (
                      <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Revisar
                      </button>
                    )}
                    {document.status === 'processing' && (
                      <button className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg transition-colors text-sm">
                        <RefreshCw className="w-4 h-4" />
                        Reprocessar
                      </button>
                    )}
                  </div>

                  <div className="text-right text-xs text-white/60">
                    <div>Enviado em: {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}</div>
                    <div>{new Date(document.uploadedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum documento encontrado</h3>
              <p className="text-white/60">Faça upload de documentos ou ajuste os filtros de busca</p>
            </div>
          )}
        </div>

        {/* Document Viewer Modal */}
        <DocumentViewerModal
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onApprove={(documentId, notes) => {
            // Update document status to validated
            setDocuments(prev => prev.map(doc =>
              doc.id === documentId
                ? {
                    ...doc,
                    status: 'validated' as const,
                    manualReview: {
                      reviewedBy: 'Usuário Atual',
                      reviewedAt: new Date().toISOString(),
                      notes,
                      approved: true
                    },
                    validationHistory: [
                      ...doc.validationHistory,
                      {
                        timestamp: new Date().toISOString(),
                        action: 'Aprovação Manual',
                        user: 'Usuário Atual',
                        details: `Documento aprovado: ${notes}`
                      }
                    ]
                  }
                : doc
            ));
          }}
          onReject={(documentId, notes) => {
            // Update document status to rejected
            setDocuments(prev => prev.map(doc =>
              doc.id === documentId
                ? {
                    ...doc,
                    status: 'rejected' as const,
                    manualReview: {
                      reviewedBy: 'Usuário Atual',
                      reviewedAt: new Date().toISOString(),
                      notes,
                      approved: false
                    },
                    validationHistory: [
                      ...doc.validationHistory,
                      {
                        timestamp: new Date().toISOString(),
                        action: 'Rejeição Manual',
                        user: 'Usuário Atual',
                        details: `Documento rejeitado: ${notes}`
                      }
                    ]
                  }
                : doc
            ));
          }}
        />
      </div>
    </CompanyLayout>
  );
};
