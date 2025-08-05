import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Upload,
  FileText,
  Globe,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Brain,
  Sparkles,
  Users,
  MapPin,
  Calendar,
  Linkedin,
  Link2,
  Image
} from 'lucide-react';

interface CompanyData {
  name: string;
  cnpj: string;
  industry: string;
  size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  location: string;
  foundingYear: number;
  website: string;
  linkedinUrl: string;
  description: string;
  culture: string;
  benefits: string[];
  logo?: File;
  documents: File[];
  audioDescription?: Blob;
}

export const CompanyOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    cnpj: '',
    industry: '',
    size: 'small',
    location: '',
    foundingYear: new Date().getFullYear(),
    website: '',
    linkedinUrl: '',
    description: '',
    culture: '',
    benefits: [],
    documents: []
  });

  const steps = [
    { id: 1, title: 'Dados Básicos', description: 'Informações essenciais da empresa' },
    { id: 2, title: 'Documentos e Materiais', description: 'Upload de materiais institucionais' },
    { id: 3, title: 'Perfil e Cultura', description: 'Descreva sua empresa e cultura' },
    { id: 4, title: 'Análise da IA', description: 'Nossa IA está analisando seu perfil' }
  ];

  const industries = [
    'Tecnologia',
    'Saúde',
    'Educação',
    'Financeiro',
    'Varejo',
    'Manufatura',
    'Consultoria',
    'Marketing',
    'Outros'
  ];

  const companySizes = [
    { value: 'micro', label: '1-9 funcionários' },
    { value: 'small', label: '10-49 funcionários' },
    { value: 'medium', label: '50-249 funcionários' },
    { value: 'large', label: '250-999 funcionários' },
    { value: 'enterprise', label: '1000+ funcionários' }
  ];

  const handleInputChange = (field: keyof CompanyData, value: any) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null, type: 'logo' | 'documents') => {
    if (!files) return;
    
    if (type === 'logo') {
      handleInputChange('logo', files[0]);
    } else {
      const newDocuments = Array.from(files);
      handleInputChange('documents', [...companyData.documents, ...newDocuments]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        handleInputChange('audioDescription', blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      }, 120000); // 2 minutes max
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      
      if (currentStep === 3) {
        // Start AI analysis
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          navigate('/company');
        }, 3000);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: TechCorp Inovações"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={companyData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Setor *
                </label>
                <select
                  value={companyData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione o setor</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry} className="bg-slate-800">
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tamanho da Empresa *
                </label>
                <select
                  value={companyData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {companySizes.map(size => (
                    <option key={size.value} value={size.value} className="bg-slate-800">
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Localização *
                </label>
                <input
                  type="text"
                  value={companyData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ano de Fundação
                </label>
                <input
                  type="number"
                  value={companyData.foundingYear}
                  onChange={(e) => handleInputChange('foundingYear', parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  LinkedIn da Empresa
                </label>
                <input
                  type="url"
                  value={companyData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://linkedin.com/company/empresa"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Logo da Empresa
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'logo')}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Image className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Clique para fazer upload do logo</p>
                  <p className="text-white/40 text-sm mt-1">PNG, JPG até 5MB</p>
                </label>
              </div>
            </div>

            {/* Documents Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Materiais Institucionais
              </label>
              <p className="text-white/60 text-sm mb-4">
                Faça upload de documentos que descrevem sua empresa: apresentações, folders, manuais de cultura, etc.
              </p>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleFileUpload(e.target.files, 'documents')}
                  className="hidden"
                  id="documents-upload"
                />
                <label htmlFor="documents-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Clique para fazer upload dos documentos</p>
                  <p className="text-white/40 text-sm mt-1">PDF, DOC, PPT até 10MB cada</p>
                </label>
              </div>

              {companyData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-white/80 text-sm font-medium">Documentos enviados:</p>
                  {companyData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/60 text-sm">
                      <FileText className="w-4 h-4" />
                      {doc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descrição da Empresa
              </label>
              <textarea
                value={companyData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descreva sua empresa, o que fazem, missão, visão..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cultura e Valores
              </label>
              <textarea
                value={companyData.culture}
                onChange={(e) => handleInputChange('culture', e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descreva a cultura da empresa, valores, ambiente de trabalho..."
              />
            </div>

            {/* Audio Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descrição em Áudio (Opcional)
              </label>
              <p className="text-white/60 text-sm mb-4">
                Grave um áudio explicando sua cultura, valores e o perfil dos profissionais que busca
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4">
                  {!audioBlob ? (
                    <button
                      onClick={startRecording}
                      disabled={isRecording}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        isRecording
                          ? 'bg-red-500 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          Gravando... (máx 2min)
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Iniciar Gravação
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        Áudio gravado com sucesso
                      </div>
                      <button
                        onClick={() => setAudioBlob(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Gravar Novamente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Analisando seu Perfil
              </h3>
              <p className="text-white/60">
                Nossa IA está processando todas as informações para criar seu perfil inteligente
              </p>
            </div>

            {isAnalyzing && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
                <div className="space-y-2 text-white/60 text-sm">
                  <p>✓ Analisando documentos institucionais</p>
                  <p>✓ Processando descrição da empresa</p>
                  <p>✓ Identificando cultura e valores</p>
                  <p className="text-purple-400">→ Criando perfil inteligente...</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vinda à AutoVagas
          </h1>
          <p className="text-white/60">
            Vamos configurar o perfil da sua empresa para encontrar os melhores talentos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : 'border-white/20 text-white/40'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-purple-500' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-white/60">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all"
            >
              {currentStep === 3 ? 'Finalizar' : 'Próximo'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
