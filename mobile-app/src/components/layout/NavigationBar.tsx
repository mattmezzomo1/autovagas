import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bot, Briefcase, FileText, GraduationCap } from 'lucide-react';

type NavigationTab = 'dashboard' | 'robot' | 'jobs' | 'resume' | 'courses';

interface NavigationBarProps {
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar tab ativa baseada na rota atual
  const getCurrentTab = (): NavigationTab => {
    const path = location.pathname;
    if (path.includes('/robot')) return 'robot';
    if (path.includes('/jobs')) return 'jobs';
    if (path.includes('/resume')) return 'resume';
    if (path.includes('/courses')) return 'courses';
    return 'dashboard';
  };

  const currentTab = activeTab || getCurrentTab();
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Home',
      icon: Home,
      path: '/dashboard',
    },
    {
      id: 'robot' as NavigationTab,
      label: 'Robô',
      icon: Bot,
      path: '/robot',
    },
    {
      id: 'jobs' as NavigationTab,
      label: 'Vagas',
      icon: Briefcase,
      path: '/jobs',
    },
    {
      id: 'resume' as NavigationTab,
      label: 'Currículo',
      icon: FileText,
      path: '/resume',
    },
    {
      id: 'courses' as NavigationTab,
      label: 'Cursos',
      icon: GraduationCap,
      path: '/courses',
    },
  ];

  const handleTabClick = (tabId: NavigationTab, path: string) => {
    navigate(path);
    onTabChange?.(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
