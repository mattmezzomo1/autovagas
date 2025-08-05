import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { TalentProfileModal } from '../../components/company/TalentProfileModal';
import { InterviewScheduler } from '../../components/company/InterviewScheduler';
import {
  Search, Filter, Users, Star, MapPin, Calendar,
  Mail, Phone, Eye, MessageSquare, UserPlus,
  Download, Upload, Tag, BarChart3, TrendingUp,
  Heart, Briefcase, GraduationCap, Award, Plus,
  Clock, CheckCircle, XCircle, UserCheck, FileText,
  Video, ThumbsUp, ThumbsDown, Handshake
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
  pipelineStatus: 'inscrito' | 'entrevista_agendada' | 'entrevista_feita' | 'pre_aprovado' | 'rejeitado' | 'contratado';
  interviewDate?: string;
  rejectionReason?: string;
  contractDate?: string;
}

type PipelineTab = 'inscrito' | 'entrevista_agendada' | 'entrevista_feita' | 'pre_aprovado' | 'rejeitado' | 'contratado';

export const TalentCRM: React.FC = () => {
  const navigate = useNavigate();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [activeTab, setActiveTab] = useState<PipelineTab>('inscrito');
  const [showScheduler, setShowScheduler] = useState(false);
  const [candidateToSchedule, setCandidateToSchedule] = useState<Talent | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    availability: 'all',
    experience: 'all',
    location: 'all',
    skills: [] as string[],
    tags: [] as string[],
    rating: 0,
    salary: { min: 0, max: 50000 },
    source: 'all'
  });

  // Mock data
  useEffect(() => {
    const mockTalents: Talent[] = [
      {
        id: '1',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-9999',
        location: 'São Paulo, SP',
        currentRole: 'Desenvolvedora Full Stack',
        company: 'Tech Corp',
        experience: 5,
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
        education: 'Ciência da Computação - USP',
        salaryExpectation: 12000,
        availability: 'looking',
        rating: 4.8,
        tags: ['high-potential', 'senior', 'full-stack'],
        lastContact: '2024-01-10T10:30:00Z',
        source: 'linkedin',
        notes: 'Excelente candidata, muito proativa e com ótimas referências.',
        interactions: {
          emails: 5,
          calls: 2,
          meetings: 1,
          lastInteraction: '2024-01-10T10:30:00Z'
        },
        matchScore: 92,
        status: 'active',
        pipelineStatus: 'entrevista_agendada',
        interviewDate: '2024-01-15T14:00:00Z'
      },
      {
        id: '2',
        name: 'Carlos Santos',
        email: 'carlos.santos@email.com',
        phone: '(11) 88888-8888',
        location: 'Rio de Janeiro, RJ',
        currentRole: 'Desenvolvedor Backend',
        company: 'StartupXYZ',
        experience: 3,
        skills: ['Node.js', 'Python', 'MongoDB', 'Docker', 'Kubernetes'],
        education: 'Engenharia de Software - UFRJ',
        salaryExpectation: 8000,
        availability: 'employed',
        rating: 4.2,
        tags: ['backend', 'devops', 'junior-senior'],
        lastContact: '2024-01-08T14:20:00Z',
        source: 'application',
        notes: 'Bom conhecimento técnico, mas precisa desenvolver soft skills.',
        interactions: {
          emails: 3,
          calls: 1,
          meetings: 0,
          lastInteraction: '2024-01-08T14:20:00Z'
        },
        matchScore: 76,
        status: 'active',
        pipelineStatus: 'inscrito'
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        phone: '(11) 77777-7777',
        location: 'São Paulo, SP',
        currentRole: 'Tech Lead',
        company: 'BigTech Inc',
        experience: 8,
        skills: ['React', 'Vue.js', 'Node.js', 'AWS', 'Team Leadership'],
        education: 'Mestrado em Computação - UNICAMP',
        salaryExpectation: 18000,
        availability: 'available',
        rating: 4.9,
        tags: ['leadership', 'senior', 'frontend', 'mentor'],
        lastContact: '2024-01-12T09:15:00Z',
        source: 'referral',
        notes: 'Liderança excepcional, mentora natural, excelente fit cultural.',
        interactions: {
          emails: 8,
          calls: 4,
          meetings: 3,
          lastInteraction: '2024-01-12T09:15:00Z'
        },
        matchScore: 95,
        status: 'active',
        pipelineStatus: 'contratado',
        contractDate: '2024-01-10T00:00:00Z'
      },
      {
        id: '4',
        name: 'João Pereira',
        email: 'joao.pereira@email.com',
        phone: '(11) 66666-6666',
        location: 'Belo Horizonte, MG',
        currentRole: 'Desenvolvedor Frontend',
        company: 'WebAgency',
        experience: 4,
        skills: ['React', 'TypeScript', 'CSS', 'Figma', 'Jest'],
        education: 'Design Digital - PUC-MG',
        salaryExpectation: 9000,
        availability: 'looking',
        rating: 4.3,
        tags: ['frontend', 'design', 'mid-level'],
        lastContact: '2024-01-09T16:30:00Z',
        source: 'application',
        notes: 'Boa experiência em frontend, conhece bem design systems.',
        interactions: {
          emails: 4,
          calls: 2,
          meetings: 1,
          lastInteraction: '2024-01-09T16:30:00Z'
        },
        matchScore: 82,
        status: 'active',
        pipelineStatus: 'entrevista_feita'
      },
      {
        id: '5',
        name: 'Fernanda Costa',
        email: 'fernanda.costa@email.com',
        phone: '(11) 55555-5555',
        location: 'São Paulo, SP',
        currentRole: 'Product Manager',
        company: 'TechStart',
        experience: 6,
        skills: ['Product Strategy', 'Analytics', 'Scrum', 'SQL', 'Figma'],
        education: 'MBA em Gestão - FGV',
        salaryExpectation: 15000,
        availability: 'employed',
        rating: 4.7,
        tags: ['product', 'strategy', 'senior'],
        lastContact: '2024-01-11T11:00:00Z',
        source: 'linkedin',
        notes: 'Excelente visão de produto, experiência em growth.',
        interactions: {
          emails: 6,
          calls: 3,
          meetings: 2,
          lastInteraction: '2024-01-11T11:00:00Z'
        },
        matchScore: 89,
        status: 'active',
        pipelineStatus: 'pre_aprovado'
      },
      {
        id: '6',
        name: 'Ricardo Lima',
        email: 'ricardo.lima@email.com',
        phone: '(11) 44444-4444',
        location: 'Campinas, SP',
        currentRole: 'DevOps Engineer',
        company: 'CloudCorp',
        experience: 5,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
        education: 'Engenharia da Computação - UNICAMP',
        salaryExpectation: 13000,
        availability: 'available',
        rating: 3.8,
        tags: ['devops', 'cloud', 'automation'],
        lastContact: '2024-01-07T13:45:00Z',
        source: 'event',
        notes: 'Conhecimento técnico sólido, mas falta experiência em liderança.',
        interactions: {
          emails: 2,
          calls: 1,
          meetings: 0,
          lastInteraction: '2024-01-07T13:45:00Z'
        },
        matchScore: 65,
        status: 'active',
        pipelineStatus: 'rejeitado',
        rejectionReason: 'Não atende aos requisitos de liderança da vaga'
      }
    ];

    setTalents(mockTalents);
    setFilteredTalents(mockTalents);
    setIsLoading(false);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = talents;

    // Filter by pipeline status (active tab)
    filtered = filtered.filter(talent => talent.pipelineStatus === activeTab);

    // Search
    if (searchTerm) {
      filtered = filtered.filter(talent =>
        talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        talent.currentRole.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filters
    if (filters.availability !== 'all') {
      filtered = filtered.filter(talent => talent.availability === filters.availability);
    }

    if (filters.experience !== 'all') {
      const [min, max] = filters.experience.split('-').map(Number);
      filtered = filtered.filter(talent => {
        if (max) return talent.experience >= min && talent.experience <= max;
        return talent.experience >= min;
      });
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(talent => talent.location.includes(filters.location));
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(talent =>
        filters.skills.some(skill => talent.skills.includes(skill))
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(talent =>
        filters.tags.some(tag => talent.tags.includes(tag))
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(talent => talent.rating >= filters.rating);
    }

    if (filters.source !== 'all') {
      filtered = filtered.filter(talent => talent.source === filters.source);
    }

    setFilteredTalents(filtered);
  }, [talents, searchTerm, filters, activeTab]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-500/20';
      case 'looking': return 'text-yellow-400 bg-yellow-500/20';
      case 'employed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPipelineStatusInfo = (status: string) => {
    switch (status) {
      case 'inscrito':
        return { label: 'Inscrito', icon: FileText, color: 'text-blue-400 bg-blue-500/20' };
      case 'entrevista_agendada':
        return { label: 'Entrevista Agendada', icon: Calendar, color: 'text-yellow-400 bg-yellow-500/20' };
      case 'entrevista_feita':
        return { label: 'Entrevista Feita', icon: Video, color: 'text-purple-400 bg-purple-500/20' };
      case 'pre_aprovado':
        return { label: 'Pré-aprovado', icon: ThumbsUp, color: 'text-green-400 bg-green-500/20' };
      case 'rejeitado':
        return { label: 'Rejeitado', icon: ThumbsDown, color: 'text-red-400 bg-red-500/20' };
      case 'contratado':
        return { label: 'Contratado', icon: Handshake, color: 'text-emerald-400 bg-emerald-500/20' };
      default:
        return { label: 'Desconhecido', icon: FileText, color: 'text-gray-400 bg-gray-500/20' };
    }
  };

  const getTabInfo = (tab: PipelineTab) => {
    switch (tab) {
      case 'inscrito':
        return { label: 'Inscritos', icon: FileText, count: talents.filter(t => t.pipelineStatus === 'inscrito').length };
      case 'entrevista_agendada':
        return { label: 'Entrevista Agendada', icon: Calendar, count: talents.filter(t => t.pipelineStatus === 'entrevista_agendada').length };
      case 'entrevista_feita':
        return { label: 'Entrevista Feita', icon: Video, count: talents.filter(t => t.pipelineStatus === 'entrevista_feita').length };
      case 'pre_aprovado':
        return { label: 'Pré-aprovados', icon: ThumbsUp, count: talents.filter(t => t.pipelineStatus === 'pre_aprovado').length };
      case 'rejeitado':
        return { label: 'Rejeitados', icon: ThumbsDown, count: talents.filter(t => t.pipelineStatus === 'rejeitado').length };
      case 'contratado':
        return { label: 'Contratados', icon: Handshake, count: talents.filter(t => t.pipelineStatus === 'contratado').length };
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return '💼';
      case 'application': return '📝';
      case 'referral': return '👥';
      case 'event': return '🎯';
      case 'direct': return '📞';
      default: return '❓';
    }
  };

  const handleSelectTalent = (talentId: string) => {
    setSelectedTalents(prev =>
      prev.includes(talentId)
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTalents.length === filteredTalents.length) {
      setSelectedTalents([]);
    } else {
      setSelectedTalents(filteredTalents.map(t => t.id));
    }
  };

  const handleScheduleInterview = (talent: Talent) => {
    setCandidateToSchedule(talent);
    setShowScheduler(true);
  };

  const handleScheduleConfirm = (scheduleData: any) => {
    // Atualizar o status do talento para "entrevista_agendada"
    setTalents(prev => prev.map(t =>
      t.id === scheduleData.candidateId
        ? { ...t, pipelineStatus: 'entrevista_agendada', interviewDate: `${scheduleData.date}T${scheduleData.time}:00Z` }
        : t
    ));

    setShowScheduler(false);
    setCandidateToSchedule(null);
  };

  if (isLoading) {
    return (
      <CompanyLayout title="Carregando..." description="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout
      title="CRM de Talentos"
      description="Gerencie seu banco de talentos e construa relacionamentos duradouros"
      actions={
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
            <UserPlus className="w-4 h-4" />
            Adicionar Talento
          </button>
        </div>
      }
    >
      <div className="space-y-6">




        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, email, skills ou cargo..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
              
              <div className="flex bg-white/5 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-3 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-500/20 text-purple-200' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-purple-500/20 text-purple-200' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Disponibilidade</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponível</option>
                  <option value="looking">Procurando</option>
                  <option value="employed">Empregado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Experiência</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="0-2">0-2 anos</option>
                  <option value="3-5">3-5 anos</option>
                  <option value="6-10">6-10 anos</option>
                  <option value="10">10+ anos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Localização</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="São Paulo">São Paulo</option>
                  <option value="Rio de Janeiro">Rio de Janeiro</option>
                  <option value="Belo Horizonte">Belo Horizonte</option>
                  <option value="Remoto">Remoto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Avaliação Mínima</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value={0}>Todas</option>
                  <option value={3}>3+ estrelas</option>
                  <option value={4}>4+ estrelas</option>
                  <option value={4.5}>4.5+ estrelas</option>
                </select>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedTalents.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 mt-4">
              <div className="text-purple-200 text-sm">
                {selectedTalents.length} talento(s) selecionado(s)
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  Enviar Email
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                  <Tag className="w-4 h-4" />
                  Adicionar Tag
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Tabs */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Pipeline de Recrutamento</h2>
          <div className="flex flex-wrap gap-2">
            {(['inscrito', 'entrevista_agendada', 'entrevista_feita', 'pre_aprovado', 'rejeitado', 'contratado'] as PipelineTab[]).map((tab) => {
              const tabInfo = getTabInfo(tab);
              const IconComponent = tabInfo.icon;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{tabInfo.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {tabInfo.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Talents List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">
                Talentos ({filteredTalents.length})
              </h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {selectedTalents.length === filteredTalents.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalents.map((talent) => (
                <div key={talent.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTalents.includes(talent.id)}
                        onChange={() => handleSelectTalent(talent.id)}
                        className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                      />
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {talent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{talent.name}</h3>
                        <p className="text-white/60 text-sm">{talent.currentRole}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{talent.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Briefcase className="w-4 h-4" />
                      <span>{talent.company} • {talent.experience} anos</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{talent.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <GraduationCap className="w-4 h-4" />
                      <span>{talent.education}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(talent.availability)}`}>
                      {getAvailabilityLabel(talent.availability)}
                    </span>
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <span>{getSourceIcon(talent.source)}</span>
                      <span>Via {talent.source}</span>
                    </div>
                  </div>

                  {/* Pipeline Status Info */}
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    {talent.pipelineStatus === 'entrevista_agendada' && talent.interviewDate && (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Entrevista: {new Date(talent.interviewDate).toLocaleDateString('pt-BR')} às {new Date(talent.interviewDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {talent.pipelineStatus === 'entrevista_feita' && (
                      <div className="flex items-center gap-2 text-purple-400 text-sm">
                        <Video className="w-4 h-4" />
                        <span>Aguardando feedback da entrevista</span>
                      </div>
                    )}
                    {talent.pipelineStatus === 'pre_aprovado' && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Candidato pré-aprovado - Próximos passos</span>
                      </div>
                    )}
                    {talent.pipelineStatus === 'rejeitado' && talent.rejectionReason && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Motivo: {talent.rejectionReason}</span>
                      </div>
                    )}
                    {talent.pipelineStatus === 'contratado' && talent.contractDate && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <Handshake className="w-4 h-4" />
                        <span>Contratado em {new Date(talent.contractDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {talent.pipelineStatus === 'inscrito' && (
                      <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <FileText className="w-4 h-4" />
                        <span>Candidatura recebida - Aguardando triagem</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {talent.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {talent.skills.length > 3 && (
                        <span className="text-xs text-white/60 px-2 py-1">
                          +{talent.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {talent.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {talent.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                        {talent.tags.length > 2 && (
                          <span className="text-xs text-white/60 px-2 py-1">
                            +{talent.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Match Score */}
                  {talent.matchScore && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Match Score</span>
                        <span className="text-green-400 font-medium">{talent.matchScore}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${talent.matchScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Interactions */}
                  <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                    <div className="flex gap-3">
                      <span>📧 {talent.interactions.emails}</span>
                      <span>📞 {talent.interactions.calls}</span>
                      <span>🤝 {talent.interactions.meetings}</span>
                    </div>
                    <span>
                      {new Date(talent.lastContact).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTalent(talent)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Perfil
                    </button>

                    {/* Pipeline-specific actions */}
                    {talent.pipelineStatus === 'inscrito' && (
                      <button
                        onClick={() => handleScheduleInterview(talent)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg transition-colors text-sm"
                      >
                        <Calendar className="w-4 h-4" />
                        Agendar
                      </button>
                    )}

                    {talent.pipelineStatus === 'entrevista_agendada' && (
                      <button className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm">
                        <Video className="w-4 h-4" />
                        Entrevista
                      </button>
                    )}

                    {talent.pipelineStatus === 'entrevista_feita' && (
                      <>
                        <button className="flex items-center justify-center gap-1 px-2 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center gap-1 px-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors text-sm">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {talent.pipelineStatus === 'pre_aprovado' && (
                      <button className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-lg transition-colors text-sm">
                        <Handshake className="w-4 h-4" />
                        Contratar
                      </button>
                    )}

                    <button className="flex items-center justify-center px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTalents.map((talent) => (
                <div key={talent.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTalents.includes(talent.id)}
                        onChange={() => handleSelectTalent(talent.id)}
                        className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                      />
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {talent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{talent.name}</h3>
                        <p className="text-white/60 text-sm">{talent.currentRole} • {talent.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-white text-sm">{talent.experience}</div>
                        <div className="text-white/60 text-xs">anos</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm">{talent.rating}</span>
                        </div>
                        <div className="text-white/60 text-xs">avaliação</div>
                      </div>

                      {talent.matchScore && (
                        <div className="text-center">
                          <div className="text-green-400 text-sm font-medium">{talent.matchScore}%</div>
                          <div className="text-white/60 text-xs">match</div>
                        </div>
                      )}

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(talent.availability)}`}>
                        {getAvailabilityLabel(talent.availability)}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTalent(talent)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTalents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum talento encontrado</h3>
              <p className="text-white/60">Tente ajustar os filtros ou adicionar novos talentos ao seu CRM</p>
            </div>
          )}
        </div>

        {/* Talent Profile Modal */}
        <TalentProfileModal
          talent={selectedTalent}
          isOpen={!!selectedTalent}
          onClose={() => setSelectedTalent(null)}
          onUpdate={(updatedTalent) => {
            setTalents(prev => prev.map(t => t.id === updatedTalent.id ? updatedTalent : t));
            setSelectedTalent(null);
          }}
        />

        {/* Interview Scheduler */}
        <InterviewScheduler
          isOpen={showScheduler}
          onClose={() => {
            setShowScheduler(false);
            setCandidateToSchedule(null);
          }}
          candidate={candidateToSchedule ? {
            id: candidateToSchedule.id,
            name: candidateToSchedule.name,
            email: candidateToSchedule.email,
            currentRole: candidateToSchedule.currentRole
          } : null}
          onSchedule={handleScheduleConfirm}
        />
      </div>
    </CompanyLayout>
  );
};
