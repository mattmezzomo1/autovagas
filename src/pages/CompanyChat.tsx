import React, { useState } from 'react';
import { ArrowLeft, Search, Send, Paperclip, Image, Bot, Clock, CheckCircle2, Briefcase, MapPin, Star, MoreVertical, Phone, Video, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: number;
  sender: 'company' | 'candidate' | 'system';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: number;
  candidateName: string;
  position: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  match: number;
}

export const CompanyChat: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<number>(1);
  const [newMessage, setNewMessage] = useState('');
  const [showAIOptions, setShowAIOptions] = useState(false);

  const conversations: Conversation[] = [
    {
      id: 1,
      candidateName: 'João Silva',
      position: 'Desenvolvedor Full Stack Senior',
      lastMessage: 'Ótimo! Podemos marcar uma entrevista...',
      lastMessageTime: new Date(),
      unreadCount: 2,
      isOnline: true,
      match: 95,
    },
    {
      id: 2,
      candidateName: 'Maria Santos',
      position: 'Tech Lead',
      lastMessage: 'Obrigada pelo retorno! Tenho experiência...',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: false,
      match: 92,
    },
    {
      id: 3,
      candidateName: 'Pedro Costa',
      position: 'Desenvolvedor Full Stack',
      lastMessage: 'Sim, tenho disponibilidade para...',
      lastMessageTime: new Date(),
      unreadCount: 1,
      isOnline: true,
      match: 88,
    },
  ];

  const messages: Message[] = [
    {
      id: 1,
      sender: 'company',
      content: 'Olá João! Gostamos muito do seu perfil e gostaríamos de conversar sobre a vaga de Desenvolvedor Full Stack Senior.',
      timestamp: new Date(),
      status: 'read',
    },
    {
      id: 2,
      sender: 'candidate',
      content: 'Olá! Muito obrigado pelo contato. Estou bastante interessado na oportunidade e adoraria saber mais detalhes.',
      timestamp: new Date(),
      status: 'read',
    },
    {
      id: 3,
      sender: 'company',
      content: 'Excelente! Você tem disponibilidade para uma entrevista técnica esta semana?',
      timestamp: new Date(),
      status: 'read',
    },
    {
      id: 4,
      sender: 'candidate',
      content: 'Sim, tenho disponibilidade! Qual seria o melhor horário?',
      timestamp: new Date(),
      status: 'delivered',
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Add message sending logic here
      setNewMessage('');
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'read':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Left Sidebar - Conversations */}
        <div className="w-96 border-r border-white/10 p-4">
          <div className="mb-6">
            <Link 
              to="/company"
              className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Dashboard
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-purple-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
                className={`w-full p-3 rounded-xl transition-all duration-200 text-left
                  ${activeConversation === conversation.id
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-white/5'
                  }`}
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-medium">
                      {conversation.candidateName.split(' ').map(n => n[0]).join('')}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate">
                        <div className="text-white font-medium">{conversation.candidateName}</div>
                        <div className="text-sm text-purple-300 truncate">{conversation.position}</div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-purple-200 truncate">
                      {conversation.lastMessage}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-medium">
                  JS
                </div>
                <div>
                  <h2 className="text-white font-medium">João Silva</h2>
                  <div className="flex items-center gap-4 text-sm text-purple-200">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      Desenvolvedor Full Stack Senior
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      São Paulo, SP
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      95% match
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-purple-200 hover:text-purple-100 hover:bg-white/5 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-purple-200 hover:text-purple-100 hover:bg-white/5 rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-purple-200 hover:text-purple-100 hover:bg-white/5 rounded-lg transition-colors">
                  <Calendar className="w-5 h-5" />
                </button>
                <button className="p-2 text-purple-200 hover:text-purple-100 hover:bg-white/5 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'company' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'system' ? (
                  <div className="bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg text-sm max-w-md">
                    {message.content}
                  </div>
                ) : (
                  <div className={`flex flex-col ${message.sender === 'company' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-xl max-w-md
                        ${message.sender === 'company'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-purple-100'
                        }`}
                    >
                      {message.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-purple-300">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.sender === 'company' && getStatusIcon(message.status)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    className="p-1.5 text-purple-300 hover:text-purple-200 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-purple-300 hover:text-purple-200 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAIOptions(!showAIOptions)}
                      className="p-1.5 text-purple-300 hover:text-purple-200 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Bot className="w-5 h-5" />
                    </button>
                    {showAIOptions && (
                      <div className="absolute bottom-full mb-2 left-0 w-64 bg-gray-900 rounded-xl border border-white/10 shadow-xl p-2">
                        <div className="space-y-1">
                          <button className="w-full text-left px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-sm">
                            Gerar resposta profissional
                          </button>
                          <button className="w-full text-left px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-sm">
                            Agendar entrevista
                          </button>
                          <button className="w-full text-left px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-sm">
                            Solicitar mais informações
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full bg-transparent border-none text-purple-100 placeholder-purple-300/50 resize-none focus:ring-0"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                className="btn-primary p-3"
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};