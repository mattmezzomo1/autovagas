import React, { useState } from 'react';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Briefcase, 
  Brain,
  UserSearch,
  Send,
  Heart,
  Eye,
  MessageSquare
} from 'lucide-react';

export const CompanyTalentSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    experience: '',
    skills: []
  });

  const talents = [
    {
      id: '1',
      name: 'Ana Costa',
      title: 'UX/UI Designer Senior',
      location: 'São Paulo, SP',
      experience: 6,
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      aiMatch: 94,
      availability: 'open',
      lastActive: '2024-01-15',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      title: 'DevOps Engineer',
      location: 'Remote',
      experience: 8,
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      aiMatch: 89,
      availability: 'passive',
      lastActive: '2024-01-12',
      avatar: '/api/placeholder/40/40'
    }
  ];

  return (
    <CompanyLayout
      title="Busca de Talentos"
      description="Encontre e convide os melhores profissionais"
    >
      <div className="space-y-6">
        {/* AI Search Assistant */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Busca Inteligente</h2>
              <p className="text-white/60 text-sm">Descreva o perfil ideal e nossa IA encontrará os melhores candidatos</p>
            </div>
          </div>

          <div className="relative">
            <textarea
              placeholder="Ex: Preciso de um desenvolvedor React com 3+ anos de experiência, que saiba TypeScript e tenha trabalhado com Next.js..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Traditional Search */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por cargo, skills ou empresa anterior..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="" className="bg-slate-800">Localização</option>
              <option value="sp" className="bg-slate-800">São Paulo</option>
              <option value="rj" className="bg-slate-800">Rio de Janeiro</option>
              <option value="remote" className="bg-slate-800">Remoto</option>
            </select>

            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="" className="bg-slate-800">Experiência</option>
              <option value="junior" className="bg-slate-800">1-3 anos</option>
              <option value="pleno" className="bg-slate-800">3-5 anos</option>
              <option value="senior" className="bg-slate-800">5+ anos</option>
            </select>

            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="" className="bg-slate-800">Disponibilidade</option>
              <option value="open" className="bg-slate-800">Procurando ativamente</option>
              <option value="passive" className="bg-slate-800">Aberto a propostas</option>
            </select>

            <input
              type="text"
              placeholder="Skills (ex: React)"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Talentos Encontrados ({talents.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <UserSearch className="w-4 h-4" />
                Ordenado por compatibilidade IA
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {talents.map((talent) => (
              <div key={talent.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-12 h-12 rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{talent.name}</h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
                          <Brain className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400 font-medium">{talent.aiMatch}% match</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          talent.availability === 'open' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {talent.availability === 'open' ? 'Procurando' : 'Aberto a propostas'}
                        </span>
                      </div>

                      <p className="text-white/80 mb-2">{talent.title}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {talent.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {talent.experience} anos
                        </span>
                        <span className="text-white/40">
                          Ativo em {new Date(talent.lastActive).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {talent.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
                      <Send className="w-4 h-4" />
                      Convidar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
