import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Clock, Banknote, Users, Bot, MessageSquare, Loader2, AlertCircle, Star, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { CreditPurchaseModal } from '../components/payment/CreditPurchaseModal';

export const JobDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, consumeCredits } = useAuthStore();
  const [isApplying, setIsApplying] = useState(false);
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Custo em créditos para aplicar para esta vaga
  const APPLICATION_COST = 1;

  const handleSendMessage = () => {
    navigate('/chat');
  };

  const handleApply = () => {
    // Limpa qualquer erro anterior
    setApplicationError(null);

    // Verifica se o usuário tem créditos suficientes
    const hasEnoughCredits = consumeCredits(APPLICATION_COST);

    if (!hasEnoughCredits) {
      setApplicationError('Você não tem créditos suficientes para aplicar para esta vaga.');
      return;
    }

    // Inicia o processo de aplicação
    setIsApplying(true);

    // Simula o processo de aplicação
    setTimeout(() => {
      setIsApplying(false);
      setApplicationSuccess(true);

      // Redireciona para a página de atividade após 2 segundos
      setTimeout(() => {
        navigate('/activity');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 sm:gap-2 text-purple-200 hover:text-purple-100 mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Desenvolvedor Full Stack Senior
                </h1>
                <p className="text-lg sm:text-xl text-purple-200">TechCorp Inc.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleApply}
                  disabled={isApplying || applicationSuccess}
                  className={`btn-primary flex-1 sm:flex-auto ${(isApplying || applicationSuccess) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Aplicando...
                    </>
                  ) : applicationSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Aplicado com Sucesso
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      Aplicar com IA ({APPLICATION_COST} crédito)
                    </>
                  )}
                </button>
                <button
                  onClick={handleSendMessage}
                  className="btn-primary px-4 py-2 flex-1 sm:flex-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  Enviar mensagem
                </button>
              </div>

              {/* Exibe o contador de créditos */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">
                    {profile.subscription?.credits} créditos disponíveis
                  </span>
                </div>
                <button
                  onClick={() => setShowCreditPurchaseModal(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  Comprar mais
                </button>
              </div>

              {/* Mensagem de erro */}
              {applicationError && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm">{applicationError}</p>
                    <button
                      onClick={() => setShowCreditPurchaseModal(true)}
                      className="text-sm text-red-400 hover:text-red-300 underline mt-1"
                    >
                      Comprar créditos agora
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1 sm:mb-2" />
                <div className="text-xs sm:text-sm text-purple-300">Empresa</div>
                <div className="text-white text-sm sm:text-base font-medium">TechCorp Inc.</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1 sm:mb-2" />
                <div className="text-xs sm:text-sm text-purple-300">Localização</div>
                <div className="text-white text-sm sm:text-base font-medium">São Paulo, SP</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1 sm:mb-2" />
                <div className="text-xs sm:text-sm text-purple-300">Tipo</div>
                <div className="text-white text-sm sm:text-base font-medium">Full-time</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1 sm:mb-2" />
                <div className="text-xs sm:text-sm text-purple-300">Salário</div>
                <div className="text-white text-sm sm:text-base font-medium">R$ 15k - 20k</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Description */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Descrição da vaga</h2>
              <div className="prose prose-invert">
                <p className="text-purple-200 text-sm sm:text-base">
                  Estamos em busca de um Desenvolvedor Full Stack Senior apaixonado por tecnologia e inovação para se juntar ao nosso time de desenvolvimento. O candidato ideal deve ter experiência sólida em desenvolvimento web moderno e estar familiarizado com as melhores práticas de arquitetura de software.
                </p>

                <h3 className="text-base sm:text-lg font-medium text-white mt-4 sm:mt-6 mb-2">Responsabilidades:</h3>
                <ul className="list-disc list-inside text-purple-200 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>Desenvolver e manter aplicações web escaláveis</li>
                  <li>Colaborar com times multidisciplinares</li>
                  <li>Mentoria de desenvolvedores juniores</li>
                  <li>Participar de decisões arquiteturais</li>
                </ul>

                <h3 className="text-base sm:text-lg font-medium text-white mt-4 sm:mt-6 mb-2">Requisitos:</h3>
                <ul className="list-disc list-inside text-purple-200 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>5+ anos de experiência com desenvolvimento web</li>
                  <li>Proficiência em React, Node.js e TypeScript</li>
                  <li>Experiência com arquitetura de microsserviços</li>
                  <li>Conhecimento sólido em práticas de CI/CD</li>
                </ul>
              </div>
            </div>

            {/* Company */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Sobre a empresa</h2>
              <p className="text-purple-200 text-sm sm:text-base">
                A TechCorp é uma empresa líder em soluções tecnológicas, focada em inovação e desenvolvimento de produtos digitais de alta qualidade. Com mais de 10 anos no mercado, somos reconhecidos por nossa cultura de excelência e ambiente colaborativo.
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div>
                  <div className="text-xs sm:text-sm text-purple-300">Funcionários</div>
                  <div className="text-white text-sm sm:text-base font-medium flex items-center gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    500+
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-purple-300">Fundação</div>
                  <div className="text-white text-sm sm:text-base font-medium">2014</div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Benefits */}
          <div className="space-y-6 md:space-y-8">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Tecnologias</h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'MongoDB', 'GraphQL'].map((skill) => (
                  <span
                    key={skill}
                    className="px-2 sm:px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-xs sm:text-sm border border-purple-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Benefícios</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  Plano de saúde
                </li>
                <li className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  Vale refeição
                </li>
                <li className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  Gympass
                </li>
                <li className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  Home office
                </li>
                <li className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  Horário flexível
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de compra de créditos */}
      {showCreditPurchaseModal && (
        <CreditPurchaseModal
          onClose={() => setShowCreditPurchaseModal(false)}
          onSuccess={(credits) => {
            setShowCreditPurchaseModal(false);
            setApplicationError(null);
          }}
        />
      )}
    </div>
  );
};