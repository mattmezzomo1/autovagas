import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BookOpen, 
  Bot, 
  Settings,
  BarChart,
  Shield
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const menuItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      title: 'Usuários',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Assinaturas',
      path: '/admin/subscriptions',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      title: 'Cursos',
      path: '/admin/courses',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      title: 'Logs dos Bots',
      path: '/admin/bot-logs',
      icon: <Bot className="w-5 h-5" />
    },
    {
      title: 'Estatísticas',
      path: '/admin/stats',
      icon: <BarChart className="w-5 h-5" />
    },
    {
      title: 'Configurações',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 z-50 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-0`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              AIApply Admin
            </h2>
            <button 
              onClick={onClose}
              className="text-purple-200 hover:text-purple-100 md:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Menu Items */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? 'bg-purple-500/20 text-white'
                    : 'text-purple-200 hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 text-purple-200">
              <Shield className="w-5 h-5" />
              <span>Área Restrita</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
