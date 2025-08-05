import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  User,
  Clock,
  CheckCheck
} from 'lucide-react';

export const CompanyCandidateChat: React.FC = () => {
  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  // Dados do candidato vindos do state ou mock
  const candidateData = location.state || {
    candidateName: 'Candidato',
    candidateTitle: 'Profissional',
    candidateAvatar: '/api/placeholder/40/40'
  };

  const messages = [
    {
      id: '1',
      sender: 'candidate',
      content: 'Olá! Obrigado pelo interesse no meu perfil. Estou muito interessado na vaga.',
      timestamp: '10:30',
      read: true
    },
    {
      id: '2',
      sender: 'company',
      content: 'Olá! Ficamos impressionados com seu perfil. Gostaria de agendar uma conversa?',
      timestamp: '10:35',
      read: true
    },
    {
      id: '3',
      sender: 'candidate',
      content: 'Claro! Estou disponível esta semana. Qual seria o melhor horário para vocês?',
      timestamp: '10:37',
      read: true
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Aqui você implementaria o envio da mensagem
      console.log('Enviando mensagem:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <CompanyLayout
      title={`Chat com ${candidateData.candidateName}`}
      description={candidateData.candidateTitle}
      actions={
        <button
          onClick={() => navigate('/company/candidates')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      }
    >
      <div className="h-[calc(100vh-200px)] flex flex-col bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        {/* Header do Chat */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={candidateData.candidateAvatar}
              alt={candidateData.candidateName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="text-white font-medium">{candidateData.candidateName}</h3>
              <p className="text-white/60 text-sm">{candidateData.candidateTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'company' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.sender === 'company'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 text-white'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${
                  msg.sender === 'company' ? 'text-white/80' : 'text-white/60'
                }`}>
                  <span className="text-xs">{msg.timestamp}</span>
                  {msg.sender === 'company' && (
                    <CheckCheck className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input de Mensagem */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-end gap-3">
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={1}
              />
            </div>
            
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
