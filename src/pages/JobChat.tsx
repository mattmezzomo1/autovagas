import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Building2, MapPin, Clock, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'company';
  content: string;
  timestamp: Date;
  senderName: string;
}

export const JobChat: React.FC = () => {
  const { jobId } = useParams();
  const [newMessage, setNewMessage] = useState('');

  // Dados de exemplo para a vaga
  const jobData = {
    id: jobId,
    title: 'Desenvolvedor Full Stack Senior',
    company: 'TechCorp Inc.',
    location: 'São Paulo, SP',
    status: 'Em análise'
  };

  // Mensagens de exemplo
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'company',
      content: 'Olá! Recebemos sua candidatura para a vaga de Desenvolvedor Full Stack Senior. Estamos analisando seu perfil e entraremos em contato em breve.',
      timestamp: new Date('2024-03-12T10:00:00'),
      senderName: 'Ana Silva - RH TechCorp'
    },
    {
      id: '2',
      sender: 'user',
      content: 'Obrigado pelo retorno! Estou muito interessado na oportunidade. Gostaria de saber mais sobre o stack tecnológico utilizado pela empresa.',
      timestamp: new Date('2024-03-12T14:30:00'),
      senderName: 'Você'
    },
    {
      id: '3',
      sender: 'company',
      content: 'Claro! Utilizamos principalmente React, Node.js, TypeScript e AWS. Também trabalhamos com metodologias ágeis. Você tem experiência com essas tecnologias?',
      timestamp: new Date('2024-03-13T09:15:00'),
      senderName: 'Ana Silva - RH TechCorp'
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content: newMessage,
        timestamp: new Date(),
        senderName: 'Você'
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          {/* Job Info */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{jobData.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-purple-200">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {jobData.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {jobData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${
                  message.sender === 'user' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-purple-100'
                } rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">{message.senderName}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-200 text-sm">
            💡 <strong>Dica:</strong> Este é um chat direto com a empresa. Seja profissional e demonstre interesse genuíno na vaga.
          </p>
        </div>
      </div>
    </div>
  );
};
