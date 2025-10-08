import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Users,
  Star,
  MapPin,
  Loader2
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { careerGoalsService, CreateCareerGoalRequest } from '../services/careerGoals.service';

interface CareerGoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const CareerGoals: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGoalType, setSelectedGoalType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetPosition: '',
    targetCompany: '',
    companyType: '',
    targetLevel: '',
    targetSalary: '',
    timeframe: '12', // meses
    currentPosition: '',
    currentSalary: '',
    notes: ''
  });

  const goalTypes: CareerGoalOption[] = [
    {
      id: 'specific-company',
      title: 'Cargo específico em empresa específica',
      description: 'Ex: "Desenvolvedor Senior na Google"',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'company-range',
      title: 'Cargo específico em tipo de empresa',
      description: 'Ex: "Product Manager em uma startup"',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'level-specific',
      title: 'Nível específico',
      description: 'Ex: "C-level" ou "Diretor de Engenharia"',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'salary-level',
      title: 'Nível salarial',
      description: 'Ex: "Ganhar R$ 15.000/mês"',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const handleGoalTypeSelect = (goalType: string) => {
    setSelectedGoalType(goalType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Preparar dados baseados no tipo de objetivo
      const careerGoalData: CreateCareerGoalRequest = {
        title: getGoalTitle(),
        description: getGoalDescription(),
        targetPosition: formData.targetPosition || formData.targetLevel,
        targetCompany: formData.targetCompany || undefined,
        targetIndustry: getTargetIndustry(),
        targetSalaryMin: formData.targetSalary ? parseSalary(formData.targetSalary) : undefined,
        targetSalaryMax: formData.targetSalary ? parseSalary(formData.targetSalary) * 1.2 : undefined,
        timeframe: convertTimeframeToEnum(formData.timeframe),
        priority: 3,
        requiredSkills: [],
        notes: formData.notes
      };

      // Criar o objetivo de carreira
      const careerGoal = await careerGoalsService.createCareerGoal(careerGoalData);

      // Gerar roadmap automaticamente
      await careerGoalsService.generateRoadmap(careerGoal.id, {
        currentExperience: formData.currentPosition,
        timeAvailabilityHours: 10, // Default 10 horas por semana
        preferredLearningStyle: 'visual'
      });

      // Navegar para a dashboard com a aba de carreira ativa
      navigate('/dashboard?tab=career');
    } catch (error) {
      console.error('Erro ao criar objetivo de carreira:', error);
      alert('Erro ao criar objetivo de carreira. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getGoalTitle = (): string => {
    switch (selectedGoalType) {
      case 'specific-company':
        return `${formData.targetPosition} na ${formData.targetCompany}`;
      case 'company-range':
        return `${formData.targetPosition} em ${formData.companyType}`;
      case 'level-specific':
        return `Alcançar nível ${formData.targetLevel}`;
      case 'salary-level':
        return `Alcançar salário de ${formData.targetSalary}`;
      default:
        return 'Objetivo de Carreira';
    }
  };

  const getGoalDescription = (): string => {
    const timeframeText = careerGoalsService.formatTimeframe(parseInt(formData.timeframe));
    return `Objetivo de carreira a ser alcançado em ${timeframeText}. Posição atual: ${formData.currentPosition || 'Não informado'}.`;
  };

  const getTargetIndustry = (): string => {
    switch (selectedGoalType) {
      case 'specific-company':
        return 'Tecnologia'; // Default, poderia ser inferido da empresa
      case 'company-range':
        return formData.companyType || 'Geral';
      case 'level-specific':
        return 'Geral';
      case 'salary-level':
        return 'Geral';
      default:
        return 'Geral';
    }
  };

  const parseSalary = (salaryString: string): number => {
    // Remove R$, pontos e vírgulas, converte para número
    const cleanSalary = salaryString.replace(/[R$\s.,]/g, '');
    return parseInt(cleanSalary) || 0;
  };

  const convertTimeframeToEnum = (months: string): 'short_term' | 'medium_term' | 'long_term' => {
    const monthsNum = parseInt(months);
    if (monthsNum <= 24) return 'short_term';
    if (monthsNum <= 60) return 'medium_term';
    return 'long_term';
  };

  const renderForm = () => {
    if (!selectedGoalType) return null;

    const selectedOption = goalTypes.find(type => type.id === selectedGoalType);

    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedOption?.color} flex items-center justify-center`}>
            {selectedOption?.icon && <selectedOption.icon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{selectedOption?.title}</h3>
            <p className="text-purple-200">{selectedOption?.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos específicos baseados no tipo de objetivo */}
          {selectedGoalType === 'specific-company' && (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Cargo desejado
                </label>
                <input
                  type="text"
                  value={formData.targetPosition}
                  onChange={(e) => setFormData({...formData, targetPosition: e.target.value})}
                  placeholder="Ex: Desenvolvedor Senior, Product Manager..."
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Empresa específica
                </label>
                <input
                  type="text"
                  value={formData.targetCompany}
                  onChange={(e) => setFormData({...formData, targetCompany: e.target.value})}
                  placeholder="Ex: Google, Microsoft, Nubank..."
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </>
          )}

          {selectedGoalType === 'company-range' && (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Cargo desejado
                </label>
                <input
                  type="text"
                  value={formData.targetPosition}
                  onChange={(e) => setFormData({...formData, targetPosition: e.target.value})}
                  placeholder="Ex: Product Manager, UX Designer..."
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Tipo de empresa
                </label>
                <select
                  value={formData.companyType}
                  onChange={(e) => setFormData({...formData, companyType: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione o tipo de empresa</option>
                  <option value="startup">Startup</option>
                  <option value="multinacional">Multinacional</option>
                  <option value="empresa-media">Empresa de médio porte</option>
                  <option value="consultoria">Consultoria</option>
                  <option value="banco">Banco/Fintech</option>
                  <option value="tech">Empresa de tecnologia</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </>
          )}

          {selectedGoalType === 'level-specific' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Nível desejado
              </label>
              <select
                value={formData.targetLevel}
                onChange={(e) => setFormData({...formData, targetLevel: e.target.value})}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Selecione o nível desejado</option>
                <option value="junior">Júnior</option>
                <option value="pleno">Pleno</option>
                <option value="senior">Sênior</option>
                <option value="lead">Tech Lead</option>
                <option value="manager">Manager</option>
                <option value="senior-manager">Senior Manager</option>
                <option value="diretor">Diretor</option>
                <option value="vp">Vice-Presidente</option>
                <option value="c-level">C-Level (CEO, CTO, etc.)</option>
              </select>
            </div>
          )}

          {selectedGoalType === 'salary-level' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Salário desejado (mensal)
              </label>
              <input
                type="text"
                value={formData.targetSalary}
                onChange={(e) => setFormData({...formData, targetSalary: e.target.value})}
                placeholder="Ex: R$ 15.000"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}

          {/* Campos comuns */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Prazo para alcançar o objetivo
            </label>
            <select
              value={formData.timeframe}
              onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="6">6 meses</option>
              <option value="12">1 ano</option>
              <option value="18">1 ano e meio</option>
              <option value="24">2 anos</option>
              <option value="36">3 anos</option>
              <option value="60">5 anos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Posição atual
            </label>
            <input
              type="text"
              value={formData.currentPosition}
              onChange={(e) => setFormData({...formData, currentPosition: e.target.value})}
              placeholder="Ex: Desenvolvedor Júnior, Estudante..."
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Salário atual (opcional)
            </label>
            <input
              type="text"
              value={formData.currentSalary}
              onChange={(e) => setFormData({...formData, currentSalary: e.target.value})}
              placeholder="Ex: R$ 5.000"
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Observações adicionais (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Conte mais sobre seus objetivos, motivações ou contexto..."
              rows={4}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setSelectedGoalType(null)}
              className="flex-1 px-6 py-3 bg-black/20 border border-white/10 text-purple-200 rounded-xl hover:bg-white/5 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Roadmap...
                </>
              ) : (
                <>
                  Gerar Roadmap
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Defina seu Objetivo Profissional</h1>
            <p className="text-purple-200 text-lg">
              Escolha o tipo de objetivo que você quer alcançar e nossa IA criará um roadmap personalizado para você.
            </p>
          </div>
        </div>

        {!selectedGoalType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goalTypes.map((goalType) => (
              <button
                key={goalType.id}
                onClick={() => handleGoalTypeSelect(goalType.id)}
                className="p-6 bg-black/20 border border-white/10 rounded-2xl hover:bg-white/5 transition-all duration-200 text-left group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${goalType.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <goalType.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{goalType.title}</h3>
                <p className="text-purple-200">{goalType.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-purple-300 text-sm">Clique para configurar</span>
                  <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          renderForm()
        )}
      </div>
    </PageContainer>
  );
};
