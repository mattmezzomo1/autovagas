import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ArrowLeft, MapPin, Clock, DollarSign, Building, Calendar,
  Users, Star, Send, Heart, Share2, ExternalLink, CheckCircle,
  AlertCircle, Target, Award, Briefcase, GraduationCap,
  Globe, Shield, Zap, TrendingUp, Eye, MessageCircle
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { ApplicationFeedback } from '../components/feedback/ApplicationFeedback';
import { ChatModal } from '../components/chat/ChatModal';

export const JobDetails: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { addNotification } = useAppStore();

  const [showApplicationFeedback, setShowApplicationFeedback] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Mock job data - em produção viria da API
  const [jobData] = useState({
    id: 1,
    title: 'Senior React Developer',
    company: 'TechCorp Solutions',
    location: 'São Paulo, SP',
    salary: 'R$ 8.000 - R$ 12.000',
    type: 'CLT',
    remote: true,
    postedAt: '2 dias atrás',
    matchScore: 92,
    logo: '🏢',
    description: `Estamos procurando um desenvolvedor React sênior para se juntar à nossa equipe de tecnologia. 
    
Você será responsável por desenvolver interfaces de usuário modernas e responsivas, trabalhando em projetos inovadores que impactam milhares de usuários.

Nossa empresa valoriza a inovação, o crescimento profissional e oferece um ambiente colaborativo onde suas ideias são ouvidas e implementadas.`,
    requirements: [
      '5+ anos de experiência com React',
      'Conhecimento avançado em TypeScript',
      'Experiência com Next.js',
      'Conhecimento em testes (Jest, Testing Library)',
      'Experiência com Git e metodologias ágeis',
      'Inglês intermediário/avançado'
    ],
    responsibilities: [
      'Desenvolver componentes React reutilizáveis',
      'Implementar designs responsivos e acessíveis',
      'Colaborar com designers e backend developers',
      'Participar de code reviews',
      'Mentorear desenvolvedores júnior',
      'Contribuir para a arquitetura do frontend'
    ],
    benefits: [
      'Vale refeição R$ 800',
      'Vale transporte',
      'Plano de saúde e odontológico',
      'Gympass',
      'Home office flexível',
      'Auxílio educação',
      'Stock options',
      '13º e 14º salário'
    ],
    company_info: {
      name: 'TechCorp Solutions',
      size: '200-500 funcionários',
      industry: 'Tecnologia',
      founded: '2015',
      website: 'https://techcorp.com',
      description: 'Empresa líder em soluções tecnológicas inovadoras, focada em transformação digital e desenvolvimento de software de alta qualidade.'
    },
    skills: [
      { name: 'React', level: 'Avançado', match: true },
      { name: 'TypeScript', level: 'Avançado', match: true },
      { name: 'Next.js', level: 'Intermediário', match: false },
      { name: 'Node.js', level: 'Intermediário', match: true },
      { name: 'GraphQL', level: 'Básico', match: false }
    ]
  });

  const handleApply = () => {
    setShowApplicationFeedback(true);
  };

  const handleApplicationComplete = () => {
    setIsApplied(true);
    setShowApplicationFeedback(false);
    addNotification({
      type: 'success',
      message: 'Aplicação enviada com sucesso!'
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    addNotification({
      type: 'success',
      message: isSaved ? 'Vaga removida dos favoritos' : 'Vaga salva nos favoritos!'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${jobData.title} - ${jobData.company}`,
        text: `Confira esta oportunidade: ${jobData.title} na ${jobData.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification({
        type: 'success',
        message: 'Link copiado para a área de transferência!'
      });
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`${isSaved ? 'text-red-400' : 'text-white'} hover:bg-white/10`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Job Header */}
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                {jobData.logo}
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl font-bold mb-2">{jobData.title}</h1>
                <div className="flex items-center gap-2 text-gray-300 mb-3">
                  <Building className="w-4 h-4" />
                  <span>{jobData.company}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{jobData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{jobData.salary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{jobData.postedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">Match Score</span>
                </div>
                <div className="text-green-400 font-bold text-lg">{jobData.matchScore}%</div>
              </div>
              <p className="text-green-200/80 text-sm mt-1">
                Excelente compatibilidade com seu perfil!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isApplied ? (
            <Button
              onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Aplicar Agora
            </Button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 bg-green-600/20 border border-green-500/30 rounded-lg py-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium">Aplicação Enviada</span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setShowChatModal(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>

        {/* Job Description */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Descrição da Vaga</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {jobData.description}
            </p>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Requisitos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jobData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Responsabilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jobData.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{resp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Benefícios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {jobData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg">
                  <Award className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Match */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Compatibilidade de Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobData.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${skill.match ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <div>
                      <span className="text-white font-medium">{skill.name}</span>
                      <p className="text-gray-400 text-sm">{skill.level}</p>
                    </div>
                  </div>
                  {skill.match ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Sobre a Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                {jobData.company_info.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Tamanho</span>
                  </div>
                  <p className="text-white">{jobData.company_info.size}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Setor</span>
                  </div>
                  <p className="text-white">{jobData.company_info.industry}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Fundada</span>
                  </div>
                  <p className="text-white">{jobData.company_info.founded}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Website</span>
                  </div>
                  <a
                    href={jobData.company_info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>Ver site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Similar Jobs */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Vagas Similares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Frontend Developer', company: 'StartupTech', match: 85 },
                { title: 'React Native Developer', company: 'MobileCorp', match: 78 },
                { title: 'Full Stack Developer', company: 'WebSolutions', match: 82 }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 cursor-pointer transition-colors">
                  <div>
                    <h4 className="text-white font-medium">{job.title}</h4>
                    <p className="text-gray-400 text-sm">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-medium">{job.match}%</span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Feedback */}
      {showApplicationFeedback && (
        <ApplicationFeedback
          isVisible={showApplicationFeedback}
          jobTitle={jobData.title}
          company={jobData.company}
          onClose={() => setShowApplicationFeedback(false)}
          onComplete={handleApplicationComplete}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          isVisible={showChatModal}
          jobTitle={jobData.title}
          company={jobData.company}
          recruiterName="Ana Silva"
          recruiterRole="Tech Recruiter"
          onClose={() => setShowChatModal(false)}
        />
      )}
    </MobileLayout>
  );
};
