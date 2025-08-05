import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Download, 
  Star, 
  Brain, 
  MessageSquare, 
  Heart,
  User,
  GraduationCap,
  Award,
  Clock
} from 'lucide-react';

export const CompanyCandidateProfile: React.FC = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Mock data - em produção viria de uma API
  const candidate = {
    id: candidateId,
    name: 'João Silva',
    title: 'Desenvolvedor Full Stack Senior',
    location: 'São Paulo, SP',
    experience: 5,
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999',
    linkedin: 'linkedin.com/in/joaosilva',
    github: 'github.com/joaosilva',
    avatar: '/api/placeholder/120/120',
    aiScore: 92,
    summary: 'Desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e TypeScript. Apaixonado por criar soluções inovadoras e trabalhar em equipes ágeis.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL'],
    experience_details: [
      {
        company: 'Tech Solutions',
        position: 'Desenvolvedor Full Stack Senior',
        period: '2022 - Presente',
        description: 'Desenvolvimento de aplicações web usando React e Node.js. Liderança técnica de equipe de 4 desenvolvedores.'
      },
      {
        company: 'StartupXYZ',
        position: 'Desenvolvedor Full Stack',
        period: '2020 - 2022',
        description: 'Desenvolvimento de MVP e features para plataforma de e-commerce. Stack: React, Node.js, MongoDB.'
      }
    ],
    education: [
      {
        institution: 'Universidade de São Paulo',
        degree: 'Bacharelado em Ciência da Computação',
        period: '2016 - 2020'
      }
    ],
    certifications: [
      'AWS Certified Developer',
      'React Professional Certificate',
      'Node.js Certified Developer'
    ]
  };

  const handleChat = () => {
    navigate(`/company/chat/${candidate.id}`, {
      state: {
        candidateName: candidate.name,
        candidateTitle: candidate.title,
        candidateAvatar: candidate.avatar
      }
    });
  };

  return (
    <CompanyLayout
      title={`Perfil de ${candidate.name}`}
      description={candidate.title}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/candidates')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleChat}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Conversar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header do Perfil */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-24 h-24 rounded-full mx-auto sm:mx-0"
              />
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white mb-2">{candidate.name}</h1>
                <p className="text-purple-200 text-lg mb-4">{candidate.title}</p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-white/60 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {candidate.experience} anos
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <a href={`mailto:${candidate.email}`} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Mail className="w-4 h-4 text-white" />
                  </a>
                  <a href={`tel:${candidate.phone}`} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-white" />
                  </a>
                  <a href={`https://${candidate.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Linkedin className="w-4 h-4 text-white" />
                  </a>
                  <a href={`https://${candidate.github}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Github className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* AI Score */}
            <div className="flex flex-col items-center gap-2">
              <div className={`relative w-20 h-20 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                candidate.aiScore >= 90 
                  ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-emerald-300/50' 
                  : candidate.aiScore >= 80 
                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-blue-300/50'
                  : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300/50'
              }`}>
                <span className="text-lg font-extrabold">{candidate.aiScore}%</span>
                {candidate.aiScore >= 90 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-800 fill-current" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">AI Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumo */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Sobre</h2>
              <p className="text-white/80 leading-relaxed">{candidate.summary}</p>
            </div>

            {/* Experiência */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experiência
              </h2>
              <div className="space-y-4">
                {candidate.experience_details.map((exp, index) => (
                  <div key={index} className="border-l-2 border-purple-500/30 pl-4">
                    <h3 className="text-white font-medium">{exp.position}</h3>
                    <p className="text-purple-200">{exp.company}</p>
                    <p className="text-white/60 text-sm mb-2">{exp.period}</p>
                    <p className="text-white/80 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Educação */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Educação
              </h2>
              <div className="space-y-3">
                {candidate.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="text-white font-medium">{edu.degree}</h3>
                    <p className="text-purple-200">{edu.institution}</p>
                    <p className="text-white/60 text-sm">{edu.period}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certificações */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificações
              </h2>
              <div className="space-y-2">
                {candidate.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/80 text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Ações</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                  Adicionar aos Favoritos
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Baixar Currículo
                </button>
                <button 
                  onClick={handleChat}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Iniciar Conversa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
