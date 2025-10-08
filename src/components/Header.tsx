import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  User,
  FileText,
  Star,
  Briefcase,
  ChevronRight,
  X,
  Menu,
  Bot,
  BookOpen,
  LayoutDashboard,
  Users,
  CreditCard,
  Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { CreditPurchaseModal } from './payment/CreditPurchaseModal';

interface Notification {
  id: number;
  type: 'message' | 'application' | 'match' | 'interview';
  title: string;
  description: string;
  time: Date;
  read: boolean;
}

export const Header: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleCreditPurchase = (amount: number) => {
    // Atualiza os créditos do usuário
    const currentCredits = profile.subscription?.credits || 0;
    updateProfile({
      subscription: {
        ...profile.subscription!,
        credits: currentCredits + amount
      }
    });
  };

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'message',
      title: 'Nova mensagem',
      description: 'TechCorp Inc. enviou uma mensagem sobre a vaga de Dev Senior',
      time: new Date(),
      read: false,
    },
    {
      id: 2,
      type: 'application',
      title: 'Candidatura visualizada',
      description: 'Sua candidatura para Tech Lead foi visualizada',
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: 3,
      type: 'match',
      title: 'Novo match profissional',
      description: 'Encontramos um profissional com objetivos similares',
      time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: true,
    },
    {
      id: 4,
      type: 'interview',
      title: 'Entrevista agendada',
      description: 'StartupXYZ agendou uma entrevista para amanhã',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenChat = () => {
    navigate('/interview-chat');
  };

  const handleNotificationClick = (type: Notification['type']) => {
    setShowNotifications(false);
    switch (type) {
      case 'message':
        navigate('/chat');
        break;
      case 'application':
        navigate('/application/1');
        break;
      case 'match':
        navigate('/matchmaking');
        break;
      case 'interview':
        // TODO: Add calendar page route
        break;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 bg-black/10 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  AIApply
                </h2>
              </Link>
            </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-purple-200 hover:text-purple-100 p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Credits Counter */}
            <button
              onClick={() => setShowCreditPurchaseModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              title="Clique para comprar mais créditos"
            >
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">
                {profile.subscription?.credits} créditos
              </span>
            </button>

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-purple-200 hover:text-purple-100"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-full sm:w-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Notificações</h3>
                    <button className="text-purple-300 hover:text-purple-200">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.type)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors
                          ${notification.read
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-purple-500/10 hover:bg-purple-500/20'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                          ${notification.read ? 'bg-white/10' : 'bg-purple-500/20'}`}
                        >
                          {notification.type === 'message' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                          {notification.type === 'application' && <FileText className="w-4 h-4 text-purple-400" />}
                          {notification.type === 'match' && <User className="w-4 h-4 text-purple-400" />}
                          {notification.type === 'interview' && <Briefcase className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-white">{notification.title}</div>
                            <div className="text-xs text-purple-300">{formatTime(notification.time)}</div>
                          </div>
                          <p className="text-sm text-purple-200 mt-0.5 line-clamp-2">
                            {notification.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-300 flex-shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interview Training */}
            <button
              onClick={handleOpenChat}
              className="text-purple-200 hover:text-purple-100 relative group"
              title="Treinamento de Entrevista com IA"
            >
              <MessageSquare className="w-5 h-5" />
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Treinamento de Entrevista
              </div>
            </button>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white"
              >
                {profile.fullName?.[0]?.toUpperCase()}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-full sm:w-56 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
                  <div className="p-3 border-b border-white/10">
                    <div className="font-medium text-white">{profile.fullName}</div>
                    <div className="text-sm text-purple-200">{profile.email}</div>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                    <Link to="/settings" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Link>
                    <Link to="/skill-development" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                      <Target className="w-4 h-4" />
                      Desenvolvimento de Carreira
                    </Link>
                    <Link to="/scraper" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                      <Bot className="w-4 h-4" />
                      Painel do Robô
                    </Link>

                    {/* Links administrativos - visíveis apenas para admins */}
                    {profile.role === 'admin' && (
                      <>
                        <div className="border-t border-white/10 my-2 pt-2">
                          <span className="px-3 py-1 text-xs text-purple-300">Administração</span>
                        </div>
                        <Link to="/admin" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                          <LayoutDashboard className="w-4 h-4" />
                          Painel Admin
                        </Link>
                        <Link to="/admin/users" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                          <Users className="w-4 h-4" />
                          Usuários
                        </Link>
                        <Link to="/admin/subscriptions" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                          <CreditCard className="w-4 h-4" />
                          Assinaturas
                        </Link>
                        <Link to="/admin/courses" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                          <BookOpen className="w-4 h-4" />
                          Cursos
                        </Link>
                        <Link to="/admin/bot-logs" className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                          <Bot className="w-4 h-4" />
                          Logs dos Bots
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 my-2 pt-2"></div>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-left">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowCreditPurchaseModal(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 w-fit hover:bg-purple-500/20 transition-colors"
              title="Clique para comprar mais créditos"
            >
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">
                {profile.subscription?.credits} créditos
              </span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowNotifications(!showNotifications);
                }}
                className="relative text-purple-200 hover:text-purple-100 p-2"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenChat();
                }}
                className="text-purple-200 hover:text-purple-100 p-2"
                title="Treinamento de Entrevista com IA"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white"
              >
                {profile.fullName?.[0]?.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </div>

    </nav>

    {/* Credit Purchase Modal - Renderizado fora do componente de navegação */}
    {showCreditPurchaseModal && (
      <CreditPurchaseModal
        onClose={() => setShowCreditPurchaseModal(false)}
        onSuccess={handleCreditPurchase}
      />
    )}
    </>
  );
};