import React, { useState, useRef, useEffect } from 'react';
import { Search, BriefcaseIcon, Star, Clock, Building2, MapPin, Banknote, Zap, X, Bot, Activity, ExternalLink, FileText, Users, Sparkles, Plus, Share2, Heart, Bookmark, MoreHorizontal, MessageSquare, Upload, ArrowRight, Globe, Link2, BookOpen, Eye, Edit3, Save, Wand2, Download, Loader2, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { SubscriptionCard } from '../components/dashboard/SubscriptionCard';
import { AutoApplyConfigModal } from '../components/dashboard/AutoApplyConfigModal';
import { UpgradePlanModal } from '../components/dashboard/UpgradePlanModal';
import { PlatformLoginModal } from '../components/dashboard/PlatformLoginModal';
import { RobotPaywallModal } from '../components/dashboard/RobotPaywallModal';
import { ExtensionInstallButton } from '../components/dashboard/ExtensionInstallButton';
import { BillingToggle } from '../components/dashboard/BillingToggle';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { documentService } from '../services/document.service';
import { platformAuthService } from '../services/platformAuth.service';
import { useAutoApplyRobot } from '../hooks/useAutoApplyRobot';
import { CourseRecommendations } from '../components/dashboard/CourseRecommendations';

// Tipos para aplicações
interface Application {
  id: string;
  title: string;
  company: string;
  location: string;
  appliedAt: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  source: 'internal' | 'linkedin' | 'infojobs' | 'catho' | 'indeed' | 'vagas';
  externalUrl?: string; // URL da vaga na plataforma externa
  jobId?: string; // ID da vaga no nosso sistema (para vagas internas)
}

// Tipos para vagas sugeridas
interface SuggestedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  workModel: string;
  description: string;
  skills: string[];
  source: 'internal' | 'linkedin' | 'infojobs' | 'catho' | 'indeed' | 'vagas';
  externalUrl?: string; // URL da vaga na plataforma externa
  jobUrl?: string; // URL da vaga interna
  isAddedToQueue?: boolean; // Se foi adicionada à fila de aplicação
}

