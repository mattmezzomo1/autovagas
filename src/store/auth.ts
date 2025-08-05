import { create } from 'zustand';
import { UserProfile, SignupSteps, Plan } from '../types/auth';
import { ApplicationResult, ScrapedJob } from '../services/webscraper';

interface AuthState {
  currentStep: number;
  steps: SignupSteps;
  profile: Partial<UserProfile>;
  plans: Plan[];
  // Estado do robô de auto-aplicação
  robotActivity: {
    foundJobs: ScrapedJob[];
    analyzedJobs: (ScrapedJob & { matchScore: number })[];
    appliedJobs: ApplicationResult[];
    lastRunDate: Date | null;
    todayApplicationCount: number;
    error: string | null;
  };
  // Ações
  setStep: (step: number) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeStep: (stepId: number) => void;
  toggleAutoApply: () => void;
  setMockProfile: () => void;
  setAdminProfile: () => void;
  // Ações de créditos
  consumeCredits: (amount: number) => boolean;
  // Ações do robô
  updateRobotActivity: (data: Partial<AuthState['robotActivity']>) => void;
  addFoundJob: (job: ScrapedJob) => void;
  addAnalyzedJob: (job: ScrapedJob & { matchScore: number }) => void;
  addAppliedJob: (result: ApplicationResult) => void;
  clearRobotJobs: () => void;
}

// Perfil de usuário candidato
const mockProfile: Partial<UserProfile> = {
  fullName: "João Silva",
  email: "joao.silva@example.com",
  phone: "(11) 98765-4321",
  location: "São Paulo, SP",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  title: "Desenvolvedor Full Stack Senior",
  experience: 8,
  bio: "Desenvolvedor apaixonado por tecnologia com mais de 8 anos de experiência em desenvolvimento web. Especializado em React, Node.js e arquitetura de microsserviços.",
  skills: ["React", "Node.js", "TypeScript", "AWS", "Docker", "MongoDB", "GraphQL"],
  linkedinUrl: "https://linkedin.com/in/joaosilva",
  githubUrl: "https://github.com/joaosilva",
  portfolioUrl: "https://joaosilva.dev",
  jobTypes: ["CLT", "PJ"],
  workModels: ["Remoto", "Híbrido"],
  salaryExpectation: {
    min: 15,
    max: 20
  },
  industries: ["Tecnologia", "Finanças", "E-commerce"],
  locations: ["São Paulo", "Campinas", "Remoto"],
  role: 'candidate',
  subscription: {
    plan: 'plus',
    credits: 100,
    autoApply: true,
    autoApplyConfig: {
      workHours: 40,
      internationalJobs: false
    }
  }
};

