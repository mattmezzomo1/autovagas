import React, { useState } from 'react';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar,
  Download,
  Filter,
  Brain,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

export const CompanyAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const stats = {
    totalJobs: 12,
    totalApplications: 248,
    totalViews: 1847,
    conversionRate: 13.4,
    avgTimeToHire: 18,
    topPerformingJob: 'Desenvolvedor Full Stack Senior'
  };

  return (
    <CompanyLayout
      title="Analytics"
      description="Acompanhe o desempenho das suas vagas e processos seletivos"
      actions={
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d" className="bg-slate-800">Últimos 7 dias</option>
            <option value="30d" className="bg-slate-800">Últimos 30 dias</option>
            <option value="90d" className="bg-slate-800">Últimos 90 dias</option>
            <option value="1y" className="bg-slate-800">Último ano</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+12%</span>
            </div>
            <p className="text-white/60 text-sm">Vagas Ativas</p>
            <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+8%</span>
            </div>
            <p className="text-white/60 text-sm">Candidaturas</p>
            <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+15%</span>
            </div>
            <p className="text-white/60 text-sm">Visualizações</p>
            <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+2.1%</span>
            </div>
            <p className="text-white/60 text-sm">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications Over Time */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Candidaturas ao Longo do Tempo</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 52, 38, 61, 73, 58, 67, 49, 55, 62, 71, 68, 74, 59].map((value, index) => (
                <div key={index} className="flex-1 bg-gradient-to-t from-purple-500/20 to-purple-500/60 rounded-t-lg relative group">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-400 hover:to-purple-300"
                    style={{ height: `${(value / 80) * 100}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-white/60 text-sm mt-4">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Vagas com Melhor Performance</h3>
            <div className="space-y-4">
              {[
                { title: 'Desenvolvedor Full Stack Senior', applications: 48, views: 324, rate: 14.8 },
                { title: 'Product Manager', applications: 32, views: 256, rate: 12.5 },
                { title: 'Designer UX/UI', applications: 28, views: 198, rate: 14.1 },
                { title: 'Analista de Marketing', applications: 15, views: 142, rate: 10.6 }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">{job.title}</h4>
                    <p className="text-white/60 text-sm">{job.applications} candidatos • {job.views} views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">{job.rate}%</p>
                    <p className="text-white/60 text-sm">conversão</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Insights da IA</h2>
              <p className="text-white/60 text-sm">Análises e recomendações baseadas em dados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-medium text-white">Oportunidades</h3>
              </div>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Vagas de tecnologia têm 23% mais visualizações</li>
                <li>• Salários competitivos aumentam aplicações em 31%</li>
                <li>• Descrições com benefícios detalhados convertem melhor</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-medium text-white">Tempo de Contratação</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">Média atual</span>
                  <span className="text-white font-medium">{stats.avgTimeToHire} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Mercado</span>
                  <span className="text-white/60">22 dias</span>
                </div>
                <p className="text-green-400 text-sm">18% mais rápido que a média</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-medium text-white">Recomendações</h3>
              </div>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Publique vagas às terças-feiras para mais visibilidade</li>
                <li>• Adicione vídeos institucionais nas vagas</li>
                <li>• Implemente processo de feedback automático</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Métricas Detalhadas</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-medium py-3">Vaga</th>
                  <th className="text-left text-white/60 font-medium py-3">Status</th>
                  <th className="text-left text-white/60 font-medium py-3">Candidatos</th>
                  <th className="text-left text-white/60 font-medium py-3">Visualizações</th>
                  <th className="text-left text-white/60 font-medium py-3">Taxa</th>
                  <th className="text-left text-white/60 font-medium py-3">Tempo Médio</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'Desenvolvedor Full Stack Senior', status: 'Ativa', candidates: 48, views: 324, rate: 14.8, time: 15 },
                  { title: 'Product Manager', status: 'Ativa', candidates: 32, views: 256, rate: 12.5, time: 22 },
                  { title: 'Designer UX/UI', status: 'Pausada', candidates: 28, views: 198, rate: 14.1, time: 18 },
                  { title: 'Analista de Marketing', status: 'Rascunho', candidates: 0, views: 0, rate: 0, time: 0 }
                ].map((job, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-4 text-white">{job.title}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Ativa' ? 'bg-green-500/20 text-green-400' :
                        job.status === 'Pausada' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 text-white">{job.candidates}</td>
                    <td className="py-4 text-white">{job.views}</td>
                    <td className="py-4 text-white">{job.rate}%</td>
                    <td className="py-4 text-white">{job.time > 0 ? `${job.time} dias` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
