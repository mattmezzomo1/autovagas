import React, { useState } from 'react';
import { ArrowLeft, Users, Search, Building2, MapPin, Briefcase, Star, MessageSquare, Link as LinkIcon, ExternalLink, Bot, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Connection {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  skills: string[];
  commonInterests: string[];
  mutualConnections: number;
  professionalGoal: string;
  shortTermGoals: string[];
  longTermGoals: string[];
}

export const Matchmaking: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'skills' | 'interests' | 'goals'>('all');

  const connections: Connection[] = [
    {
      id: 1,
      name: 'Maria Santos',
      title: 'Tech Lead',
      company: 'StartupXYZ',
      location: 'São Paulo, SP',
      matchScore: 95,
      skills: ['React', 'Node.js', 'AWS', 'TypeScript'],
      commonInterests: ['Arquitetura de Software', 'Liderança Técnica', 'Startups'],
      mutualConnections: 12,
      professionalGoal: 'Liderar times de alto desempenho e criar produtos inovadores que impactem milhões de usuários',
      shortTermGoals: [
        'Aprofundar conhecimentos em arquitetura de microsserviços',
        'Desenvolver habilidades de mentoria',
        'Contribuir com projetos open source'
      ],
      longTermGoals: [
        'Tornar-se CTO de uma startup em crescimento',
        'Criar uma comunidade tech para mulheres'
      ]
    },
    {
      id: 2,
      name: 'Pedro Costa',
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'Rio de Janeiro, RJ',
      matchScore: 92,
      skills: ['React', 'Python', 'Machine Learning', 'Docker'],
      commonInterests: ['Inteligência Artificial', 'Open Source', 'Inovação'],
      mutualConnections: 8,
      professionalGoal: 'Especializar-se em IA e Machine Learning para desenvolver soluções que transformem a maneira como interagimos com a tecnologia',
      shortTermGoals: [
        'Certificação em AWS Machine Learning',
        'Publicar artigos técnicos sobre IA',
        'Participar de conferências como palestrante'
      ],
      longTermGoals: [
        'Fundar uma startup focada em IA',
        'Desenvolver patentes na área de ML'
      ]
    },
    {
      id: 3,
      name: 'Ana Silva',
      title: 'Product Manager',
      company: 'InnovaTech',
      location: 'Curitiba, PR',
      matchScore: 88,
      skills: ['Product Strategy', 'Agile', 'UX Design', 'Data Analytics'],
      commonInterests: ['Gestão de Produto', 'Design Thinking', 'Metodologias Ágeis'],
      mutualConnections: 5,
      professionalGoal: 'Criar produtos digitais que resolvam problemas reais e melhorem a vida das pessoas através de experiências excepcionais',
      shortTermGoals: [
        'Especialização em Growth Product Management',
        'Desenvolver framework próprio de product discovery',
        'Mentorar PMs juniores'
      ],
      longTermGoals: [
        'Liderar área de produto em empresa global',
        'Criar consultoria de produto'
      ]
    },
  ];

  const handleConnect = (connectionId: number) => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 sm:gap-2 text-purple-200 hover:text-purple-100 mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Conexões Profissionais</h1>
                <p className="text-purple-200 text-sm sm:text-base">Encontre profissionais com objetivos e habilidades complementares</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">127</div>
                <div className="text-purple-200">Conexões sugeridas</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">45</div>
                <div className="text-purple-200">Conexões em comum</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">92%</div>
                <div className="text-purple-200">Taxa de match médio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conexões..."
              className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-12 pr-4 py-3 text-purple-100"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all duration-200
                ${filterType === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('skills')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all duration-200
                ${filterType === 'skills'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
            >
              Por Skills
            </button>
            <button
              onClick={() => setFilterType('interests')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all duration-200
                ${filterType === 'interests'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
            >
              Por Interesses
            </button>
            <button
              onClick={() => setFilterType('goals')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all duration-200
                ${filterType === 'goals'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
            >
              Por Objetivos
            </button>
          </div>
        </div>

        {/* Connections List */}
        <div className="space-y-4">
          {connections.map((connection) => (
            <div key={connection.id} className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
                  {connection.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-0">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">{connection.name}</h3>
                      <p className="text-purple-200">{connection.title}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                          {connection.matchScore}%
                        </div>
                        <div className="text-green-500 text-sm">compatibilidade</div>
                      </div>
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-6 mt-3 text-purple-200 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {connection.company}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {connection.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {connection.mutualConnections} conexões em comum
                    </div>
                  </div>

                  {/* Professional Goal */}
                  <div className="mt-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 sm:p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-100 text-sm sm:text-base font-medium mb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Objetivo Profissional
                    </div>
                    <p className="text-purple-200 text-xs sm:text-sm">{connection.professionalGoal}</p>
                  </div>

                  {/* Goals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-sm font-medium text-purple-200 mb-2">Objetivos de Curto Prazo</div>
                      <ul className="space-y-1">
                        {connection.shortTermGoals.map((goal, index) => (
                          <li key={index} className="flex items-center gap-2 text-purple-300 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-purple-200 mb-2">Objetivos de Longo Prazo</div>
                      <ul className="space-y-1">
                        {connection.longTermGoals.map((goal, index) => (
                          <li key={index} className="flex items-center gap-2 text-purple-300 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium text-purple-200 mb-2">Skills em comum</div>
                    <div className="flex flex-wrap gap-2">
                      {connection.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-sm border border-purple-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium text-purple-200 mb-2">Interesses em comum</div>
                    <div className="flex flex-wrap gap-2">
                      {connection.commonInterests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-indigo-500/10 text-indigo-200 rounded-full text-sm border border-indigo-500/20"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleConnect(connection.id)}
                      className="btn-primary px-3 sm:px-4 py-2 text-sm sm:text-base flex-1 sm:flex-auto"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Conectar
                    </button>
                    <button className="btn-secondary px-3 sm:px-4 py-2 text-sm sm:text-base flex-1 sm:flex-auto">
                      Ver perfil completo
                    </button>
                    <button className="btn-secondary px-3 sm:px-4 py-2 text-sm sm:text-base flex-1 sm:flex-auto">
                      <LinkIcon className="w-4 h-4" />
                      LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Assistant Card */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Assistente de Networking</h3>
              <p className="text-purple-200 text-sm">Deixe nossa IA encontrar as melhores conexões para você</p>
            </div>
          </div>
          <button className="w-full btn-primary bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
            <Bot className="w-5 h-5" />
            Ativar Assistente
          </button>
        </div>
      </div>
    </div>
  );
};