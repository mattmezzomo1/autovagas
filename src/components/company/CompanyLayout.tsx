import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Briefcase,
  Users,
  UserSearch,
  BarChart3,
  Settings,
  MessageSquare,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  User,
  Brain,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

interface CompanyLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({
  children,
  title,
  description,
  actions
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/company',
      icon: LayoutDashboard,
      current: location.pathname === '/company'
    },
    {
      name: 'Vagas',
      href: '/company/jobs',
      icon: Briefcase,
      current: location.pathname.startsWith('/company/job')
    },
    {
      name: 'Candidatos',
      href: '/company/candidates',
      icon: Users,
      current: location.pathname.startsWith('/company/candidate')
    },
    {
      name: 'Busca de Talentos',
      href: '/company/talent-search',
      icon: UserSearch,
      current: location.pathname === '/company/talent-search'
    },
    {
      name: 'Analytics',
      href: '/company/analytics',
      icon: BarChart3,
      current: location.pathname === '/company/analytics'
    },
    {
      name: 'Chat',
      href: '/company/chat',
      icon: MessageSquare,
      current: location.pathname === '/company/chat'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col lg:z-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 flex-shrink-0">
          <Link to="/company" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">AutoVagas</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className="mt-6 px-3 flex-1" role="navigation" aria-label="Menu principal">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${
                      item.current
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                to="/company/settings"
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${
                  location.pathname === '/company/settings'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                aria-current={location.pathname === '/company/settings' ? 'page' : undefined}
              >
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">Configurações</span>
              </Link>
            </div>
          </nav>

          {/* AI Assistant Card */}
          <div className="p-3 mt-auto">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium text-sm">AI Recruiter</span>
              </div>
              <p className="text-purple-200 text-xs mb-3">
                Deixe nossa IA encontrar os melhores candidatos automaticamente
              </p>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Ativar IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{title}</h1>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-white/60 truncate">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {actions}

              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48 lg:w-64"
                    aria-label="Buscar"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Perfil do usuário"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {profile?.fullName || 'Empresa'}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {profile?.email}
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto" role="main">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
