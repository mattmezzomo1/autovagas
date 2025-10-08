import React, { useState, useEffect } from 'react';
import { X, Search, Filter, MapPin, DollarSign, Clock, Building, Target, Briefcase } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface SearchFilters {
  query: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  experience: string;
  jobType: string;
  remote: boolean;
  company: string;
  skills: string[];
}

interface SearchResult {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  remote: boolean;
  postedAt: string;
  matchScore: number;
  description: string;
  logo: string;
}

interface AdvancedSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectJob: (jobId: number) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isVisible,
  onClose,
  onSelectJob
}) => {
  const { addNotification } = useAppStore();
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    jobType: '',
    remote: false,
    company: '',
    skills: []
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp Solutions',
      location: 'São Paulo, SP',
      salary: 'R$ 8.000 - R$ 12.000',
      type: 'CLT',
      remote: true,
      postedAt: '2 dias atrás',
      matchScore: 92,
      description: 'Desenvolvedor React sênior para projetos inovadores...',
      logo: '🏢'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'StartupTech',
      location: 'Rio de Janeiro, RJ',
      salary: 'R$ 6.000 - R$ 9.000',
      type: 'CLT',
      remote: false,
      postedAt: '1 dia atrás',
      matchScore: 85,
      description: 'Desenvolvedor frontend para startup em crescimento...',
      logo: '🚀'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'WebSolutions',
      location: 'Belo Horizonte, MG',
      salary: 'R$ 7.000 - R$ 10.000',
      type: 'PJ',
      remote: true,
      postedAt: '3 dias atrás',
      matchScore: 78,
      description: 'Desenvolvedor full stack para projetos web...',
      logo: '💻'
    },
    {
      id: 4,
      title: 'React Native Developer',
      company: 'MobileCorp',
      location: 'Curitiba, PR',
      salary: 'R$ 8.500 - R$ 11.000',
      type: 'CLT',
      remote: true,
      postedAt: '4 dias atrás',
      matchScore: 88,
      description: 'Desenvolvedor React Native para apps móveis...',
      logo: '📱'
    },
    {
      id: 5,
      title: 'JavaScript Developer',
      company: 'CodeFactory',
      location: 'Porto Alegre, RS',
      salary: 'R$ 5.500 - R$ 8.000',
      type: 'CLT',
      remote: false,
      postedAt: '5 dias atrás',
      matchScore: 75,
      description: 'Desenvolvedor JavaScript para diversos projetos...',
      logo: '⚡'
    }
  ];

  const performSearch = () => {
    setIsSearching(true);
    
    // Simular busca com delay
    setTimeout(() => {
      let results = [...mockResults];
      
      // Filtrar por query
      if (filters.query) {
        results = results.filter(job => 
          job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.query.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.query.toLowerCase())
        );
      }
      
      // Filtrar por localização
      if (filters.location) {
        results = results.filter(job => 
          job.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      // Filtrar por empresa
      if (filters.company) {
        results = results.filter(job => 
          job.company.toLowerCase().includes(filters.company.toLowerCase())
        );
      }
      
      // Filtrar por remote
      if (filters.remote) {
        results = results.filter(job => job.remote);
      }
      
      // Filtrar por tipo de contrato
      if (filters.jobType) {
        results = results.filter(job => job.type === filters.jobType);
      }
      
      setSearchResults(results);
      setIsSearching(false);
      
      addNotification({
        type: 'success',
        message: `${results.length} vagas encontradas!`
      });
    }, 1000);
  };

  useEffect(() => {
    if (filters.query.length > 2) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [filters.query]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      experience: '',
      jobType: '',
      remote: false,
      company: '',
      skills: []
    });
    setSearchResults([]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-white text-lg font-semibold">Busca Avançada</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-white hover:bg-white/10"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            placeholder="Buscar vagas, empresas, tecnologias..."
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-900 border-b border-slate-700 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Cidade, Estado"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Empresa</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  placeholder="Nome da empresa"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Salário Mín.</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.salaryMin}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                  placeholder="R$ 0"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Salário Máx.</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.salaryMax}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                  placeholder="R$ 50.000"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Tipo de Contrato</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Estágio">Estágio</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => handleFilterChange('remote', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                />
                Trabalho Remoto
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={performSearch}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
        {isSearching ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Buscando vagas...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((job) => (
              <Card key={job.id} className="bg-black/20 border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
                    onClick={() => onSelectJob(job.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-sm">{job.title}</h3>
                          <p className="text-gray-400 text-sm">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                          <Target className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">{job.matchScore}%</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{job.postedAt}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm line-clamp-2">{job.description}</p>
                      
                      {job.remote && (
                        <div className="mt-2">
                          <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-full">
                            🏠 Remoto
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filters.query.length > 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Nenhuma vaga encontrada</p>
            <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Digite algo para buscar</p>
            <p className="text-gray-500 text-sm">Encontre vagas por cargo, empresa ou tecnologia</p>
          </div>
        )}
      </div>
    </div>
  );
};
