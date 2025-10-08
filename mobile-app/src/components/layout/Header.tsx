import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell } from 'lucide-react';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotificationsClick = () => {
    // TODO: Implementar notificações
    console.log('Abrir notificações');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AV</span>
          </div>
          <span className="text-white font-semibold text-lg">AutoVagas</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotificationsClick}
            className="text-white hover:bg-white/10 p-2"
          >
            <Bell className="w-5 h-5" />
          </Button>

          {/* Perfil */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfileClick}
            className="text-white hover:bg-white/10 p-2"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
