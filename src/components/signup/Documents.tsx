import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { Upload, X, Loader2, Wand2, Mic, ArrowRight, ArrowLeft, CheckCircle, ExternalLink, Github, Globe, FileText, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

interface DocumentsProps {
  demoMode?: boolean;
}

export const Documents: React.FC<DocumentsProps> = ({ demoMode = true }) => {
  const { profile, updateProfile, completeStep } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInputMethod, setAiInputMethod] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mockResume, setMockResume] = useState<File | null>(null);

  // Create a mock resume file for demo mode (only if explicitly requested)
  useEffect(() => {
    if (demoMode && !profile.resume && mockResume) {
      // Only set mock resume if we have one and no real resume exists
      updateProfile({ resume: mockResume });
    }
  }, [demoMode, profile.resume, updateProfile, mockResume]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeStep(3);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecione apenas arquivos PDF.');
        return;
      }

      // Validar tamanho do arquivo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 10MB.');
        return;
      }

      setUploading(true);

      try {
        // Aqui você implementaria a lógica real de upload para o servidor
        // Por enquanto, vamos simular o upload
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Salvar o arquivo no perfil
        updateProfile({ resume: file });

        console.log('Arquivo carregado com sucesso:', file.name);
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        alert('Erro ao fazer upload do arquivo. Tente novamente.');
      } finally {
        setUploading(false);
      }
    }
  };

  const generateAIResume = () => {
    setShowAIModal(true);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Aqui você implementaria a lógica real de gravação
    setTimeout(() => {
      setIsRecording(false);
      setAiInput("Sou desenvolvedor full-stack com 5 anos de experiência em React, Node.js e Python. Trabalhei em startups e empresas de médio porte, desenvolvendo aplicações web escaláveis. Tenho experiência com AWS, Docker e metodologias ágeis.");
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const generateResumeFromAI = async () => {
    if (!aiInput.trim()) {
      alert('Por favor, forneça informações sobre sua experiência profissional.');
      return;
    }

    setGenerating(true);

    try {
      // Simular chamada para API de IA
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock do currículo gerado
      const mockGeneratedResume = `
# João Silva
**Desenvolvedor Full-Stack**

## Contato
- Email: joao.silva@email.com
- Telefone: (11) 99999-9999
- LinkedIn: linkedin.com/in/joao-silva

## Resumo Profissional
Desenvolvedor full-stack com 5 anos de experiência em desenvolvimento de aplicações web escaláveis. Especialista em React, Node.js e Python, com sólida experiência em arquitetura de software e metodologias ágeis.

## Experiência Profissional

### Desenvolvedor Full-Stack Sênior | TechCorp (2021 - Presente)
- Desenvolvimento de aplicações web usando React e Node.js
- Implementação de arquiteturas escaláveis na AWS
- Liderança técnica de equipe de 4 desenvolvedores
- Redução de 40% no tempo de carregamento das aplicações

### Desenvolvedor Full-Stack | StartupXYZ (2019 - 2021)
- Desenvolvimento de MVP usando Python e React
- Implementação de CI/CD com Docker
- Colaboração em metodologias ágeis (Scrum)

## Habilidades Técnicas
- **Frontend:** React, TypeScript, HTML5, CSS3
- **Backend:** Node.js, Python, Express.js
- **Banco de Dados:** PostgreSQL, MongoDB
- **Cloud:** AWS, Docker, Kubernetes
- **Ferramentas:** Git, Jest, Webpack

## Formação
- Bacharelado em Ciência da Computação | Universidade XYZ (2015-2019)
      `;

      setGeneratedResume(mockGeneratedResume);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao gerar currículo:', error);
      alert('Erro ao gerar currículo. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const acceptGeneratedResume = () => {
    if (generatedResume) {
      // Converter o texto em um arquivo PDF (simulado)
      const blob = new Blob([generatedResume], { type: 'application/pdf' });
      const file = new File([blob], "curriculo-gerado-ia.pdf", { type: "application/pdf" });
      updateProfile({ resume: file });

      // Fechar modais
      setShowPreview(false);
      setShowAIModal(false);
      setGeneratedResume(null);
      setAiInput('');
    }
  };

  const rejectGeneratedResume = () => {
    setShowPreview(false);
    setGeneratedResume(null);
  };

  const removeFile = () => {
    updateProfile({ resume: undefined });
    setMockResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createDemoFile = () => {
    if (demoMode) {
      const mockFile = new File(["Demo resume content"], "curriculo-demo.pdf", { type: "application/pdf" });
      updateProfile({ resume: mockFile });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            LinkedIn
          </label>
          <div className="relative group">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 z-10" />
            <input
              type="url"
              value={profile.linkedinUrl || ''}
              onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
              className="input-field-with-icon group-hover:border-purple-400/30"
              placeholder="https://linkedin.com/in/seu-perfil"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            GitHub
          </label>
          <div className="relative group">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 z-10" />
            <input
              type="url"
              value={profile.githubUrl || ''}
              onChange={(e) => updateProfile({ githubUrl: e.target.value })}
              className="input-field-with-icon group-hover:border-purple-400/30"
              placeholder="https://github.com/seu-usuario"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Portfolio / Website Pessoal
          </label>
          <div className="relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 z-10" />
            <input
              type="url"
              value={profile.portfolioUrl || ''}
              onChange={(e) => updateProfile({ portfolioUrl: e.target.value })}
              className="input-field-with-icon group-hover:border-purple-400/30"
              placeholder="https://seu-portfolio.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-purple-200">
            Currículo
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Manual */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-lg font-medium text-purple-200 mb-2">Upload Manual</h3>
                <p className="text-sm text-purple-300/70 mb-4">
                  Faça upload do seu currículo existente
                </p>

                {profile.resume && !uploading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-200 font-medium mb-2">Arquivo carregado com sucesso!</p>
                      <p className="text-xs text-purple-300">{profile.resume.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remover arquivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {uploading ? (
                        <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
                      ) : (
                        <Upload className="h-12 w-12 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <label className="relative cursor-pointer">
                        <span className="btn-secondary">Escolher arquivo</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-purple-300/70">PDF até 10MB</p>
                    {demoMode && (
                      <button
                        type="button"
                        onClick={createDemoFile}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Usar arquivo de demonstração
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Geração por IA */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-lg font-medium text-purple-200 mb-2">Geração por IA</h3>
                <p className="text-sm text-purple-300/70 mb-4">
                  Deixe nossa IA gerar um currículo otimizado
                </p>

                {generating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
                    <p className="text-sm text-purple-200">Gerando seu currículo...</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={generateAIResume}
                    className="btn-primary w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Wand2 className="w-5 h-5" />
                    Gerar com IA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => updateProfile({ currentStep: 2 })}
            className="flex-1 btn-secondary group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar</span>
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary group"
          >
            <span>Próximo</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-purple-300/60 text-sm mt-4">
          Passo 3 de 4 - Documentos e Links
        </p>
      </form>

      {/* Modal de Geração por IA */}
      {showAIModal && !showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Geração de Currículo por IA
                </h3>
                <p className="text-purple-200">
                  Conte-nos sobre sua experiência profissional para gerar um currículo otimizado
                </p>
              </div>

              {/* Seleção do método de input */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setAiInputMethod('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    aiInputMethod === 'text'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Texto
                </button>
                <button
                  onClick={() => setAiInputMethod('voice')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    aiInputMethod === 'voice'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  Voz
                </button>
              </div>

              {/* Input por texto */}
              {aiInputMethod === 'text' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-purple-200">
                    Descreva sua experiência profissional
                  </label>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ex: Sou desenvolvedor full-stack com 5 anos de experiência em React e Node.js. Trabalhei em startups desenvolvendo aplicações web escaláveis..."
                    className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-purple-100 placeholder:text-purple-300/40 focus:ring-2 focus:ring-purple-500/70 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Input por voz */}
              {aiInputMethod === 'voice' && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center py-8">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-purple-300">
                    {isRecording ? 'Gravando... Fale sobre sua experiência profissional' : 'Clique para começar a gravar'}
                  </p>
                  {aiInput && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                      <p className="text-sm text-purple-200 mb-2">Texto transcrito:</p>
                      <p className="text-purple-100">{aiInput}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setAiInput('');
                    setGeneratedResume(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-purple-200 rounded-xl transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={generateResumeFromAI}
                  disabled={!aiInput.trim() || generating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Gerar Currículo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview do Currículo Gerado */}
      {showPreview && generatedResume && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl border border-white/20 shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Preview do Currículo Gerado
                </h3>
                <p className="text-purple-200">
                  Analise o currículo gerado e decida se deseja aceitar ou gerar novamente
                </p>
              </div>

              {/* Preview do currículo */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-96 overflow-y-auto">
                <pre className="text-purple-100 text-sm whitespace-pre-wrap font-mono">
                  {generatedResume}
                </pre>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-4">
                <button
                  onClick={rejectGeneratedResume}
                  className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-5 h-5" />
                  Gerar Novamente
                </button>
                <button
                  onClick={acceptGeneratedResume}
                  className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Aceitar Currículo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};