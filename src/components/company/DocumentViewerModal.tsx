import React, { useState } from 'react';
import { 
  X, Download, CheckCircle, AlertTriangle, User, 
  Calendar, FileText, Brain, Shield, Zap, Clock,
  ThumbsUp, ThumbsDown, MessageSquare, Edit, Save
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

interface DocumentViewerModalProps {
  document: DocumentFile | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (documentId: string, notes: string) => void;
  onReject?: (documentId: string, notes: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'analysis' | 'history'>('preview');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  if (!isOpen || !document) return null;

  const handleApprove = () => {
    if (onApprove) {
      onApprove(document.id, reviewNotes);
      setReviewNotes('');
      setIsReviewing(false);
      onClose();
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(document.id, reviewNotes);
      setReviewNotes('');
      setIsReviewing(false);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'requires_review': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'processing': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated': return 'Validado';
      case 'rejected': return 'Rejeitado';
      case 'requires_review': return 'Requer Revisão';
      case 'processing': return 'Processando';
      default: return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{document.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {document.candidateName}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {document.stepName}
                </span>
                <span>{formatFileSize(document.size)}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(document.status)}`}>
                {getStatusLabel(document.status)}
              </span>
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
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('analysis')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm">Análise IA</span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'history'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">Histórico</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <h4 className="text-white/70 text-sm font-medium mb-3">Ações</h4>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                Download
              </button>
              
              {document.status === 'requires_review' && (
                <>
                  <button
                    onClick={() => setIsReviewing(!isReviewing)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    {isReviewing ? 'Cancelar' : 'Revisar'}
                  </button>
                </>
              )}
            </div>

            {/* Review Section */}
            {isReviewing && (
              <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white/70 text-sm font-medium mb-3">Revisão Manual</h4>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Adicione suas observações..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Aprovar
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors text-sm"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    Rejeitar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  {document.type.startsWith('image/') ? (
                    <img
                      src={document.url}
                      alt={document.name}
                      className="max-w-full max-h-96 mx-auto rounded-lg"
                    />
                  ) : document.type === 'application/pdf' ? (
                    <div className="py-12">
                      <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Documento PDF</h3>
                      <p className="text-white/60 mb-4">Clique em download para visualizar o arquivo completo</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors mx-auto">
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </button>
                    </div>
                  ) : (
                    <div className="py-12">
                      <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Preview não disponível</h3>
                      <p className="text-white/60">Tipo de arquivo não suportado para preview</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {document.aiAnalysis ? (
                  <>
                    {/* AI Analysis Header */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">Análise por Inteligência Artificial</h3>
                          <p className="text-white/60 text-sm">Processamento automático com OCR e validação</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{document.aiAnalysis.confidence}%</div>
                          <div className="text-xs text-white/60">Confiança</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{document.aiAnalysis.documentType}</div>
                          <div className="text-xs text-white/60">Tipo Detectado</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{Object.keys(document.aiAnalysis.extractedData).length}</div>
                          <div className="text-xs text-white/60">Campos Extraídos</div>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Data */}
                    {Object.keys(document.aiAnalysis.extractedData).length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-400" />
                          Dados Extraídos Automaticamente
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(document.aiAnalysis.extractedData).map(([key, value]) => (
                            <div key={key} className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="text-sm text-white/60 capitalize mb-1">{key}</div>
                              <div className="text-white font-medium">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Issues */}
                    {document.aiAnalysis.issues.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          Problemas Identificados
                        </h4>
                        <div className="space-y-3">
                          {document.aiAnalysis.issues.map((issue, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              issue.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                              issue.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' :
                              'bg-blue-500/10 border-blue-500/20 text-blue-200'
                            }`}>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium">{issue.message}</div>
                                  {issue.field && (
                                    <div className="text-xs opacity-80 mt-1">Campo: {issue.field}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {document.aiAnalysis.recommendations.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-400" />
                          Recomendações
                        </h4>
                        <ul className="space-y-2">
                          {document.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-white/80">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Análise não disponível</h3>
                    <p className="text-white/60">Este documento ainda não foi processado pela IA</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Histórico de Validação</h3>
                
                <div className="space-y-4">
                  {document.validationHistory.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                          <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        {index < document.validationHistory.length - 1 && (
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
                        <span className="text-white/50 text-xs">Por: {event.user}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual Review */}
                {document.manualReview && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-400" />
                      <h4 className="font-medium text-white">Revisão Manual</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        document.manualReview.approved ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                      }`}>
                        {document.manualReview.approved ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{document.manualReview.notes}</p>
                    <div className="text-xs text-white/60">
                      Por: {document.manualReview.reviewedBy} • {new Date(document.manualReview.reviewedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
