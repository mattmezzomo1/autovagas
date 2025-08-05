import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Eye,
  Pause,
  Play,
  Copy,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Sparkles
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  workModel: 'remote' | 'hybrid' | 'onsite';
  salaryMin: number;
  salaryMax: number;
  status: 'active' | 'paused' | 'draft' | 'closed';
  applicants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  aiScore?: number;
  aiSuggestions?: string[];
}

export const CompanyJobs: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // Mock data - in real app, this would come from API
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Desenvolvedor Full Stack Senior',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      type: 'full-time',
      workModel: 'hybrid',
      salaryMin: 8000,
      salaryMax: 12000,
      status: 'active',
      applicants: 48,
      views: 324,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
      aiScore: 85,
      aiSuggestions: ['Adicionar requisito de React', 'Melhorar descrição de benefícios']
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Produto',
      location: 'Remote',
      type: 'full-time',
      workModel: 'remote',
      salaryMin: 10000,
      salaryMax: 15000,
      status: 'active',
      applicants: 32,
      views: 256,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-12',
      aiScore: 92,
      aiSuggestions: []
    },
    {
      id: '3',
      title: 'Designer UX/UI',
      department: 'Design',
      location: 'São Paulo, SP',
      type: 'full-time',
      workModel: 'hybrid',
      salaryMin: 6000,
      salaryMax: 9000,
      status: 'paused',
      applicants: 15,
      views: 128,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10',
      aiScore: 78,
      aiSuggestions: ['Especificar ferramentas de design', 'Adicionar portfolio como requisito']
    },
    {
      id: '4',
      title: 'Analista de Marketing Digital',
      department: 'Marketing',
      location: 'São Paulo, SP',
      type: 'full-time',
      workModel: 'onsite',
      salaryMin: 4000,
      salaryMax: 6000,
      status: 'draft',
      applicants: 0,
      views: 0,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12',
      aiScore: 65,
      aiSuggestions: ['Revisar descrição da vaga', 'Adicionar mais detalhes sobre responsabilidades']
    }
  ]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'closed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'draft':
        return 'Rascunho';
      case 'closed':
        return 'Encerrada';
      default:
        return status;
    }
  };

  const getWorkModelLabel = (workModel: Job['workModel']) => {
    switch (workModel) {
      case 'remote':
        return 'Remoto';
      case 'hybrid':
        return 'Híbrido';
      case 'onsite':
        return 'Presencial';
      default:
        return workModel;
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
  };

  const handleJobAction = (jobId: string, action: string) => {
    switch (action) {
      case 'edit':
        navigate(`/company/job/${jobId}/edit`);
        break;
      case 'view':
        navigate(`/company/job/${jobId}`);
        break;
      case 'candidates':
        navigate(`/company/job/${jobId}/candidates`);
        break;
      case 'duplicate':
        // Handle duplicate logic
        break;
      case 'pause':
      case 'activate':
      case 'delete':
        // Handle status change logic
        break;
    }
  };

  return (
    <CompanyLayout
      title="Gestão de Vagas"
      description="Gerencie todas as suas vagas e acompanhe o desempenho"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <Link
            to="/company/job/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar vagas por título ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-slate-800">Todos os status</option>
              <option value="active" className="bg-slate-800">Ativas</option>
              <option value="paused" className="bg-slate-800">Pausadas</option>
              <option value="draft" className="bg-slate-800">Rascunhos</option>
              <option value="closed" className="bg-slate-800">Encerradas</option>
            </select>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="" className="bg-slate-800">Todos os departamentos</option>
                  <option value="tecnologia" className="bg-slate-800">Tecnologia</option>
                  <option value="produto" className="bg-slate-800">Produto</option>
                  <option value="design" className="bg-slate-800">Design</option>
                  <option value="marketing" className="bg-slate-800">Marketing</option>
                </select>

                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="" className="bg-slate-800">Todos os tipos</option>
                  <option value="full-time" className="bg-slate-800">Tempo integral</option>
                  <option value="part-time" className="bg-slate-800">Meio período</option>
                  <option value="contract" className="bg-slate-800">Contrato</option>
                  <option value="internship" className="bg-slate-800">Estágio</option>
                </select>

                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="" className="bg-slate-800">Todos os modelos</option>
                  <option value="remote" className="bg-slate-800">Remoto</option>
                  <option value="hybrid" className="bg-slate-800">Híbrido</option>
                  <option value="onsite" className="bg-slate-800">Presencial</option>
                </select>

                <input
                  type="text"
                  placeholder="Localização"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Vagas Ativas</p>
                <p className="text-2xl font-bold text-white">
                  {jobs.filter(j => j.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total de Candidatos</p>
                <p className="text-2xl font-bold text-white">
                  {jobs.reduce((sum, job) => sum + job.applicants, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Visualizações</p>
                <p className="text-2xl font-bold text-white">
                  {jobs.reduce((sum, job) => sum + job.views, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white">12.5%</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Vagas ({filteredJobs.length})
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                          {job.aiScore && job.aiScore >= 80 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30">
                              <Brain className="w-3 h-3 text-indigo-400" />
                              <span className="text-xs text-indigo-400 font-medium">IA Score: {job.aiScore}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location} • {getWorkModelLabel(job.workModel)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Banknote className="w-4 h-4" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-white/60">
                            <strong className="text-white">{job.applicants}</strong> candidatos
                          </span>
                          <span className="text-white/60">
                            <strong className="text-white">{job.views}</strong> visualizações
                          </span>
                          {job.aiSuggestions && job.aiSuggestions.length > 0 && (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Sparkles className="w-4 h-4" />
                              {job.aiSuggestions.length} sugestões da IA
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleJobAction(job.id, 'candidates')}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Ver Candidatos
                        </button>

                        <div className="relative group">
                          <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-2">
                              <button
                                onClick={() => handleJobAction(job.id, 'view')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Visualizar
                              </button>
                              <button
                                onClick={() => handleJobAction(job.id, 'edit')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleJobAction(job.id, 'duplicate')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                                Duplicar
                              </button>
                              <div className="border-t border-white/10 my-2"></div>
                              {job.status === 'active' ? (
                                <button
                                  onClick={() => handleJobAction(job.id, 'pause')}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 transition-colors"
                                >
                                  <Pause className="w-4 h-4" />
                                  Pausar
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleJobAction(job.id, 'activate')}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-green-400 hover:text-green-300 hover:bg-white/10 transition-colors"
                                >
                                  <Play className="w-4 h-4" />
                                  Ativar
                                </button>
                              )}
                              <button
                                onClick={() => handleJobAction(job.id, 'delete')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-white/60 mb-6">
                Tente ajustar os filtros ou criar uma nova vaga
              </p>
              <Link
                to="/company/job/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Criar Nova Vaga
              </Link>
            </div>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
};
