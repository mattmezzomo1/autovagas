import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onMenuClick }) => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de perfil quando clica fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Implementar lógica de logout
    navigate('/login');
  };

  return (
    <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="text-purple-200 hover:text-purple-100 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white hidden md:block">
            Painel Administrativo
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Notificações */}
          <button className="text-purple-200 hover:text-purple-100">
            <Bell className="w-5 h-5" />
          </button>

          {/* Menu de Perfil */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white"
            >
              {profile.fullName?.[0]?.toUpperCase()}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl z-10">
                <div className="p-3 border-b border-white/10">
                  <p className="text-white font-medium">{profile.fullName}</p>
                  <p className="text-purple-300 text-sm">{profile.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                    <User className="w-4 h-4" />
                    Perfil
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors text-left">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
