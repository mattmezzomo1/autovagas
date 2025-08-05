import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  Save, 
  X, 
  Brain, 
  Sparkles, 
  Wand2,
  FileText,
  Mic,
  MicOff,
  Upload
} from 'lucide-react';

export const CompanyJobEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [jobData, setJobData] = useState({
    title: 'Desenvolvedor Full Stack Senior',
    department: 'Tecnologia',
    location: 'São Paulo, SP',
    workModel: 'hybrid',
    type: 'full-time',
    salaryMin: 8000,
    salaryMax: 12000,
    description: 'Estamos procurando um Desenvolvedor Full Stack Senior...',
    responsibilities: 'Desenvolver aplicações web usando React, Node.js e TypeScript...',
    requirements: '5+ anos de experiência em desenvolvimento web...',
    benefits: 'Vale refeição, Plano de saúde, Home office flexível...'
  });

  const handleSave = () => {
    // Save logic here
    navigate(`/company/job/${id}`);
  };

  const handleCancel = () => {
    navigate(`/company/job/${id}`);
  };

  const generateWithAI = async () => {
    setIsGeneratingWithAI(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGeneratingWithAI(false);
    }, 3000);
  };

  return (
    <CompanyLayout
      title="Editar Vaga"
      description="Edite os detalhes da vaga ou use IA para melhorar"
      actions={
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Assistente de IA</h2>
                <p className="text-white/60 text-sm">Melhore sua vaga automaticamente</p>
              </div>
            </div>
            
            <button
              onClick={generateWithAI}
              disabled={isGeneratingWithAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white rounded-lg transition-all"
            >
              {isGeneratingWithAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Otimizando...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Otimizar com IA
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Melhorar Descrição</p>
                <p className="text-white/60 text-xs">IA otimiza o texto</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Sugerir Requisitos</p>
                <p className="text-white/60 text-xs">Baseado no mercado</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <Mic className="w-5 h-5 text-pink-400" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Briefing por Áudio</p>
                <p className="text-white/60 text-xs">Fale e a IA escreve</p>
              </div>
            </button>
          </div>
        </div>

        {/* Job Form */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Título da Vaga *</label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => setJobData({...jobData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Departamento *</label>
                <select
                  value={jobData.department}
                  onChange={(e) => setJobData({...jobData, department: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Tecnologia" className="bg-slate-800">Tecnologia</option>
                  <option value="Produto" className="bg-slate-800">Produto</option>
                  <option value="Design" className="bg-slate-800">Design</option>
                  <option value="Marketing" className="bg-slate-800">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Localização *</label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) => setJobData({...jobData, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Modelo de Trabalho *</label>
                <select
                  value={jobData.workModel}
                  onChange={(e) => setJobData({...jobData, workModel: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="remote" className="bg-slate-800">Remoto</option>
                  <option value="hybrid" className="bg-slate-800">Híbrido</option>
                  <option value="onsite" className="bg-slate-800">Presencial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Salário Mínimo (R$)</label>
                <input
                  type="number"
                  value={jobData.salaryMin}
                  onChange={(e) => setJobData({...jobData, salaryMin: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Salário Máximo (R$)</label>
                <input
                  type="number"
                  value={jobData.salaryMax}
                  onChange={(e) => setJobData({...jobData, salaryMax: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Descrição da Vaga *</label>
              <textarea
                value={jobData.description}
                onChange={(e) => setJobData({...jobData, description: e.target.value})}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descreva a vaga, responsabilidades e o que a empresa oferece..."
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Responsabilidades *</label>
              <textarea
                value={jobData.responsibilities}
                onChange={(e) => setJobData({...jobData, responsibilities: e.target.value})}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Liste as principais responsabilidades do cargo..."
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Requisitos *</label>
              <textarea
                value={jobData.requirements}
                onChange={(e) => setJobData({...jobData, requirements: e.target.value})}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Liste os requisitos técnicos e experiências necessárias..."
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Benefícios</label>
              <textarea
                value={jobData.benefits}
                onChange={(e) => setJobData({...jobData, benefits: e.target.value})}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descreva os benefícios oferecidos..."
              />
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
