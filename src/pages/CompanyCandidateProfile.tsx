import React from 'react';
import { ArrowLeft, MapPin, Briefcase, Star, Download, MessageSquare, Clock, CheckCircle2, FileText, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompanyCandidateProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/company"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white">
                JS
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">João Silva</h1>
                    <p className="text-xl text-purple-200">Desenvolvedor Full Stack Senior</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary px-4 py-2">
                      <MessageSquare className="w-4 h-4" />
                      Mensagem
                    </button>
                    <button className="btn-primary px-4 py-2">
                      Agendar Entrevista
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 text-purple-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    São Paulo, SP
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    8 anos de experiência
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    95% compatibilidade
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-purple-200">
                    Desenvolvedor apaixonado por tecnologia com mais de 8 anos de experiência em desenvolvimento web. 
                    Especializado em React, Node.js e arquitetura de microsserviços.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'MongoDB', 'GraphQL'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-sm border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {/* Experience */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Experiência</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Tech Lead</h3>
                    <p className="text-purple-200">TechCorp Inc.</p>
                    <p className="text-sm text-purple-300 mt-1">Jan 2022 - Presente • 2 anos</p>
                    <p className="text-purple-200 mt-2">
                      Liderança técnica de equipe full stack, desenvolvimento de arquitetura de microsserviços
                      e implementação de práticas de DevOps.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Desenvolvedor Senior</h3>
                    <p className="text-purple-200">StartupXYZ</p>
                    <p className="text-sm text-purple-300 mt-1">Jan 2020 - Dez 2021 • 2 anos</p>
                    <p className="text-purple-200 mt-2">
                      Desenvolvimento de aplicações web escaláveis, mentoria de desenvolvedores juniores
                      e implementação de arquitetura serverless.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Projetos</h2>
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium">E-commerce Platform</h3>
                  <p className="text-purple-200 mt-2">
                    Plataforma de e-commerce completa com microsserviços, processamento de pagamentos
                    e sistema de recomendação baseado em IA.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs">React</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs">Node.js</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs">AWS</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium">Real-time Analytics Dashboard</h3>
                  <p className="text-purple-200 mt-2">
                    Dashboard em tempo real para análise de dados de IoT, processando
                    milhões de eventos por segundo.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs">TypeScript</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs">GraphQL</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs">MongoDB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Documents */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Documentos</h2>
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">Currículo</div>
                    <div className="text-sm text-purple-200">PDF • 2.1 MB</div>
                  </div>
                  <Download className="w-5 h-5 text-purple-300" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">Portfólio</div>
                    <div className="text-sm text-purple-200">PDF • 5.8 MB</div>
                  </div>
                  <Download className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Links</h2>
              <div className="space-y-4">
                <a
                  href="https://linkedin.com/in/joaosilva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <LinkIcon className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">LinkedIn</div>
                    <div className="text-sm text-purple-200">linkedin.com/in/joaosilva</div>
                  </div>
                </a>

                <a
                  href="https://github.com/joaosilva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <LinkIcon className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">GitHub</div>
                    <div className="text-sm text-purple-200">github.com/joaosilva</div>
                  </div>
                </a>

                <a
                  href="https://joaosilva.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <LinkIcon className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Portfolio</div>
                    <div className="text-sm text-purple-200">joaosilva.dev</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Application History */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Histórico de Aplicações</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Tech Lead</div>
                    <div className="text-sm text-purple-200">Em análise • 2 dias atrás</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Senior Developer</div>
                    <div className="text-sm text-purple-200">Entrevista marcada • 5 dias atrás</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};