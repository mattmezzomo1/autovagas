import React, { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle, Loader, FileText, Award, Users, Briefcase, Image } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface DocumentType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  acceptedTypes: string[];
  maxSize: number;
  description: string;
  color: string;
}

interface DocumentUploadModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUploadComplete: (file: File, type: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isVisible,
  onClose,
  onUploadComplete
}) => {
  const { addNotification } = useAppStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes: DocumentType[] = [
    {
      id: 'cv',
      name: 'Currículo',
      icon: FileText,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      maxSize: 10,
      description: 'Seu currículo principal ou versões alternativas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'cover_letter',
      name: 'Carta de Apresentação',
      icon: File,
      acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
      maxSize: 5,
      description: 'Cartas personalizadas para diferentes vagas',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'recommendation',
      name: 'Carta de Recomendação',
      icon: Users,
      acceptedTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
      maxSize: 5,
      description: 'Recomendações de ex-chefes ou colegas',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'portfolio',
      name: 'Portfólio Técnico',
      icon: Briefcase,
      acceptedTypes: ['.pdf', '.zip', '.rar'],
      maxSize: 50,
      description: 'Projetos, códigos e trabalhos técnicos',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'certificate',
      name: 'Certificados',
      icon: Award,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10,
      description: 'Certificações, diplomas e cursos',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'other',
      name: 'Outros Documentos',
      icon: Image,
      acceptedTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
      maxSize: 20,
      description: 'Qualquer outro documento relevante',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const validateFile = (file: File, type: DocumentType): string | null => {
    // Verificar tipo de arquivo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!type.acceptedTypes.includes(fileExtension)) {
      return `Tipo de arquivo não suportado para ${type.name}. Aceitos: ${type.acceptedTypes.join(', ')}`;
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > type.maxSize) {
      return `Arquivo muito grande para ${type.name}. Tamanho máximo: ${type.maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    if (!selectedType) {
      setError('Selecione um tipo de documento primeiro');
      return;
    }

    const docType = documentTypes.find(t => t.id === selectedType);
    if (!docType) return;

    const validationError = validateFile(file, docType);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const simulateUpload = (): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(Math.min(progress, 100));
      }, 300);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await simulateUpload();
      
      onUploadComplete(selectedFile, selectedType);
      addNotification({
        type: 'success',
        message: 'Documento enviado com sucesso!'
      });
      
      // Reset state
      setSelectedFile(null);
      setSelectedType(null);
      setUploadProgress(0);
      setUploading(false);
      onClose();
    } catch (error) {
      setError('Erro ao fazer upload do documento');
      setUploading(false);
      addNotification({
        type: 'error',
        message: 'Erro ao fazer upload do documento'
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'zip':
      case 'rar': return '📦';
      case 'txt': return '📃';
      default: return '📄';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Upload de Documentos</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!uploading ? (
            <>
              {/* Document Type Selection */}
              {!selectedType && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-4">Selecione o tipo de documento:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {documentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className="p-4 rounded-lg border border-slate-600 hover:border-blue-500 cursor-pointer transition-all duration-200 hover:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="text-white font-medium text-sm">{type.name}</h5>
                              <p className="text-gray-400 text-xs">
                                Até {type.maxSize}MB
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              {selectedType && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedType(null);
                          setSelectedFile(null);
                          setError(null);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        ← Voltar
                      </Button>
                    </div>
                    {(() => {
                      const type = documentTypes.find(t => t.id === selectedType);
                      if (!type) return null;
                      const Icon = type.icon;
                      return (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{type.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {type.acceptedTypes.join(', ')} • Até {type.maxSize}MB
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                      dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : selectedFile
                        ? 'border-green-500 bg-green-500/10'
                        : error
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={documentTypes.find(t => t.id === selectedType)?.acceptedTypes.join(',')}
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                        <div>
                          <p className="text-green-300 font-medium">Arquivo selecionado</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                            <div className="text-left">
                              <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-gray-400 text-xs">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="space-y-3">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                        <div>
                          <p className="text-red-300 font-medium">Erro no arquivo</p>
                          <p className="text-red-200 text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-white font-medium">
                            {dragActive ? 'Solte o arquivo aqui' : 'Clique ou arraste um arquivo'}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Formatos aceitos: {documentTypes.find(t => t.id === selectedType)?.acceptedTypes.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-slate-600 text-slate-300"
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedType || uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </>
          ) : (
            /* Upload Progress */
            <div className="space-y-6">
              <div className="text-center">
                <Loader className="w-12 h-12 text-blue-400 mx-auto animate-spin mb-4" />
                <h4 className="text-white font-medium mb-2">Enviando documento...</h4>
                <p className="text-gray-400 text-sm">{selectedFile?.name}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progresso</span>
                  <span className="text-blue-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-xs">
                  Por favor, não feche esta janela durante o upload
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
