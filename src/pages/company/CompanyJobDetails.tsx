import React from 'react';
import { useParams } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  Edit3, 
  Users, 
  Eye, 
  Calendar, 
  MapPin, 
  Banknote,
  Clock,
  CheckCircle,
  Brain,
  Sparkles
} from 'lucide-react';

export const CompanyJobDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <CompanyLayout
      title="Detalhes da Vaga"
      description="Visualize todos os detalhes da vaga"
      actions={
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Users className="w-4 h-4" />
            Ver Candidatos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
            <Edit3 className="w-4 h-4" />
            Editar Vaga
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Desenvolvedor Full Stack Senior</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Candidatos</span>
              </div>
              <p className="text-2xl font-bold text-white">48</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Visualizações</span>
              </div>
              <p className="text-2xl font-bold text-white">324</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Publicada</span>
              </div>
              <p className="text-white">10/01/2024</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Status</span>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
                Ativa
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-white mb-4">Descrição da Vaga</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Estamos procurando um Desenvolvedor Full Stack Senior para se juntar ao nosso time de tecnologia. 
              O profissional será responsável por desenvolver e manter aplicações web de alta qualidade, 
              trabalhando tanto no frontend quanto no backend.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">Responsabilidades</h3>
            <ul className="text-white/80 space-y-2 mb-6">
              <li>• Desenvolver aplicações web usando React, Node.js e TypeScript</li>
              <li>• Colaborar com equipes de design e produto</li>
              <li>• Implementar testes automatizados</li>
              <li>• Participar de code reviews</li>
              <li>• Mentorear desenvolvedores júnior</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-4">Requisitos</h3>
            <ul className="text-white/80 space-y-2 mb-6">
              <li>• 5+ anos de experiência em desenvolvimento web</li>
              <li>• Experiência com React, Node.js, TypeScript</li>
              <li>• Conhecimento em bancos de dados SQL e NoSQL</li>
              <li>• Experiência com Git e metodologias ágeis</li>
              <li>• Inglês intermediário</li>
            </ul>
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
              <p className="text-white/60 text-sm">Score: 85/100</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Sugestões de Melhoria</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white/80 text-sm">Adicionar requisito específico sobre React Hooks</p>
                    <p className="text-white/60 text-xs mt-1">Pode aumentar a qualidade dos candidatos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white/80 text-sm">Melhorar descrição dos benefícios</p>
                    <p className="text-white/60 text-xs mt-1">Benefícios detalhados atraem mais candidatos</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">Análise de Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Taxa de aplicação</span>
                  <span className="text-green-400 font-medium">14.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Qualidade dos candidatos</span>
                  <span className="text-purple-400 font-medium">Alta</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Tempo médio de aplicação</span>
                  <span className="text-blue-400 font-medium">2.3 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
