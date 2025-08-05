import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Smartphone, Key } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement password change logic
    console.log('Password change requested');
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Configurações de Segurança</h2>
      
      {/* Change Password */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Alterar Senha</h3>
        </div>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <button type="submit" className="btn-primary">
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
      
      {/* Two-Factor Authentication */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Autenticação de Dois Fatores</h3>
        </div>
        
        <div className="p-6 bg-black/20 rounded-xl mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Autenticação de Dois Fatores</h4>
              <p className="text-purple-300 text-sm mt-1">
                Adicione uma camada extra de segurança à sua conta exigindo mais do que apenas uma senha para fazer login.
              </p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${twoFactorEnabled 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Autenticação por App</span>
              </div>
              <p className="text-purple-200 text-sm mb-4">
                Use um aplicativo de autenticação como Google Authenticator, Microsoft Authenticator ou Authy.
              </p>
              <button className="btn-secondary text-sm px-4 py-2">
                Configurar Autenticador
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Sessions */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Sessões Ativas</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium">Windows - Chrome</h4>
                <p className="text-purple-300 text-sm">São Paulo, Brasil • Ativo agora</p>
              </div>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                Atual
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium">iPhone - Safari</h4>
                <p className="text-purple-300 text-sm">São Paulo, Brasil • Última atividade: 2 horas atrás</p>
              </div>
              <button className="text-red-400 hover:text-red-300 text-sm">
                Encerrar
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium">MacBook - Firefox</h4>
                <p className="text-purple-300 text-sm">Rio de Janeiro, Brasil • Última atividade: 3 dias atrás</p>
              </div>
              <button className="text-red-400 hover:text-red-300 text-sm">
                Encerrar
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="text-red-400 hover:text-red-300 font-medium">
            Encerrar todas as outras sessões
          </button>
        </div>
      </div>
    </div>
  );
};
