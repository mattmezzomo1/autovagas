import React, { useState } from 'react';
import {
  X, Star, MapPin, Calendar, Mail, Phone, Briefcase,
  GraduationCap, Award, MessageSquare, Download,
  Edit, Tag, Heart, TrendingUp, Clock, Eye, Plus,
  ExternalLink, Github, Globe, FileText, Video, Users
} from 'lucide-react';

interface Talent {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileImage?: string;
  currentRole: string;
  company: string;
  experience: number;
  skills: string[];
  education: string;
  salaryExpectation: number;
  availability: 'available' | 'employed' | 'looking';
  rating: number;
  tags: string[];
  lastContact: string;
  source: 'application' | 'linkedin' | 'referral' | 'event' | 'direct';
  notes: string;
  interactions: {
    emails: number;
    calls: number;
    meetings: number;
    lastInteraction: string;
  };
  matchScore?: number;
  status: 'active' | 'archived' | 'blacklisted';
  portfolio?: {
    linkedin?: string;
    github?: string;
    website?: string;
    resume?: string;
  };
  workHistory?: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }[];
}

interface TalentProfileModalProps {
  talent: Talent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (talent: Talent) => void;
}

export const TalentProfileModal: React.FC<TalentProfileModalProps> = ({
  talent,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'interactions' | 'notes'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  if (!isOpen || !talent) return null;

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-500/20';
      case 'looking': return 'text-yellow-400 bg-yellow-500/20';
      case 'employed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available': return 'Disponível';
      case 'looking': return 'Procurando';
      case 'employed': return 'Empregado';
      default: return availability;
    }
  };

  const tabs = [
    { key: 'overview', label: 'Visão Geral', icon: Eye },
    { key: 'history', label: 'Histórico', icon: Clock },
    { key: 'interactions', label: 'Interações', icon: MessageSquare },
    { key: 'notes', label: 'Anotações', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {talent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">{talent.name}</h3>
                <p className="text-white/70 text-lg">{talent.currentRole}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{talent.rating}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(talent.availability)}`}>
                    {getAvailabilityLabel(talent.availability)}
                  </span>
                  {talent.matchScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm">Match:</span>
                      <span className="text-green-400 font-medium">{talent.matchScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.key
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <h4 className="text-white/70 text-sm font-medium mb-3">Ações Rápidas</h4>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                <Mail className="w-4 h-4" />
                Enviar Email
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                <Phone className="w-4 h-4" />
                Ligar
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm">
                <Calendar className="w-4 h-4" />
                Agendar
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                Baixar CV
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white/70 text-sm font-medium mb-3">Contato</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{talent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Phone className="w-3 h-3" />
                  <span>{talent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <MapPin className="w-3 h-3" />
                  <span>{talent.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span className="text-white/70 text-sm">Experiência</span>
                      </div>
                      <div className="text-white font-medium">{talent.experience} anos</div>
                      <div className="text-white/60 text-sm">{talent.company}</div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-green-400" />
                        <span className="text-white/70 text-sm">Educação</span>
                      </div>
                      <div className="text-white font-medium">{talent.education}</div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-white/70 text-sm">Expectativa Salarial</span>
                      </div>
                      <div className="text-white font-medium">R$ {talent.salaryExpectation.toLocaleString()}</div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/70 text-sm">Último Contato</span>
                      </div>
                      <div className="text-white font-medium">
                        {new Date(talent.lastContact).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Habilidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {talent.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-2 bg-purple-500/20 text-purple-200 rounded-lg text-sm border border-purple-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Tags</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nova tag"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm w-32"
                      />
                      <button
                        onClick={() => {
                          if (newTag.trim()) {
                            // Add tag logic here
                            setNewTag('');
                          }
                        }}
                        className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {talent.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-2 bg-blue-500/20 text-blue-200 rounded-lg text-sm border border-blue-500/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio Links */}
                {talent.portfolio && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Portfolio</h4>
                    <div className="flex gap-3">
                      {talent.portfolio.linkedin && (
                        <a
                          href={talent.portfolio.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          LinkedIn
                        </a>
                      )}
                      {talent.portfolio.github && (
                        <a
                          href={talent.portfolio.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-200 rounded-lg transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                      {talent.portfolio.website && (
                        <a
                          href={talent.portfolio.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-200 rounded-lg transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Interaction Stats */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Estatísticas de Interação</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-blue-400">{talent.interactions.emails}</div>
                      <div className="text-white/60 text-sm">Emails</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400">{talent.interactions.calls}</div>
                      <div className="text-white/60 text-sm">Ligações</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-purple-400">{talent.interactions.meetings}</div>
                      <div className="text-white/60 text-sm">Reuniões</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Anotações</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                    <p className="text-white/80">{talent.notes}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Adicionar Nova Anotação</h5>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Digite sua anotação..."
                    />
                    <button
                      onClick={() => {
                        if (newNote.trim()) {
                          // Add note logic here
                          setNewNote('');
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors"
                    >
                      Adicionar Anotação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