export const Dashboard: React.FC = () => {
  const { profile, plans, toggleAutoApply, updateRobotActivity, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'applications'>('feed');
  const [showPlans, setShowPlans] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAutoApplyConfigModal, setShowAutoApplyConfigModal] = useState(false);
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);

  // Estados para o card de currículo
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeContent, setResumeContent] = useState('');
  const [showAIImproveModal, setShowAIImproveModal] = useState(false);
  const [isGeneratingImprovement, setIsGeneratingImprovement] = useState(false);
  const [improvedResume, setImprovedResume] = useState('');
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);

  // Estados para conexão com plataformas
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [platformConnections, setPlatformConnections] = useState<Record<string, boolean>>({});

  // Estados para paywall do robô
  const [showRobotPaywall, setShowRobotPaywall] = useState(false);
  const [paywallActionType, setPaywallActionType] = useState<'auto-apply' | 'scraper' | 'general'>('general');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Estado para controlar vagas adicionadas à fila
  const [queuedJobs, setQueuedJobs] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dados de exemplo para aplicações
  const applications: Application[] = [
    {
      id: '1',
      title: 'Desenvolvedor Full Stack Senior',
      company: 'TechCorp Inc.',
      location: 'São Paulo, SP',
      appliedAt: '12 de março de 2024',
      status: 'reviewing',
      source: 'internal',
      jobId: 'job-123'
    },
    {
      id: '2',
      title: 'Frontend Developer React',
      company: 'StartupXYZ',
      location: 'Remoto',
      appliedAt: '10 de março de 2024',
      status: 'pending',
      source: 'linkedin',
      externalUrl: 'https://www.linkedin.com/jobs/view/3456789'
    },
    {
      id: '3',
      title: 'Backend Developer Node.js',
      company: 'BigTech Solutions',
      location: 'Rio de Janeiro, RJ',
      appliedAt: '8 de março de 2024',
      status: 'interview',
      source: 'infojobs',
      externalUrl: 'https://www.infojobs.com.br/vaga/backend-developer-nodejs'
    }
  ];

  // Dados de exemplo para vagas sugeridas
  const suggestedJobs: SuggestedJob[] = [
    {
      id: 'job-1',
      title: 'Desenvolvedor Full Stack Senior',
      company: 'TechCorp Inc.',
      location: 'São Paulo, SP',
      salary: 'R$ 15k - 20k',
      workModel: 'Remoto',
      description: 'Estamos procurando um desenvolvedor Full Stack Senior para se juntar ao nosso time...',
      skills: ['React', 'Node.js', 'TypeScript'],
      source: 'internal',
      jobUrl: '/job/job-1'
    },
    {
      id: 'job-2',
      title: 'Frontend Developer React',
      company: 'StartupXYZ',
      location: 'Remoto',
      salary: 'R$ 12k - 18k',
      workModel: 'Remoto',
      description: 'Buscamos um desenvolvedor frontend especializado em React para criar interfaces incríveis...',
      skills: ['React', 'JavaScript', 'CSS'],
      source: 'linkedin',
      externalUrl: 'https://www.linkedin.com/jobs/view/3456789'
    },
    {
      id: 'job-3',
      title: 'Backend Developer Node.js',
      company: 'BigTech Solutions',
      location: 'Rio de Janeiro, RJ',
      salary: 'R$ 10k - 15k',
      workModel: 'Híbrido',
      description: 'Oportunidade para trabalhar com tecnologias modernas em projetos desafiadores...',
      skills: ['Node.js', 'MongoDB', 'AWS'],
      source: 'infojobs',
      externalUrl: 'https://www.infojobs.com.br/vaga/backend-developer-nodejs'
    }
  ];
  const {
    configureRobot,
    activateRobot,
    deactivateRobot,
    isActive: isRobotActive
  } = useAutoApplyRobot();

  // Verifica se o usuário tem um plano que permite auto-aplicação
  const hasEligiblePlan = () => {
    // Agora todos os planos (basic, plus, premium) permitem automação
    return profile.subscription?.plan === 'basic' ||
           profile.subscription?.plan === 'plus' ||
           profile.subscription?.plan === 'premium';
  };

  // Efeito para sincronizar o estado do robô com o estado da aplicação
  useEffect(() => {
    // Se o robô estiver ativo mas o estado da aplicação diz que está inativo
    if (isRobotActive && !profile.subscription?.autoApply) {
      deactivateRobot().catch(console.error);
    }
    // Se o robô estiver inativo mas o estado da aplicação diz que está ativo
    else if (!isRobotActive && profile.subscription?.autoApply) {
      // Verifica se o usuário tem um plano elegível
      if (!hasEligiblePlan()) {
        // Se não tiver, desativa o auto-apply no estado
        toggleAutoApply();
        return;
      }

      // Tenta ativar o robô com as configurações salvas
      const savedConfig = localStorage.getItem('autoApplyConfig');
      if (savedConfig) {
        try {
          const { searchParams } = JSON.parse(savedConfig);
          configureRobot({
            platforms: {
              // Aqui você precisaria obter as credenciais reais do usuário
              linkedin: { username: 'user@example.com', password: 'password' },
              infojobs: { username: 'user@example.com', password: 'password' },
              catho: { username: 'user@example.com', password: 'password' }
            },
            searchParams,
            matchThreshold: 70,
            maxApplicationsPerDay: 10,
            runInterval: 3600000, // 1 hora
            headless: true
          }).then(() => activateRobot());
        } catch (error) {
          console.error('Erro ao configurar o robô:', error);
          updateRobotActivity({ error: 'Erro ao configurar o robô' });
        }
      }
    }
  }, [profile.subscription?.autoApply, profile.subscription?.plan, isRobotActive, activateRobot, deactivateRobot, configureRobot, updateRobotActivity, toggleAutoApply]);

  // Carrega conexões das plataformas
  useEffect(() => {
    const loadPlatformConnections = () => {
      const connections = platformAuthService.getConnections();
      const connectionStatus: Record<string, boolean> = {};

      ['linkedin', 'infojobs', 'catho', 'indeed', 'vagas'].forEach(platform => {
        connectionStatus[platform] = platformAuthService.isConnected(platform);
      });

      setPlatformConnections(connectionStatus);
    };

    loadPlatformConnections();

    // Recarrega a cada 30 segundos para verificar mudanças
    const interval = setInterval(loadPlatformConnections, 30000);

    return () => clearInterval(interval);
  }, []);

  // Função para lidar com o clique no botão de auto-aplicação
  const handleAutoApplyToggle = async () => {
    // Se o robô já estiver ativo, desativa
    if (profile.subscription?.autoApply) {
      await deactivateRobot();
      toggleAutoApply();
      return;
    }

    // SEMPRE mostra o paywall quando tentar ativar o robô
    setPaywallActionType('auto-apply');
    setShowRobotPaywall(true);
  };

  // Função para ativar o robô após o usuário ter um plano válido
  const activateRobotAfterPaywall = async () => {
    // Verifica se o usuário tem um plano elegível
    if (!hasEligiblePlan()) {
      // Se ainda não tiver, mantém o paywall aberto
      return;
    }

    // Fecha o paywall
    setShowRobotPaywall(false);

    // Se for a primeira vez ou não tiver configurações, mostra o modal
    if (!profile.subscription?.autoApplyConfig) {
      setShowAutoApplyConfigModal(true);
    } else {
      // Se já tiver configurações, ativa o robô
      toggleAutoApply();
      // A ativação do robô será feita pelo efeito acima
    }
  };

  const documentTypes = [
    { id: 'portfolio', name: 'Portfólio', icon: Star },
    { id: 'mediakit', name: 'Media Kit', icon: FileText },
    { id: 'commercial', name: 'Apresentação Comercial', icon: Building2 },
    { id: 'personal', name: 'Apresentação Pessoal', icon: Users },
    { id: 'lattes', name: 'Currículo Lattes', icon: FileText },
    { id: 'project', name: 'Projeto', icon: FileText },
  ];

  const handleOpenChat = () => {
    navigate('/chat');
  };

  const handleMatchmaking = () => {
    navigate('/matchmaking');
  };

  // Funções para conectar com plataformas
  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    setShowPlatformModal(true);
  };

  const handlePlatformConnectionSuccess = (platform: string) => {
    setPlatformConnections(prev => ({
      ...prev,
      [platform]: true
    }));
    alert(`Conectado com ${platform} com sucesso!`);
  };

  const handleDisconnectPlatform = async (platform: string) => {
    try {
      const result = await platformAuthService.disconnectPlatform(platform);
      if (result.success) {
        setPlatformConnections(prev => ({
          ...prev,
          [platform]: false
        }));
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      alert('Erro ao desconectar da plataforma');
    }
  };

  // Funções legadas (mantidas para compatibilidade)
  const handleConnectLinkedIn = () => handleConnectPlatform('linkedin');
  const handleConnectInfoJobs = () => handleConnectPlatform('infojobs');
  const handleConnectCatho = () => handleConnectPlatform('catho');
  const handleConnectIndeed = () => handleConnectPlatform('indeed');
  const handleConnectVagas = () => handleConnectPlatform('vagas');

  // Função para lidar com o botão "Ver mensagens"
  const handleViewMessages = (application: Application) => {
    if (application.source === 'internal') {
      // Para vagas internas, navegar para o chat interno
      navigate(`/chat/${application.jobId}`);
    } else {
      // Para vagas externas, abrir a URL da plataforma
      if (application.externalUrl) {
        window.open(application.externalUrl, '_blank');
      } else {
        // Fallback: construir URL baseada na plataforma
        const platformUrls = {
          linkedin: 'https://www.linkedin.com/jobs/',
          infojobs: 'https://www.infojobs.com.br/',
          catho: 'https://www.catho.com.br/',
          indeed: 'https://www.indeed.com.br/',
          vagas: 'https://www.vagas.com.br/'
        };

        const baseUrl = platformUrls[application.source as keyof typeof platformUrls];
        if (baseUrl) {
          window.open(baseUrl, '_blank');
        }
      }
    }
  };

  // Função para obter informações da plataforma
  const getPlatformInfo = (source: Application['source']) => {
    const platformInfo = {
      internal: { name: 'AutoVagas', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
      linkedin: { name: 'LinkedIn', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
      infojobs: { name: 'InfoJobs', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
      catho: { name: 'Catho', color: 'text-green-400', bgColor: 'bg-green-500/10' },
      indeed: { name: 'Indeed', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
      vagas: { name: 'Vagas.com', color: 'text-red-400', bgColor: 'bg-red-500/10' }
    };
    return platformInfo[source] || { name: source, color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
  };

  // Função para adicionar vaga à fila de aplicação
  const handleAddToQueue = (job: SuggestedJob) => {
    // Adiciona o ID da vaga ao conjunto de vagas na fila
    setQueuedJobs(prev => new Set([...prev, job.id]));

    // Mostrar notificação de sucesso
    setToastMessage(`"${job.title}" foi adicionada à fila de aplicação com prioridade!`);
    setShowToast(true);

    // Esconder toast após 3 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    // Aqui você implementaria a lógica para adicionar à fila do robô
    // Por exemplo, enviar para o backend ou adicionar ao estado global
    console.log('Vaga adicionada à fila com prioridade:', job);
  };

  // Função para visualizar vaga
  const handleViewJob = (job: SuggestedJob) => {
    if (job.source === 'internal') {
      // Para vagas internas, navegar para a página da vaga
      navigate(job.jobUrl || `/job/${job.id}`);
    } else {
      // Para vagas externas, abrir a URL da plataforma
      if (job.externalUrl) {
        window.open(job.externalUrl, '_blank');
      } else {
        // Fallback: construir URL baseada na plataforma
        const platformUrls = {
          linkedin: 'https://www.linkedin.com/jobs/',
          infojobs: 'https://www.infojobs.com.br/',
          catho: 'https://www.catho.com.br/',
          indeed: 'https://www.indeed.com.br/',
          vagas: 'https://www.vagas.com.br/'
        };

        const baseUrl = platformUrls[job.source as keyof typeof platformUrls];
        if (baseUrl) {
          window.open(baseUrl, '_blank');
        }
      }
    }
  };

  // Função para obter o status em português
  const getStatusLabel = (status: Application['status']) => {
    const statusMap = {
      pending: 'Pendente',
      reviewing: 'Em análise',
      interview: 'Entrevista',
      rejected: 'Rejeitado',
      hired: 'Contratado'
    };
    return statusMap[status];
  };

  // Função para obter a cor do status
  const getStatusColor = (status: Application['status']) => {
    const colorMap = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      interview: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      hired: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return colorMap[status];
  };

  const handleProfileImageClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Verifica se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida.');
        return;
      }

      setIsUploadingProfileImage(true);

      // Simula o upload para um servidor
      const reader = new FileReader();
      reader.onload = (event) => {
        // Atualiza o perfil com a nova imagem
        if (event.target?.result) {
          updateProfile({ profileImage: event.target.result as string });
          setIsUploadingProfileImage(false);
        }
      };

      reader.onerror = () => {
        alert('Ocorreu um erro ao processar a imagem. Tente novamente.');
        setIsUploadingProfileImage(false);
      };

      reader.readAsDataURL(file);
    }
  };

  // Funções para o card de currículo
  const handleViewResume = async () => {
    setIsLoadingResume(true);
    try {
      // Tentar carregar currículo existente
      const existingResume = await documentService.getResume();

      if (existingResume && existingResume.metadata?.content) {
        setResumeContent(existingResume.metadata.content);
        setResumeId(existingResume.id);
      } else {
        // Gerar currículo a partir do perfil se não existir
        const generatedContent = generateResumeFromProfile();
        setResumeContent(generatedContent);
        setResumeId(null);
      }

      setShowResumeModal(true);
    } catch (error) {
      console.error('Erro ao carregar currículo:', error);
      // Fallback para geração local
      const generatedContent = generateResumeFromProfile();
      setResumeContent(generatedContent);
      setResumeId(null);
      setShowResumeModal(true);
    } finally {
      setIsLoadingResume(false);
    }
  };

  const generateResumeFromProfile = () => {
    return `# ${profile.fullName}
**${profile.title}**

## Contato
- Email: ${profile.email}
- Telefone: ${profile.phone}
- Localização: ${profile.location}

## Resumo Profissional
${profile.bio}

## Experiência Profissional
${profile.experience} anos de experiência na área de tecnologia.

## Habilidades
${profile.skills?.join(', ') || 'Não informado'}

## Expectativa Salarial
${profile.salaryExpectation?.min && profile.salaryExpectation?.max
  ? `R$ ${profile.salaryExpectation.min}k - ${profile.salaryExpectation.max}k`
  : 'Não informado'}`;
  };

  const handleEditResume = () => {
    setIsEditingResume(true);
  };

  const handleSaveResume = async () => {
    setIsSavingResume(true);
    try {
      const resumeData = {
        content: resumeContent,
        format: 'markdown',
        isGeneratedByAi: false,
        metadata: {
          lastModified: new Date().toISOString(),
          wordCount: resumeContent.split(/\s+/).length
        }
      };

      if (resumeId) {
        // Atualizar currículo existente
        await documentService.updateResume(resumeId, resumeData);
      } else {
        // Criar novo currículo
        const savedResume = await documentService.saveResume(resumeData);
        setResumeId(savedResume.id);
      }

      setIsEditingResume(false);
      alert('Currículo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar currículo:', error);
      alert('Erro ao salvar currículo. Tente novamente.');
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleImproveWithAI = async () => {
    setShowAIImproveModal(true);
    setIsGeneratingImprovement(true);

    try {
      const improveRequest = {
        currentContent: resumeContent,
        userProfile: {
          fullName: profile.fullName,
          title: profile.title,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          experience: profile.experience,
          skills: profile.skills || [],
          salaryExpectation: profile.salaryExpectation
        },
        improvementType: 'general'
      };

      const improvement = await documentService.improveResumeWithAI(improveRequest);
      setImprovedResume(improvement.improvedContent);
    } catch (error) {
      console.error('Erro ao gerar melhoria:', error);

      // Fallback para melhoria local se a API falhar
      const fallbackImprovement = generateFallbackImprovement();
      setImprovedResume(fallbackImprovement);
    } finally {
      setIsGeneratingImprovement(false);
    }
  };

  const generateFallbackImprovement = () => {
    return `# ${profile.fullName}
**${profile.title} | Especialista em Desenvolvimento Full-Stack**

## Contato
- Email: ${profile.email}
- Telefone: ${profile.phone}
- Localização: ${profile.location}
- LinkedIn: linkedin.com/in/${profile.fullName.toLowerCase().replace(' ', '-')}

## Resumo Profissional
${profile.bio} Profissional altamente qualificado com expertise comprovada em desenvolvimento de soluções escaláveis e inovadoras. Demonstra liderança técnica e capacidade de trabalhar em equipes multidisciplinares.

## Experiência Profissional
**Desenvolvedor Full-Stack Senior** | ${profile.experience} anos
- Desenvolvimento de aplicações web escaláveis usando React, Node.js e TypeScript
- Implementação de arquiteturas de microserviços e APIs RESTful
- Liderança técnica de equipes de desenvolvimento
- Otimização de performance e experiência do usuário

## Competências Técnicas
${profile.skills?.join(' • ') || 'React • Node.js • TypeScript • Python • AWS'}

## Diferenciais Competitivos
- Experiência em metodologias ágeis (Scrum/Kanban)
- Conhecimento avançado em DevOps e CI/CD
- Capacidade de mentoria e desenvolvimento de equipes
- Foco em qualidade de código e boas práticas

## Expectativa Salarial
${profile.salaryExpectation?.min && profile.salaryExpectation?.max
  ? `R$ ${profile.salaryExpectation.min}k - ${profile.salaryExpectation.max}k`
  : 'A combinar'}`;
  };

  const handleAcceptImprovement = async () => {
    setResumeContent(improvedResume);
    setShowAIImproveModal(false);
    setImprovedResume('');

    // Salvar automaticamente a versão melhorada
    try {
      const resumeData = {
        content: improvedResume,
        format: 'markdown',
        isGeneratedByAi: true,
        metadata: {
          lastModified: new Date().toISOString(),
          wordCount: improvedResume.split(/\s+/).length,
          improvedByAI: true
        }
      };

      if (resumeId) {
        await documentService.updateResume(resumeId, resumeData);
      } else {
        const savedResume = await documentService.saveResume(resumeData);
        setResumeId(savedResume.id);
      }

      alert('Currículo melhorado aplicado e salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar melhoria:', error);
      alert('Melhoria aplicada, mas houve erro ao salvar. Salve manualmente.');
    }
  };

  const handleRejectImprovement = () => {
    setShowAIImproveModal(false);
    setImprovedResume('');
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const pdfBlob = await documentService.convertMarkdownToPDF(
        resumeContent,
        `${profile.fullName}_Curriculo.pdf`
      );

      // Criar URL para download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.fullName}_Curriculo.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleUploadPDF = async (file: File) => {
    setIsUploadingPDF(true);
    try {
      const result = await documentService.uploadResumePDF(file);

      if (result.extractedText) {
        setResumeContent(result.extractedText);
        setResumeId(result.documentId);
        alert('PDF carregado e texto extraído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      alert('Erro ao processar PDF. Tente novamente.');
    } finally {
      setIsUploadingPDF(false);
      setShowUploadModal(false);
    }
  };

  return (
    <PageContainer>
      {/* Input oculto para upload de imagem de perfil */}
      <input
        type="file"
        ref={profileImageInputRef}
        className="hidden"
        onChange={handleProfileImageChange}
        accept="image/*"
      />
      <div className="pb-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 w-full bg-gradient-to-r from-purple-600 to-pink-600" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-24">
              {/* Profile Info */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div
                      onClick={handleProfileImageClick}
                      className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-xl relative overflow-hidden cursor-pointer group"
                    >
                    {profile.profileImage ? (
                      <>
                        <img
                          src={profile.profileImage}
                          alt={profile.fullName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        {profile.fullName?.[0]?.toUpperCase()}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </>
                    )}
                    {isUploadingProfileImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    </div>
                    <div className="text-xs text-center mt-2 text-purple-300">
                      Clique para alterar
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 pt-2 md:pt-4 w-full">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-0">
                      <div>
                        <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
                        <p className="text-purple-200 text-lg">{profile.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPlans(true)}
                          className="btn-primary px-3 sm:px-4 py-2 text-sm sm:text-base"
                        >
                          <Zap className="w-4 h-4" />
                          Upgrade
                        </button>
                        <button className="btn-secondary px-3 sm:px-4 py-2 text-sm sm:text-base">
                          <Share2 className="w-4 h-4" />
                          Compartilhar
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6 text-purple-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {profile.experience} anos de experiência
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        {profile.salaryExpectation?.min && profile.salaryExpectation?.max
                          ? `R$ ${profile.salaryExpectation.min}k - ${profile.salaryExpectation.max}k`
                          : 'Salário não definido'
                        }
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-purple-200">{profile.bio}</p>
                    </div>

                    {/* Skills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-sm border border-purple-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Connection Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {/* LinkedIn */}
                      <button
                        onClick={() => platformConnections.linkedin ? handleDisconnectPlatform('linkedin') : handleConnectLinkedIn()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          platformConnections.linkedin
                            ? 'bg-green-500/10 hover:bg-red-500/10 text-green-400 hover:text-red-400 border border-green-500/20 hover:border-red-500/20'
                            : 'bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] border border-[#0077B5]/20'
                        }`}
                      >
                        {platformConnections.linkedin ? <CheckCircle className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                        <span className="font-medium">
                          {platformConnections.linkedin ? 'LinkedIn Conectado' : 'Conectar LinkedIn'}
                        </span>
                      </button>

                      {/* InfoJobs */}
                      <button
                        onClick={() => platformConnections.infojobs ? handleDisconnectPlatform('infojobs') : handleConnectInfoJobs()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          platformConnections.infojobs
                            ? 'bg-green-500/10 hover:bg-red-500/10 text-green-400 hover:text-red-400 border border-green-500/20 hover:border-red-500/20'
                            : 'bg-[#2D72D9]/10 hover:bg-[#2D72D9]/20 text-[#2D72D9] border border-[#2D72D9]/20'
                        }`}
                      >
                        {platformConnections.infojobs ? <CheckCircle className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                        <span className="font-medium">
                          {platformConnections.infojobs ? 'InfoJobs Conectado' : 'Conectar InfoJobs'}
                        </span>
                      </button>

                      {/* Catho */}
                      <button
                        onClick={() => platformConnections.catho ? handleDisconnectPlatform('catho') : handleConnectCatho()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          platformConnections.catho
                            ? 'bg-green-500/10 hover:bg-red-500/10 text-green-400 hover:text-red-400 border border-green-500/20 hover:border-red-500/20'
                            : 'bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/20'
                        }`}
                      >
                        {platformConnections.catho ? <CheckCircle className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                        <span className="font-medium">
                          {platformConnections.catho ? 'Catho Conectado' : 'Conectar Catho'}
                        </span>
                      </button>

                      {/* Indeed */}
                      <button
                        onClick={() => platformConnections.indeed ? handleDisconnectPlatform('indeed') : handleConnectIndeed()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          platformConnections.indeed
                            ? 'bg-green-500/10 hover:bg-red-500/10 text-green-400 hover:text-red-400 border border-green-500/20 hover:border-red-500/20'
                            : 'bg-[#2557A7]/10 hover:bg-[#2557A7]/20 text-[#2557A7] border border-[#2557A7]/20'
                        }`}
                      >
                        {platformConnections.indeed ? <CheckCircle className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                        <span className="font-medium">
                          {platformConnections.indeed ? 'Indeed Conectado' : 'Conectar Indeed'}
                        </span>
                      </button>

                      {/* Vagas.com */}
                      <button
                        onClick={() => platformConnections.vagas ? handleDisconnectPlatform('vagas') : handleConnectVagas()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          platformConnections.vagas
                            ? 'bg-green-500/10 hover:bg-red-500/10 text-green-400 hover:text-red-400 border border-green-500/20 hover:border-red-500/20'
                            : 'bg-[#E31E24]/10 hover:bg-[#E31E24]/20 text-[#E31E24] border border-[#E31E24]/20'
                        }`}
                      >
                        {platformConnections.vagas ? <CheckCircle className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                        <span className="font-medium">
                          {platformConnections.vagas ? 'Vagas.com Conectado' : 'Conectar Vagas.com'}
                        </span>
                      </button>
                    </div>

                    {/* Auto-Apply Card */}
                    <div className="mt-4 sm:mt-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl border border-indigo-500/20 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm sm:text-base truncate">Auto-Aplicação por IA</h3>
                            <p className="text-purple-200 text-xs sm:text-sm">
                              {profile.subscription?.autoApply
                                ? 'Bot ativo e procurando vagas'
                                : 'Ative o bot para aplicar automaticamente'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
                          {profile.subscription?.autoApply && (
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-4">
                              <Link
                                to="/activity"
                                className="text-indigo-300 hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
                              >
                                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Ver atividade</span>
                                <span className="sm:hidden">Atividade</span>
                              </Link>
                              <Link
                                to="/scraper"
                                className="text-indigo-300 hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
                              >
                                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Painel do Robô</span>
                                <span className="sm:hidden">Painel</span>
                              </Link>
                            </div>
                          )}
                          <button
                            onClick={handleAutoApplyToggle}
                            className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0
                              ${profile.subscription?.autoApply
                                ? 'bg-indigo-500'
                                : 'bg-gray-700'}`}
                            aria-label={profile.subscription?.autoApply ? 'Desativar auto-aplicação' : 'Ativar auto-aplicação'}
                          >
                            <span
                              className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-300
                                ${profile.subscription?.autoApply ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Extension Install Button for Basic Plan Users */}
                    <div className="mt-4">
                      <ExtensionInstallButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-container mt-6 sm:mt-8">
          <div className="dashboard-grid">
            {/* Left Column - Sidebar */}
            <div className="dashboard-sidebar order-2 lg:order-1">
              {/* Stats Card */}
              <div className="card-responsive">
                <h3 className="text-responsive-lg font-semibold text-white mb-3 sm:mb-4">Estatísticas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-purple-200 text-sm sm:text-base">Aplicações</span>
                    <span className="text-white font-semibold text-lg sm:text-base">48</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-purple-200 text-sm sm:text-base">Retornos</span>
                    <span className="text-white font-semibold text-lg sm:text-base">12</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-purple-200 text-sm sm:text-base">Entrevistas</span>
                    <span className="text-white font-semibold text-lg sm:text-base">5</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-purple-200 text-sm sm:text-base">Taxa de resposta</span>
                    <span className="text-white font-semibold text-lg sm:text-base">25%</span>
                  </div>
                </div>
              </div>



              {/* Ver meu Currículo Card */}
              <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-orange-500/20 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Ver meu Currículo</h3>
                </div>
                <p className="text-purple-200 mb-3 sm:mb-4 text-sm sm:text-base">
                  Visualize, edite e melhore seu currículo com a ajuda da nossa IA
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={handleViewResume}
                    disabled={isLoadingResume}
                    className="w-full btn-primary bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-2 sm:py-3 text-sm sm:text-base"
                  >
                    {isLoadingResume ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    {isLoadingResume ? 'Carregando...' : 'Ver Currículo'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleImproveWithAI}
                      disabled={!resumeContent || isGeneratingImprovement}
                      className="btn-secondary bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-2 text-xs sm:text-sm"
                    >
                      <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      IA
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn-secondary bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Resume Improvement Card */}
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-pink-500/20 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Melhore seu Currículo</h3>
                </div>
                <p className="text-purple-200 mb-3 sm:mb-4 text-sm sm:text-base">
                  Nossa IA analisou seu perfil e tem algumas sugestões para aumentar suas chances de contratação:
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 text-purple-200 text-sm sm:text-base">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    Adicione um portfólio com seus projetos
                  </li>
                  <li className="flex items-start gap-2 text-purple-200 text-sm sm:text-base">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    Faça um curso de AWS para complementar suas skills
                  </li>
                  <li className="flex items-start gap-2 text-purple-200 text-sm sm:text-base">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    Destaque sua experiência com liderança técnica
                  </li>
                </ul>
                <Link
                  to="/suggestions"
                  className="w-full btn-primary bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 mt-3 sm:mt-4 flex items-center justify-center gap-2 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ver sugestões
                </Link>
              </div>

              {/* Document Upload Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-blue-500/20 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Documentos</h3>
                </div>
                <p className="text-purple-200 mb-3 sm:mb-4 text-sm sm:text-base">
                  Adicione documentos profissionais para enriquecer seu perfil
                </p>
                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="w-full btn-primary bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Adicionar Documento
                </button>
              </div>

              {/* Matchmaking Card */}
              <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-green-500/20 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Matchmaking</h3>
                </div>
                <p className="text-purple-200 mb-3 sm:mb-4 text-sm sm:text-base">
                  Encontre profissionais com objetivos similares e skills complementares
                </p>
                <button
                  onClick={handleMatchmaking}
                  className="w-full btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Encontrar Conexões
                </button>
              </div>

              {/* Interview Training Card */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-indigo-500/20 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Treinamento de Entrevista</h3>
                </div>
                <p className="text-purple-200 mb-3 sm:mb-4 text-sm sm:text-base">
                  Pratique suas habilidades de entrevista com nossa IA especializada e receba feedback detalhado
                </p>
                <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <li className="flex items-center gap-2 text-purple-200 text-xs sm:text-sm">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    Entrevistas técnicas e comportamentais
                  </li>
                  <li className="flex items-center gap-2 text-purple-200 text-xs sm:text-sm">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    Pontuação detalhada com feedback
                  </li>
                  <li className="flex items-center gap-2 text-purple-200 text-xs sm:text-sm">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    Baseado no seu currículo e perfil
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/interview-chat')}
                  className="w-full btn-primary bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  Iniciar Treinamento
                </button>
              </div>

              {/* Course Recommendations */}
              <CourseRecommendations />
            </div>

            {/* Right Column - Feed/Applications */}
            <div className="dashboard-main order-1 lg:order-2">
              {/* Tabs */}
              <div className="mobile-tabs mb-4 sm:mb-6">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${activeTab === 'feed'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-black/20 text-purple-200 hover:bg-black/30'
                    }`}
                >
                  Vagas Sugeridas
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${activeTab === 'applications'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-black/20 text-purple-200 hover:bg-black/30'
                    }`}
                >
                  Minhas Aplicações
                </button>
              </div>

              {/* Feed */}
              {activeTab === 'feed' && (
                <div className="space-y-4">
                  {suggestedJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <BriefcaseIcon className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-white mb-2">Nenhuma vaga sugerida</h3>
                      <p className="text-purple-200 mb-6">Atualize seu perfil para receber sugestões personalizadas de vagas.</p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2 mx-auto"
                      >
                        <User className="w-5 h-5" />
                        Atualizar Perfil
                      </button>
                    </div>
                  ) : (
                    suggestedJobs.map((job) => {
                    const isQueued = queuedJobs.has(job.id);

                    return (
                      <div key={job.id} className="job-card">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-white truncate">{job.title}</h3>
                              <p className="text-purple-200 text-sm sm:text-base truncate">{job.company} • {job.location}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${getPlatformInfo(job.source).bgColor} ${getPlatformInfo(job.source).color}`}>
                                  {getPlatformInfo(job.source).name}
                                </span>
                                {job.source !== 'internal' && (
                                  <ExternalLink className="w-3 h-3 text-purple-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 sm:gap-2 self-start sm:self-center">
                            <button className="text-purple-300 hover:text-purple-200 p-1">
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button className="text-purple-300 hover:text-purple-200 p-1">
                              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button className="text-purple-300 hover:text-purple-200 p-1">
                              <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-purple-200 line-clamp-2">
                            {job.description}
                          </p>
                        </div>

                        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                          {job.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="px-2 sm:px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs sm:text-sm border border-purple-500/20">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="px-2 sm:px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs sm:text-sm border border-purple-500/20">
                              +{job.skills.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                          <div className="text-purple-200 text-sm sm:text-base">
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                              <span>{job.salary}</span>
                              <span>{job.workModel}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleViewJob(job)}
                              className="btn-secondary px-3 sm:px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              Ver vaga
                            </button>
                            <button
                              onClick={() => handleAddToQueue(job)}
                              disabled={isQueued}
                              className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                                isQueued
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                  : 'btn-primary hover:scale-105'
                              }`}
                            >
                              {isQueued ? (
                                <>
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Adicionada à fila</span>
                                  <span className="sm:hidden">Na fila</span>
                                </>
                              ) : (
                                <>
                                  <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Aplicar com IA</span>
                                  <span className="sm:hidden">Aplicar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
              )}

              {/* Applications */}
              {activeTab === 'applications' && (
                <div className="space-y-3 sm:space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <BriefcaseIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Nenhuma aplicação ainda</h3>
                      <p className="text-purple-200 mb-4 sm:mb-6 text-sm sm:text-base px-4">Suas aplicações aparecerão aqui quando você começar a usar o robô de auto-aplicação.</p>
                      <button
                        onClick={handleAutoApplyToggle}
                        className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 mx-auto text-sm sm:text-base"
                      >
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                        Ativar Auto-Aplicação
                      </button>
                    </div>
                  ) : (
                    applications.map((application) => (
                    <div
                      key={application.id}
                      className="job-card"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{application.title}</h3>
                            <p className="text-purple-200 text-sm sm:text-base truncate">{application.company} • {application.location}</p>
                            <p className="text-xs sm:text-sm text-purple-300 mt-1">Aplicado em {application.appliedAt}</p>
                            <div className="flex items-center gap-2 mt-1 sm:mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPlatformInfo(application.source).bgColor} ${getPlatformInfo(application.source).color}`}>
                                {getPlatformInfo(application.source).name}
                              </span>
                              {application.source !== 'internal' && (
                                <ExternalLink className="w-3 h-3 text-purple-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                          <button
                            onClick={() => handleViewMessages(application)}
                            className="text-purple-200 hover:text-purple-100 text-xs sm:text-sm flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                            {application.source === 'internal' ? 'Ver mensagens' : 'Ver na plataforma'}
                          </button>
                          <button
                            onClick={() => navigate(`/application/${application.id}`)}
                            className="text-purple-200 hover:text-purple-100 text-xs sm:text-sm flex items-center gap-1 transition-colors"
                          >
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            Histórico
                          </button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6 lg:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Adicionar Documento</h2>
                <p className="text-purple-200 mt-1 text-sm sm:text-base">Escolha o tipo de documento para adicionar</p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-purple-300 hover:text-purple-200 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedDocType(type.id)}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 text-left
                    ${selectedDocType === type.id
                      ? 'bg-purple-500/20 border border-purple-500/40'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <type.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm sm:text-base">{type.name}</span>
                </button>
              ))}
            </div>

            {selectedDocType && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Fazer upload do documento</h3>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx"
                />

                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all duration-200"
                  >
                    <Upload className="w-10 h-10 text-purple-400 mb-4" />
                    <p className="text-purple-200 text-center mb-2">Clique para selecionar um arquivo</p>
                    <p className="text-purple-300/50 text-sm text-center">PDF, Word, PowerPoint ou TXT</p>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-purple-300 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-purple-300 hover:text-purple-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={() => {
                      setSelectedDocType(null);
                      setUploadedFile(null);
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!uploadedFile}
                    className={`btn-primary px-4 py-2 ${!uploadedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      // Aqui você implementaria a lógica para enviar o arquivo para o servidor
                      alert(`Documento ${uploadedFile?.name} enviado com sucesso!`);
                      setShowDocumentModal(false);
                      setSelectedDocType(null);
                      setUploadedFile(null);
                    }}
                  >
                    Enviar documento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-5xl w-full mx-auto my-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Escolha seu plano</h2>
                <p className="text-purple-200 mt-1 text-sm sm:text-base">Desbloqueie todo o potencial da IA</p>
              </div>
              <button
                onClick={() => setShowPlans(false)}
                className="text-purple-300 hover:text-purple-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Billing Toggle */}
            <BillingToggle
              isAnnual={isAnnualBilling}
              onToggle={setIsAnnualBilling}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto max-h-[70vh] sm:max-h-none pb-2 pt-6">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={profile.subscription?.plan}
                  isAnnual={isAnnualBilling}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto Apply Config Modal */}
      {showAutoApplyConfigModal && (
        <AutoApplyConfigModal
          onClose={() => setShowAutoApplyConfigModal(false)}
          onSave={async () => {
            setShowAutoApplyConfigModal(false);

            // Ativa o toggle no estado da aplicação
            toggleAutoApply();

            // Configura e ativa o robô
            try {
              const savedConfig = localStorage.getItem('autoApplyConfig');
              if (savedConfig) {
                const { searchParams } = JSON.parse(savedConfig);

                await configureRobot({
                  platforms: {
                    // Aqui você precisaria obter as credenciais reais do usuário
                    linkedin: { username: 'user@example.com', password: 'password' },
                    infojobs: { username: 'user@example.com', password: 'password' },
                    catho: { username: 'user@example.com', password: 'password' }
                  },
                  searchParams,
                  matchThreshold: 70,
                  maxApplicationsPerDay: 10,
                  runInterval: 3600000, // 1 hora
                  headless: true
                });

                // A ativação do robô será feita pelo efeito
              }
            } catch (error) {
              console.error('Erro ao configurar o robô:', error);
              updateRobotActivity({ error: 'Erro ao configurar o robô' });
            }
          }}
        />
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradePlanModal && (
        <UpgradePlanModal onClose={() => setShowUpgradePlanModal(false)} />
      )}

      {/* Resume View/Edit Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-4xl w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {isEditingResume ? 'Editar Currículo' : 'Meu Currículo'}
                </h2>
                <p className="text-purple-200 mt-1 text-sm sm:text-base">
                  {isEditingResume ? 'Edite seu currículo como um documento' : 'Visualize e gerencie seu currículo'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isEditingResume ? (
                  <>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloadingPDF || !resumeContent}
                      className="btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloadingPDF ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isDownloadingPDF ? 'Gerando...' : 'PDF'}
                    </button>
                    <button
                      onClick={handleEditResume}
                      className="btn-secondary px-4 py-2 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSaveResume}
                    disabled={isSavingResume}
                    className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingResume ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSavingResume ? 'Salvando...' : 'Salvar'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowResumeModal(false);
                    setIsEditingResume(false);
                  }}
                  className="text-purple-300 hover:text-purple-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              {isEditingResume ? (
                <textarea
                  value={resumeContent}
                  onChange={(e) => setResumeContent(e.target.value)}
                  className="w-full h-96 bg-transparent text-white placeholder-purple-300 border-none outline-none resize-none font-mono text-sm"
                  placeholder="Edite seu currículo aqui..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="text-purple-100 text-sm whitespace-pre-wrap font-mono">
                    {resumeContent}
                  </pre>
                </div>
              )}
            </div>

            {!isEditingResume && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleImproveWithAI}
                  className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  Melhorar com IA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Improvement Modal */}
      {showAIImproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-6xl w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Melhoria por IA</h2>
                <p className="text-purple-200 mt-1 text-sm sm:text-base">
                  Nossa IA analisou e melhorou seu currículo
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAIImproveModal(false);
                  setImprovedResume('');
                }}
                className="text-purple-300 hover:text-purple-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isGeneratingImprovement ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-purple-200 text-lg">Analisando e melhorando seu currículo...</p>
                <p className="text-purple-300 text-sm mt-2">Isso pode levar alguns segundos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Currículo Original */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Currículo Original</h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-96 overflow-y-auto">
                    <pre className="text-purple-200 text-sm whitespace-pre-wrap font-mono">
                      {resumeContent}
                    </pre>
                  </div>
                </div>

                {/* Currículo Melhorado */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Currículo Melhorado</h3>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 h-96 overflow-y-auto">
                    <pre className="text-purple-100 text-sm whitespace-pre-wrap font-mono">
                      {improvedResume}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!isGeneratingImprovement && improvedResume && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleRejectImprovement}
                  className="btn-secondary px-6 py-3"
                >
                  Manter Original
                </button>
                <button
                  onClick={handleAcceptImprovement}
                  className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3"
                >
                  Aplicar Melhoria
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload PDF Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Upload de Currículo</h2>
                <p className="text-purple-200 mt-1 text-sm">Envie um PDF para extrair o texto</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-purple-300 hover:text-purple-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      alert('Por favor, selecione apenas arquivos PDF.');
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      alert('O arquivo deve ter no máximo 10MB.');
                      return;
                    }
                    handleUploadPDF(file);
                  }
                }}
                className="hidden"
                id="pdf-upload"
              />

              <label
                htmlFor="pdf-upload"
                className="block w-full p-8 border-2 border-dashed border-purple-500/30 rounded-xl text-center cursor-pointer hover:border-purple-500/50 transition-all duration-200"
              >
                {isUploadingPDF ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                    <p className="text-purple-200">Processando PDF...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-purple-400" />
                    <p className="text-purple-200">Clique para selecionar um PDF</p>
                    <p className="text-purple-300/50 text-sm">Máximo 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Platform Login Modal */}
      <PlatformLoginModal
        platform={selectedPlatform}
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onSuccess={handlePlatformConnectionSuccess}
      />

      {/* Robot Paywall Modal */}
      <RobotPaywallModal
        actionType={paywallActionType}
        isOpen={showRobotPaywall}
        onClose={() => setShowRobotPaywall(false)}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-green-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-xl shadow-xl border border-green-400/30 max-w-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-200" />
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};