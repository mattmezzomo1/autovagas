import React, { useEffect, useState } from 'react';
import { BarChart, PieChart, Database, Briefcase, Building2, MapPin } from 'lucide-react';
import { autoApplyService } from '../../services/webscraper/AutoApplyService';
import { ScrapedJob } from '../../services/webscraper/types';

export const JobsDatabaseStats: React.FC = () => {
  const [stats, setStats] = useState<Record<string, any>>({
    totalJobs: 0,
    totalApplications: 0,
    categories: {},
    platforms: {}
  });
  
  const [recentJobs, setRecentJobs] = useState<ScrapedJob[]>([]);
  
  useEffect(() => {
    // Obtém as estatísticas do banco de dados
    const dbStats = autoApplyService.getDatabaseStats();
    setStats(dbStats);
    
    // Obtém as vagas mais recentes
    const allJobs = autoApplyService.getAllJobs();
    const sortedJobs = [...allJobs].sort((a, b) => {
      const dateA = a.scrapedAt || new Date(0);
      const dateB = b.scrapedAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    setRecentJobs(sortedJobs.slice(0, 5));
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Banco de Dados de Vagas</h2>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-200">Total de Vagas</p>
              <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Aplicações</p>
              <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-pink-200">Empresas</p>
              <p className="text-2xl font-bold text-white">
                {new Set(autoApplyService.getAllJobs().map(job => job.company)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-200">Localizações</p>
              <p className="text-2xl font-bold text-white">
                {new Set(autoApplyService.getAllJobs().map(job => job.location)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de categorias */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            Vagas por Categoria
          </h3>
          
          <div className="space-y-3">
            {Object.entries(stats.categories || {}).map(([category, count]) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-full bg-white/5 rounded-full h-4">
                  <div 
                    className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${Math.min(100, (Number(count) / Math.max(1, stats.totalJobs)) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-purple-200 whitespace-nowrap">
                  {category} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gráfico de plataformas */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-400" />
            Vagas por Plataforma
          </h3>
          
          <div className="space-y-3">
            {Object.entries(stats.platforms || {}).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-2">
                <div className="w-full bg-white/5 rounded-full h-4">
                  <div 
                    className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${Math.min(100, (Number(count) / Math.max(1, stats.totalJobs)) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-blue-200 whitespace-nowrap">
                  {platform} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Vagas recentes */}
      <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Vagas Recentes</h3>
        
        {recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">{job.title}</h4>
                    <p className="text-sm text-purple-200">{job.company}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{job.location}</span>
                      {job.salary && <span>• {job.salary}</span>}
                      {job.jobType && <span>• {job.jobType}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                      {job.platform}
                    </span>
                    {job.workModel && (
                      <span className="text-xs mt-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                        {job.workModel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Nenhuma vaga encontrada</p>
        )}
      </div>
    </div>
  );
};
