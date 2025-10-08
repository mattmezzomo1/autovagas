import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Smile, MoreVertical, Phone, Video, Info } from 'lucide-react';

import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface Message {
  id: number;
  sender: 'user' | 'recruiter';
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileName?: string;
  fileSize?: string;
}

interface ChatModalProps {
  isVisible: boolean;
  jobTitle: string;
  company: string;
  recruiterName: string;
  recruiterRole: string;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isVisible,
  jobTitle,
  company,
  recruiterName,
  recruiterRole,
  onClose
}) => {
  const { addNotification } = useAppStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'recruiter',
      content: 'Olá! Vi seu perfil e fiquei interessado na sua candidatura para a vaga de ' + jobTitle + '. Gostaria de conversar um pouco sobre sua experiência.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      type: 'text'
    },
    {
      id: 2,
      sender: 'user',
      content: 'Olá! Muito obrigado pelo interesse. Estou muito animado com esta oportunidade. Tenho 5 anos de experiência com React e TypeScript.',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 horas atrás
      type: 'text'
    },
    {
      id: 3,
      sender: 'recruiter',
      content: 'Perfeito! Que tal agendarmos uma conversa por vídeo para conhecer melhor seu background? Temos algumas vagas que podem ser interessantes para você.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      type: 'text'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: message,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simular resposta do recrutador após 2-3 segundos
    setTimeout(() => {
      const responses = [
        'Entendi! Vou analisar seu perfil com mais detalhes.',
        'Interessante! Pode me contar mais sobre seus projetos?',
        'Ótimo! Vamos agendar uma conversa então.',
        'Perfeito! Estou enviando mais detalhes sobre a vaga.',
        'Excelente! Que tal uma entrevista técnica na próxima semana?'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const recruiterMessage: Message = {
        id: messages.length + 2,
        sender: 'recruiter',
        content: randomResponse,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, recruiterMessage]);
    }, 2000 + Math.random() * 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: `Arquivo enviado: ${file.name}`,
      timestamp: new Date(),
      type: 'file',
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    };

    setMessages([...messages, newMessage]);
    addNotification({
      type: 'success',
      message: 'Arquivo enviado com sucesso!'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {recruiterName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{recruiterName}</h3>
                <p className="text-gray-400 text-sm">{recruiterRole} • {company}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => addNotification({ type: 'info', message: 'Chamada de voz iniciada' })}
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => addNotification({ type: 'info', message: 'Chamada de vídeo iniciada' })}
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Job Info */}
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Vaga: {jobTitle}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4">
        {messages.map((msg, index) => {
          const showDate = index === 0 || 
            formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
          
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="bg-slate-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`p-3 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 text-gray-100'
                  }`}>
                    {msg.type === 'file' ? (
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <div>
                          <p className="font-medium">{msg.fileName}</p>
                          <p className="text-xs opacity-70">{msg.fileSize}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="w-full bg-slate-800 border border-slate-600 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
