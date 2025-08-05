import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  MapPin,
  Building2,
  Banknote,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Edit3,
  FileText,
  Download,
  Calendar,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { PageContainer } from '../components/layout/PageContainer';

export const Profile: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="pb-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 w-full bg-gradient-to-r from-purple-600 to-pink-600" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-24">
              {/* Profile Info */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-start gap-6">
                  {/* Profile Picture */}
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                    {profile.fullName?.[0]?.toUpperCase()}
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
                        <p className="text-purple-200 text-lg">{profile.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/settings" className="btn-secondary px-4 py-2">
                          <Settings className="w-4 h-4" />
                          Configurações
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-6 text-purple-200">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Contact & Links */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Informações de Contato</h3>
                  <Link to="/settings" className="text-purple-300 hover:text-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-200">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-200">{profile.phone}</span>
                  </div>
                </div>
              </div>

              {/* Professional Links */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Links Profissionais</h3>
                  <Link to="/settings" className="text-purple-300 hover:text-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-purple-200 hover:text-purple-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-purple-400" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-purple-200 hover:text-purple-100 transition-colors"
                    >
                      <Github className="w-5 h-5 text-purple-400" />
                      <span>GitHub</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-purple-200 hover:text-purple-100 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-purple-400" />
                      <span>Portfólio</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Preferências</h3>
                  <Link to="/settings" className="text-purple-300 hover:text-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Tipos de Contratação</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.jobTypes?.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-indigo-500/10 text-indigo-200 rounded-full text-sm border border-indigo-500/20"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Modelo de Trabalho</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.workModels?.map((model) => (
                        <span
                          key={model}
                          className="px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-sm border border-purple-500/20"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Indústrias de Interesse</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.industries?.map((industry) => (
                        <span
                          key={industry}
                          className="px-3 py-1 bg-pink-500/10 text-pink-200 rounded-full text-sm border border-pink-500/20"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Locais de Interesse</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.locations?.map((location) => (
                        <span
                          key={location}
                          className="px-3 py-1 bg-green-500/10 text-green-200 rounded-full text-sm border border-green-500/20"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Experience & Documents */}
            <div className="md:col-span-2 space-y-6">
              {/* Resume */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Currículo</h3>
                  <Link to="/settings" className="text-purple-300 hover:text-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Currículo_JoaoSilva.pdf</h4>
                        <p className="text-purple-200 text-sm">Atualizado em 15/03/2024</p>
                      </div>
                    </div>
                    <button className="btn-secondary px-4 py-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Experiência Profissional</h3>
                  <Link to="/settings" className="text-purple-300 hover:text-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-8">
                  {/* Experience Item */}
                  <div className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-0 before:w-px before:bg-purple-500/30">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Briefcase className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium">Tech Lead</h4>
                          <p className="text-purple-300">TechCorp Inc.</p>
                        </div>
                        <div className="flex items-center gap-2 text-purple-300 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>2020 - Atual</span>
                        </div>
                      </div>
                      <p className="mt-2 text-purple-200">
                        Liderança técnica de equipe de desenvolvimento, arquitetura de sistemas e implementação de soluções escaláveis.
                        Responsável por projetos de alta complexidade e mentoria de desenvolvedores juniores.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          React
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          Node.js
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          AWS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Item */}
                  <div className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-0 before:w-px before:bg-purple-500/30">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Briefcase className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium">Desenvolvedor Full Stack Senior</h4>
                          <p className="text-purple-300">InnovaSoft</p>
                        </div>
                        <div className="flex items-center gap-2 text-purple-300 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>2017 - 2020</span>
                        </div>
                      </div>
                      <p className="mt-2 text-purple-200">
                        Desenvolvimento de aplicações web e mobile utilizando React, React Native e Node.js.
                        Implementação de arquitetura de microsserviços e integração com APIs externas.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          React
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          React Native
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          Node.js
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Item */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Briefcase className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium">Desenvolvedor Front-end</h4>
                          <p className="text-purple-300">WebSolutions</p>
                        </div>
                        <div className="flex items-center gap-2 text-purple-300 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>2015 - 2017</span>
                        </div>
                      </div>
                      <p className="mt-2 text-purple-200">
                        Desenvolvimento de interfaces web responsivas e acessíveis utilizando HTML, CSS e JavaScript.
                        Implementação de designs utilizando frameworks como Bootstrap e jQuery.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          HTML
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          CSS
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-200 rounded-full text-xs border border-purple-500/20">
                          JavaScript
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Educação</h3>
                  <Link to="/settings" className="text-purple-300 hover:text-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-6">
                  {/* Education Item */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Bacharelado em Ciência da Computação</h4>
                      <p className="text-purple-300">Universidade de São Paulo</p>
                      <div className="flex items-center gap-2 text-purple-300 text-sm mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>2011 - 2015</span>
                      </div>
                    </div>
                  </div>

                  {/* Education Item */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Especialização em Desenvolvimento Web</h4>
                      <p className="text-purple-300">Digital Innovation One</p>
                      <div className="flex items-center gap-2 text-purple-300 text-sm mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>2016</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
