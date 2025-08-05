import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Activity } from './pages/Activity';
import { JobDetails } from './pages/JobDetails';
import { ApplicationDetails } from './pages/ApplicationDetails';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { CompanyOnboarding } from './pages/company/CompanyOnboarding';
import { CompanyProfile } from './pages/company/CompanyProfile';
import { CompanyJobs } from './pages/company/CompanyJobs';
import { CompanyJobPost } from './pages/CompanyJobPost';
import { CompanyJobNew } from './pages/company/CompanyJobNew';
import { CompanyJobDetails } from './pages/company/CompanyJobDetails';
import { CompanyJobEdit } from './pages/company/CompanyJobEdit';
import { CandidateScreening } from './pages/company/CandidateScreening';
import { AutoAdvanceConfig } from './pages/company/AutoAdvanceConfig';
import { TalentCRM } from './pages/company/TalentCRM';
import { JobAIAssistant } from './pages/company/JobAIAssistant';
import { AdmissionSystem } from './pages/company/AdmissionSystem';
import { AdmissionDetails } from './pages/company/AdmissionDetails';
import { AdmissionConfig } from './pages/company/AdmissionConfig';
import { DocumentValidation } from './pages/company/DocumentValidation';
import { DigitalSignature } from './pages/company/DigitalSignature';
import { ContractDetails } from './pages/company/ContractDetails';
import { CompanyCandidateProfile } from './pages/CompanyCandidateProfile';
import { JobCandidates } from './pages/JobCandidates';
import { CompanyCandidates } from './pages/company/CompanyCandidates';
import { CompanyTalentSearch } from './pages/company/CompanyTalentSearch';
import { CompanyAnalytics } from './pages/company/CompanyAnalytics';
import { CompanySettings } from './pages/company/CompanySettings';
import { CompanyJobSuggestions } from './pages/CompanyJobSuggestions';
import { CompanyChat } from './pages/CompanyChat';
import { InterviewReport } from './pages/company/InterviewReport';
import { AIInterviews } from './pages/company/AIInterviews';
import { Calendar } from './pages/company/Calendar';
import { Chat } from './pages/Chat';
import { JobChat } from './pages/JobChat';
import { InterviewChat } from './pages/InterviewChat';
import { Matchmaking } from './pages/Matchmaking';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import Suggestions from './pages/Suggestions';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { CreditCheckoutSuccess } from './pages/CreditCheckoutSuccess';
import { ScraperDashboard } from './pages/ScraperDashboard';
import { AdminCourses } from './pages/AdminCourses';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSubscriptions } from './pages/admin/AdminSubscriptions';
import { AdminBotLogs } from './pages/admin/AdminBotLogs';
import { AdminStats } from './pages/admin/AdminStats';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminRoute } from './components/admin/AdminRoute';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Star,
  Users,
  Search,
  MessageSquare,
  Target,
  Brain,
  TrendingUp,
  BarChart,
  Briefcase,
  UserSearch,
  Clock,
  Award,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Globe,
  Share2,
  Video
} from 'lucide-react';
import { useAuthStore } from './store/auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/application/:id" element={<ApplicationDetails />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:jobId" element={<JobChat />} />
        <Route path="/interview-chat" element={<InterviewChat />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/suggestions" element={<Suggestions />} />
        {/* Company Routes */}
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/company/onboarding" element={<CompanyOnboarding />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/jobs" element={<CompanyJobs />} />
        <Route path="/company/job/new" element={<CompanyJobNew />} />
        <Route path="/company/job/create" element={<CompanyJobPost />} />
        <Route path="/company/job/:id" element={<CompanyJobDetails />} />
        <Route path="/company/job/:id/edit" element={<CompanyJobEdit />} />
        <Route path="/company/job/:id/candidates" element={<JobCandidates />} />
        <Route path="/company/job/:jobId/screening" element={<CandidateScreening />} />
        <Route path="/company/job/:jobId/auto-advance" element={<AutoAdvanceConfig />} />
        <Route path="/company/talent-crm" element={<TalentCRM />} />
        <Route path="/company/job-ai-assistant" element={<JobAIAssistant />} />
        <Route path="/company/admission" element={<AdmissionSystem />} />
        <Route path="/company/admission/:candidateId" element={<AdmissionDetails />} />
        <Route path="/company/admission/config" element={<AdmissionConfig />} />
        <Route path="/company/document-validation" element={<DocumentValidation />} />
        <Route path="/company/digital-signature" element={<DigitalSignature />} />
        <Route path="/company/contracts/:contractId" element={<ContractDetails />} />
        <Route path="/company/candidate/:id" element={<CompanyCandidateProfile />} />
        <Route path="/company/candidates" element={<CompanyCandidates />} />
        <Route path="/company/talent-search" element={<CompanyTalentSearch />} />
        <Route path="/company/analytics" element={<CompanyAnalytics />} />
        <Route path="/company/settings" element={<CompanySettings />} />
        <Route path="/company/job-suggestions" element={<CompanyJobSuggestions />} />
        <Route path="/company/chat" element={<CompanyChat />} />
        <Route path="/company/interview-report/:reportId" element={<InterviewReport />} />
        <Route path="/company/ai-interviews" element={<AIInterviews />} />
        <Route path="/company/calendar" element={<Calendar />} />
        <Route path="/company/ai-analysis" element={<CompanyAnalytics />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/credits/success" element={<CreditCheckoutSuccess />} />
        <Route path="/scraper" element={<ScraperDashboard />} />

        {/* Rotas Administrativas */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
        <Route path="/admin/bot-logs" element={<AdminRoute><AdminBotLogs /></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
        <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const LandingPage = () => {
  const navigate = useNavigate();
  const { setMockProfile } = useAuthStore();

  const handleBypass = () => {
    setMockProfile();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Development Bypass Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleBypass}
          className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors duration-200"
        >
          Bypass Cadastro (DEV)
        </button>
      </div>

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(29,78,216,0.05),transparent)] pointer-events-none" style={{height: '100vh'}} />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="relative z-10 mx-auto max-w-3xl transform transition-all hover:scale-[1.01] duration-300 animate-fade-in">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Pare de procurar emprego.{' '}
                <span className="text-blue-600">Deixe a IA aplicar por você.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed">
                A AutoVagas é a primeira plataforma que encontra vagas compatíveis com seu perfil e aplica automaticamente todos os dias. Você só precisa subir seu currículo. A IA faz o resto.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/signup" className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  Subir Currículo e Começar Agora
                </Link>
                <p className="mt-2 text-sm text-gray-500 animate-fade-in animate-delay-200">Leva menos de 2 minutos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="relative mt-20 overflow-hidden py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-blue-700 mb-6 animate-fade-in">
            <span className="relative inline-block">
              <span className="relative z-10">Nossos usuários já conseguiram entrevistas em empresas como:</span>
              <span className="absolute bottom-0 left-0 right-0 h-3 bg-blue-100 opacity-30 -z-10 transform -rotate-1"></span>
            </span>
          </h2>
          <div className="relative mt-8 mx-auto overflow-hidden w-full">
            <div className="flex animate-scroll space-x-8 whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-8">
                  {[
                    'Google',
                    'Nubank',
                    'iFood',
                    'XP Inc',
                    'Meta',
                    'Amazon',
                    'Microsoft',
                    'Itaú',
                    'Bradesco',
                    'Magazine Luiza'
                  ].map((company) => (
                    <div key={company} className="flex justify-center grayscale transition-all duration-300 hover:grayscale-0 hover:scale-110 px-6 py-3">
                      <span className="text-lg font-bold text-gray-500">{company}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#F4F9FF] via-[#F4F9FF] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-white via-white to-transparent" />
          </div>
        </div>
      </section>

      {/* Problem + Solution */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl animate-fade-in">
              Cansado de mandar currículos e nunca receber resposta?
            </h2>
            <p className="mt-6 text-lg text-gray-600 font-normal leading-relaxed">
              Você já perdeu horas aplicando em vagas, preenchendo formulários e esperando um retorno que nunca veio?
              A maioria das oportunidades nem chega até você — e quando chega, você está competindo com centenas de pessoas.
            </p>
            <div className="mt-8 bg-blue-50 p-6 rounded-xl animate-fade-in animate-delay-100">
              <h3 className="text-xl font-semibold text-blue-900 animate-pulse">Com a AutoVagas, você vira o jogo.</h3>
              <p className="mt-2 text-blue-700">
                A IA aplica em dezenas de vagas certas todos os dias, mesmo enquanto você dorme.
              </p>
            </div>
          </div>
          <div className="mt-12 lg:col-span-7 lg:mt-0">
            <div className="rounded-xl overflow-hidden shadow-2xl w-full h-[400px]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/7k4NFYFy-ec"
                title="AutoVagas em ação"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Como funciona em 4 passos simples:
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Envie seu currículo',
              description: 'Você envia seu currículo ou conecta o LinkedIn',
              icon: Users,
            },
            {
              title: 'IA analisa seu perfil',
              description: 'A IA analisa seu perfil e identifica seus pontos fortes',
              icon: Bot,
            },
            {
              title: 'Aplicação automática',
              description: 'Ela busca e aplica em vagas compatíveis todos os dias',
              icon: CheckCircle2,
            },
            {
              title: 'Acompanhamento',
              description: 'Você acompanha tudo pelo painel de controle',
              icon: ChevronDown,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                <step.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Tecnologia de ponta ao seu favor 🚀
        </h2>
        <p className="mt-4 text-center text-lg text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Nossa plataforma utiliza inteligência artificial avançada para maximizar suas chances de sucesso na busca por emprego
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Busca Inteligente',
              description: 'Busca vagas em dezenas de sites automaticamente usando IA para encontrar as melhores correspondências',
              icon: Search,
              gradient: 'from-purple-500 to-indigo-500',
            },
            {
              title: 'Aplicação Automática',
              description: 'Aplica com seus dados e responde questionários automaticamente, economizando seu tempo precioso',
              icon: MessageSquare,
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'Otimização de Keywords',
              description: 'Detecta e otimiza palavras-chave para aumentar sua visibilidade para recrutadores',
              icon: Target,
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              title: 'Treinamento com IA',
              description: 'Treina você para entrevistas usando simulações realistas baseadas em IA',
              icon: Brain,
              gradient: 'from-orange-500 to-pink-500',
            },
            {
              title: 'Otimização de Currículo',
              description: 'Otimiza seu currículo automaticamente com base nas últimas tendências do mercado',
              icon: TrendingUp,
              gradient: 'from-red-500 to-rose-500',
            },
            {
              title: 'Analytics em Tempo Real',
              description: 'Acompanhamento detalhado de todas as suas aplicações e resultados',
              icon: BarChart,
              gradient: 'from-yellow-500 to-orange-500',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative z-10">
                <div className={`inline-flex rounded-2xl p-4 bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600 font-normal leading-relaxed">{feature.description}</p>
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Resultados que falam por si:
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {[
            {
              content: "Fui contratado em menos de um mês. A IA aplicou para mais de 50 vagas enquanto eu cuidava da minha filha.",
              author: "Mariana Souza",
              role: "Analista de Marketing",
            },
            {
              content: "Recebi 5 entrevistas em 10 dias. Nem sabia que existiam tantas vagas com o meu perfil.",
              author: "Lucas Martins",
              role: "Desenvolvedor Fullstack",
            },
          ].map((testimonial, index) => (
            <div key={index} className="rounded-2xl glass-effect p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={`${index}-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-lg text-gray-600 font-normal leading-relaxed">{testimonial.content}</p>
              <div className="mt-6">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-600 font-normal">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8 py-16 bg-gray-50 rounded-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Escolha o plano ideal pra você
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="rounded-3xl bg-white p-8 shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
            <div className="mt-4">
              <span className="text-5xl font-bold tracking-tight text-gray-900">R$ 49</span>
              <span className="text-xl text-gray-500">/mês</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Para quem está começando</p>
            <ul className="mt-8 space-y-5 flex-grow">
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">50 aplicações/mês</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Análise básica por IA</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Painel de controle</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Suporte por email</span>
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 block w-full rounded-full bg-blue-600 px-4 py-4 text-center text-base font-semibold text-white shadow-md hover:bg-blue-700"
            >
              Assinar Plano Starter
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl bg-white p-8 shadow-lg flex flex-col relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
              MAIS POPULAR
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
            <div className="mt-4">
              <span className="text-5xl font-bold tracking-tight text-gray-900">R$ 97</span>
              <span className="text-xl text-gray-500">/mês</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Para profissionais ativos</p>
            <ul className="mt-8 space-y-5 flex-grow">
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">150 aplicações/mês</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Análise otimizada por IA</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Painel de controle avançado</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Suporte prioritário</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Relatórios semanais</span>
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 block w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-center text-base font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
            >
              Assinar Plano Pro
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="rounded-3xl bg-blue-600 p-8 shadow-lg flex flex-col text-white">
            <h3 className="text-2xl font-bold">Premium</h3>
            <div className="mt-4">
              <span className="text-5xl font-bold tracking-tight">R$ 197</span>
              <span className="text-xl text-blue-100">/mês</span>
            </div>
            <p className="mt-2 text-sm text-blue-200">Experiência completa</p>
            <ul className="mt-8 space-y-5 flex-grow">
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span>Aplicações ilimitadas</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span>Análise avançada por IA</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span>Entrevistas simuladas</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span>Respostas automáticas</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span>Suporte prioritário 24/7</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span>Relatórios detalhados</span>
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 block w-full rounded-full bg-white px-4 py-4 text-center text-base font-semibold text-blue-600 shadow-md hover:bg-blue-50"
            >
              Assinar Plano Premium
            </Link>
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8 py-16 bg-blue-50 rounded-3xl">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-blue-600">AutoVagas para Empresas:</span><br />
            Encontre os melhores talentos com IA
          </h2>
          <p className="mt-4 text-gray-600 font-normal leading-relaxed">
            Revolucione seu processo de recrutamento com nossa plataforma de IA. Encontre candidatos qualificados mais rápido, reduza custos e elimine o viés inconsciente na seleção.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <UserSearch className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Matching inteligente</h3>
            <p className="mt-2 text-gray-600">
              Nossa IA encontra os candidatos mais compatíveis com suas vagas
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Economia de tempo</h3>
            <p className="mt-2 text-gray-600">
              Reduza em até 70% o tempo gasto no processo de recrutamento
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Qualidade superior</h3>
            <p className="mt-2 text-gray-600">
              Aumente a taxa de retenção com contratações mais precisas
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-blue-700"
          >
            Começar em 3 minutos
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8 py-16 bg-gray-50 rounded-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Perguntas Frequentes
        </h2>
        <div className="mt-12 max-w-3xl mx-auto space-y-4">
          {[
            {
              question: 'Isso realmente funciona?',
              answer: 'Sim! Nossa IA foi treinada para identificar e aplicar em vagas compatíveis com seu perfil, aumentando significativamente suas chances de conseguir entrevistas.'
            },
            {
              question: 'A IA aplica mesmo quando estou offline?',
              answer: 'Sim, a IA trabalha 24/7 buscando e aplicando em vagas que correspondam ao seu perfil, mesmo quando você não está online.'
            },
            {
              question: 'E se eu não gostar? Tem reembolso?',
              answer: 'Oferecemos garantia de 7 dias. Se você não estiver satisfeito, devolvemos 100% do seu dinheiro.'
            },
            {
              question: 'Posso cancelar a qualquer momento?',
              answer: 'Sim, você pode cancelar sua assinatura quando quiser, sem multa ou burocracia.'
            },
            {
              question: 'E se eu não tiver experiência?',
              answer: 'Nossa IA é treinada para encontrar oportunidades para todos os níveis de experiência, incluindo estágios e posições para iniciantes.'
            }
          ].map((faq, index) => (
            <div key={index} className="border border-gray-200 bg-white rounded-xl overflow-hidden">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-medium text-gray-900">
                  {faq.question}
                  <div className="ml-6 flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-blue-600 group-open:rotate-180 transition-transform duration-300">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-20 text-center sm:px-16 shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Sua próxima vaga já está esperando.<br />
            Deixe a AutoVagas encontrá-la por você.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 font-normal leading-relaxed">
            Não desperdice mais horas do seu tempo. Suba seu currículo, ative sua IA e dê o próximo passo na sua carreira agora mesmo.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            COMEÇAR AGORA
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">AutoVagas</h3>
              <p className="text-gray-400 mb-4">
                Revolucionando a busca por emprego com inteligência artificial avançada.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Cookies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contato@autovagas.com.br
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (11) 4002-8922
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  São Paulo, SP - Brasil
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} AutoVagas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;