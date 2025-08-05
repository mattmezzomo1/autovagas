import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, CheckCircle2, Bot, FileText, Send } from 'lucide-react';

export const ApplicationDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm border border-yellow-500/20">
                    Em análise
                  </span>
                  <span className="text-purple-200 text-sm">
                    Aplicado em 12 de março de 2024
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Desenvolvedor Full Stack Senior
                </h1>
                <p className="text-xl text-purple-200">TechCorp Inc.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {/* Application Content */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Mensagem de Apresentação
              </h2>
              <div className="prose prose-invert">
                <p className="text-purple-200">
                  Prezados recrutadores da TechCorp Inc.,
                </p>
                <p className="text-purple-200 mt-4">
                  É com grande entusiasmo que manifesto meu interesse na posição de Desenvolvedor Full Stack Senior. Com mais de 8 anos de experiência no desenvolvimento de aplicações web escaláveis e uma sólida formação em engenharia de software, acredito que posso contribuir significativamente para os projetos da TechCorp.
                </p>
                <p className="text-purple-200 mt-4">
                  Minha experiência com React, Node.js e arquitetura de microsserviços se alinha perfeitamente com as necessidades da vaga. Além disso, tenho um histórico comprovado de liderança técnica e mentoria de desenvolvedores juniores.
                </p>
                <p className="text-purple-200 mt-4">
                  Atenciosamente,<br />
                  João Silva
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Status da Aplicação</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Aplicação enviada</h3>
                    <p className="text-purple-200 text-sm">12 de março de 2024, 14:30</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Currículo visualizado</h3>
                    <p className="text-purple-200 text-sm">13 de março de 2024, 09:15</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Em análise pelo recrutador</h3>
                    <p className="text-purple-200 text-sm">13 de março de 2024, 10:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents and Stats */}
          <div className="space-y-8">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Documentos Enviados</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Currículo</div>
                    <div className="text-sm text-purple-200">PDF • 2.1 MB</div>
                  </div>
                  <button className="text-purple-300 hover:text-purple-200">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Carta de Apresentação</div>
                    <div className="text-sm text-purple-200">PDF • 1.5 MB</div>
                  </div>
                  <button className="text-purple-300 hover:text-purple-200">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Estatísticas</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Visualizações</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Tempo em análise</span>
                  <span className="text-white font-semibold">2 dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Compatibilidade</span>
                  <span className="text-white font-semibold">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};