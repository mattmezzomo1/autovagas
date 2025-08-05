import React from 'react';
import { Link } from 'react-router-dom';
import { ScraperControl } from '../components/dashboard/ScraperControl';
import { JobsDatabaseStats } from '../components/dashboard/JobsDatabaseStats';
import { Bot, Database, BarChart, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';

export const ScraperDashboard: React.FC = () => {
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-purple-200 mb-1">
              Gerencie o robô de scraping e visualize as vagas encontradas
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              to="/activity"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 transition-colors"
            >
              <Bot className="w-5 h-5" />
              Histórico de Execuções
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200">
              <Database className="w-5 h-5" />
              Exportar Dados
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ScraperControl />

            <div className="mt-8 bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-400" />
                Desempenho do Robô
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-200">Taxa de Sucesso</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-200">Vagas Relevantes</span>
                    <span className="text-white">78%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-200">Tempo Médio de Processamento</span>
                    <span className="text-white">1.2s</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-200">Uso de Recursos</span>
                    <span className="text-white">45%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">243</p>
                    <p className="text-xs text-purple-200">Vagas Processadas Hoje</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">1,892</p>
                    <p className="text-xs text-purple-200">Total de Vagas Processadas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <JobsDatabaseStats />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