// Perfil de usuário administrador
const mockAdminProfile: Partial<UserProfile> = {
  fullName: "Admin Sistema",
  email: "admin@aiapply.com",
  phone: "(11) 99999-9999",
  location: "São Paulo, SP",
  profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
  title: "Administrador do Sistema",
  experience: 10,
  bio: "Administrador do sistema AIApply.",
  skills: ["Gestão", "Administração", "Suporte"],
  linkedinUrl: "https://linkedin.com/in/admin",
  jobTypes: ["CLT"],
  workModels: ["Presencial"],
  salaryExpectation: {
    min: 10,
    max: 15
  },
  industries: ["Tecnologia"],
  locations: ["São Paulo"],
  role: 'admin',
  subscription: {
    plan: 'premium',
    credits: 999,
    autoApply: false
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  currentStep: 1,
  steps: [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Seus dados pessoais e de contato',
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Perfil Profissional',
      description: 'Sua experiência e habilidades',
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Documentos',
      description: 'Currículo e links profissionais',
      isCompleted: false,
    },
    {
      id: 4,
      title: 'Preferências',
      description: 'Tipos de vagas de seu interesse',
      isCompleted: false,
    },
  ],
  profile: mockProfile,
  robotActivity: {
    foundJobs: [],
    analyzedJobs: [],
    appliedJobs: [],
    lastRunDate: null,
    todayApplicationCount: 0,
    error: null
  },
  plans: [
    {
      id: 'basic',
      name: 'Básico',
      price: 19.90,
      annualPrice: 9.95, // 50% de desconto
      credits: 50,
      features: [
        '50 aplicações automáticas por mês',
        'Auto-aplicação via extensão Chrome',
        'Processamento local (sua máquina)',
        'Currículo otimizado por IA',
        'Sugestões de melhoria de currículo',
        'Sugestões de vagas',
        'Matchmaking básico',
        'Aplicações manuais ilimitadas',
      ],
      automationType: 'extension',
      description: 'Ideal para quem está começando a busca por empregos',
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 49.90,
      annualPrice: 24.95, // 50% de desconto
      credits: 100,
      features: [
        '100 aplicações automáticas por mês',
        'Bot na nuvem 24/7',
        'Processamento em nossos servidores',
        'Auto-aplicação inteligente avançada',
        'Prioridade nas aplicações',
        'Análise de compatibilidade com IA',
        'Sugestões de melhoria de currículo',
        'Sugestões de vagas premium',
        'Matchmaking avançado',
        'Aplicações manuais ilimitadas',
      ],
      automationType: 'cloud',
      isPopular: true,
      description: 'Perfeito para profissionais ativos na busca',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.90,
      annualPrice: 49.95, // 50% de desconto
      credits: 1000,
      features: [
        '1000 aplicações automáticas por mês',
        'Bot na nuvem 24/7 prioritário',
        'Processamento em nossos servidores',
        'Auto-aplicação inteligente premium',
        'Máxima prioridade nas aplicações',
        'Análise avançada de compatibilidade',
        'Relatórios detalhados e analytics',
        'Suporte prioritário',
        'Sugestões de vagas exclusivas',
        'Matchmaking premium com IA',
        'Aplicações manuais ilimitadas',
      ],
      automationType: 'cloud',
      description: 'Para profissionais que querem máxima eficiência',
    },
  ],
  setStep: (step) =>
    set((state) => {
      if (step <= state.currentStep || state.steps[step - 1]?.isCompleted) {
        return { currentStep: step };
      }
      return state;
    }),
  updateProfile: (data) =>
    set((state) => ({
      profile: { ...state.profile, ...data },
      currentStep: data.currentStep || state.currentStep
    })),
  completeStep: (stepId) =>
    set((state) => {
      const newSteps = state.steps.map((step) =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      );
      const nextStep = stepId < newSteps.length ? stepId + 1 : stepId;
      return {
        steps: newSteps,
        currentStep: nextStep,
      };
    }),
  toggleAutoApply: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        subscription: {
          ...state.profile.subscription!,
          autoApply: !state.profile.subscription?.autoApply
        }
      }
    })),

  // Consome créditos e retorna true se houver créditos suficientes, false caso contrário
  consumeCredits: (amount) => {
    let hasEnoughCredits = false;

    set((state) => {
      const currentCredits = state.profile.subscription?.credits || 0;

      // Verifica se há créditos suficientes
      if (currentCredits < amount) {
        hasEnoughCredits = false;
        return state; // Retorna o estado atual sem alterações
      }

      // Atualiza os créditos
      hasEnoughCredits = true;
      return {
        profile: {
          ...state.profile,
          subscription: {
            ...state.profile.subscription!,
            credits: currentCredits - amount
          }
        }
      };
    });

    return hasEnoughCredits;
  },
  setMockProfile: () =>
    set(() => ({
      profile: mockProfile,
      steps: [
        {
          id: 1,
          title: 'Informações Básicas',
          description: 'Seus dados pessoais e de contato',
          isCompleted: true,
        },
        {
          id: 2,
          title: 'Perfil Profissional',
          description: 'Sua experiência e habilidades',
          isCompleted: true,
        },
        {
          id: 3,
          title: 'Documentos',
          description: 'Currículo e links profissionais',
          isCompleted: true,
        },
        {
          id: 4,
          title: 'Preferências',
          description: 'Tipos de vagas de seu interesse',
          isCompleted: true,
        },
      ],
    })),

  // Define o perfil como administrador para testes
  setAdminProfile: () =>
    set(() => ({
      profile: mockAdminProfile,
      steps: [
        {
          id: 1,
          title: 'Informações Básicas',
          description: 'Seus dados pessoais e de contato',
          isCompleted: true,
        },
        {
          id: 2,
          title: 'Perfil Profissional',
          description: 'Sua experiência e habilidades',
          isCompleted: true,
        },
        {
          id: 3,
          title: 'Documentos',
          description: 'Currículo e links profissionais',
          isCompleted: true,
        },
        {
          id: 4,
          title: 'Preferências',
          description: 'Tipos de vagas de seu interesse',
          isCompleted: true,
        },
      ],
    })),
  // Ações do robô de auto-aplicação
  updateRobotActivity: (data) =>
    set((state) => ({
      robotActivity: { ...state.robotActivity, ...data }
    })),
  addFoundJob: (job) =>
    set((state) => ({
      robotActivity: {
        ...state.robotActivity,
        foundJobs: [...state.robotActivity.foundJobs, job]
      }
    })),
  addAnalyzedJob: (job) =>
    set((state) => ({
      robotActivity: {
        ...state.robotActivity,
        analyzedJobs: [...state.robotActivity.analyzedJobs, job]
      }
    })),
  addAppliedJob: (result) =>
    set((state) => ({
      robotActivity: {
        ...state.robotActivity,
        appliedJobs: [...state.robotActivity.appliedJobs, result],
        todayApplicationCount: state.robotActivity.todayApplicationCount + 1,
        lastRunDate: new Date()
      }
    })),
  clearRobotJobs: () =>
    set((state) => ({
      robotActivity: {
        ...state.robotActivity,
        foundJobs: [],
        analyzedJobs: []
      }
    })),
}));