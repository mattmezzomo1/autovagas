import React from 'react';
import { 
  X, Brain, Star, TrendingUp, CheckCircle, XCircle, 
  Target, BarChart3, User, MapPin, Mail, Phone, 
  Calendar, Download, MessageSquare, Eye
} from 'lucide-react';

interface CandidateAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillsMatch: {
    skill: string;
    required: boolean;
    hasSkill: boolean;
    proficiency: number;
  }[];
  experienceMatch: {
    required: number;
    candidate: number;
    match: boolean;
  };
  culturalFit: number;
  overallAssessment: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileImage?: string;
  resumeUrl?: string;
  appliedAt: string;
  status: 'pending' | 'screening' | 'approved' | 'rejected';
  aiScore: number;
  matchPercentage: number;
  aiAnalysis: CandidateAnalysis;
}

interface CandidateAnalysisModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (candidateId: string) => void;
  onReject?: (candidateId: string) => void;
}

export const CandidateAnalysisModal: React.FC<CandidateAnalysisModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!isOpen || !candidate) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
                <p className="text-white/60">{candidate.email}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {candidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Scores Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-xl border ${getScoreBackground(candidate.aiScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className={`text-2xl font-bold ${getScoreColor(candidate.aiScore)}`}>
                  {candidate.aiScore}
                </span>
              </div>
              <div className="text-white/70 text-sm">Score IA</div>
            </div>

            <div className={`p-4 rounded-xl border ${getScoreBackground(candidate.matchPercentage)}`}>
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 text-blue-400" />
                <span className={`text-2xl font-bold ${getScoreColor(candidate.matchPercentage)}`}>
                  {candidate.matchPercentage}%
                </span>
              </div>
              <div className="text-white/70 text-sm">Match Geral</div>
            </div>

            <div className={`p-4 rounded-xl border ${getScoreBackground(candidate.aiAnalysis.culturalFit)}`}>
              <div className="flex items-center justify-between mb-2">
                <User className="w-6 h-6 text-green-400" />
                <span className={`text-2xl font-bold ${getScoreColor(candidate.aiAnalysis.culturalFit)}`}>
                  {candidate.aiAnalysis.culturalFit}%
                </span>
              </div>
              <div className="text-white/70 text-sm">Fit Cultural</div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Avaliação Geral da IA
            </h4>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/80 leading-relaxed">{candidate.aiAnalysis.overallAssessment}</p>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Análise de Habilidades
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.aiAnalysis.skillsMatch.map((skill, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      {skill.required && (
                        <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded">
                          Obrigatória
                        </span>
                      )}
                      {skill.hasSkill ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  {skill.hasSkill && (
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          skill.proficiency >= 80 ? 'bg-green-500' :
                          skill.proficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  )}
                  {skill.hasSkill && (
                    <div className="text-xs text-white/60 mt-1">
                      Proficiência: {skill.proficiency}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience Analysis */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Análise de Experiência
            </h4>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/70 text-sm">Experiência Requerida</div>
                  <div className="text-white font-semibold">{candidate.aiAnalysis.experienceMatch.required} anos</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Experiência do Candidato</div>
                  <div className="text-white font-semibold">{candidate.aiAnalysis.experienceMatch.candidate} anos</div>
                </div>
                <div>
                  {candidate.aiAnalysis.experienceMatch.match ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Atende</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Não Atende</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-400" />
                Pontos Fortes
              </h4>
              <div className="space-y-2">
                {candidate.aiAnalysis.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{strength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-yellow-400" />
                Pontos de Atenção
              </h4>
              <div className="space-y-2">
                {candidate.aiAnalysis.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{weakness}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Recomendações da IA
            </h4>
            <div className="space-y-2">
              {candidate.aiAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
              Ver Currículo
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4" />
              Contatar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Baixar Relatório
            </button>
          </div>

          {candidate.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => onReject?.(candidate.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
              <button
                onClick={() => onApprove?.(candidate.id)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Aprovar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
