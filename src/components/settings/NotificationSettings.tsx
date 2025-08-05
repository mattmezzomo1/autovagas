import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Briefcase, Star, Users } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    newJobs: true,
    applicationUpdates: true,
    messages: true,
    marketingEmails: false,
    weeklyDigest: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    newJobs: true,
    applicationUpdates: true,
    messages: true,
    matches: true
  });

  const toggleEmailNotification = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePushNotification = (key: keyof typeof pushNotifications) => {
    setPushNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Configurações de Notificações</h2>
      
      {/* Email Notifications */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Notificações por Email</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Novas vagas recomendadas</h4>
              <p className="text-purple-300 text-sm">Receba emails quando encontrarmos vagas que combinam com seu perfil</p>
            </div>
            <button
              onClick={() => toggleEmailNotification('newJobs')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${emailNotifications.newJobs 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${emailNotifications.newJobs ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Atualizações de candidaturas</h4>
              <p className="text-purple-300 text-sm">Receba emails quando houver atualizações em suas candidaturas</p>
            </div>
            <button
              onClick={() => toggleEmailNotification('applicationUpdates')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${emailNotifications.applicationUpdates 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${emailNotifications.applicationUpdates ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Mensagens</h4>
              <p className="text-purple-300 text-sm">Receba emails quando receber novas mensagens</p>
            </div>
            <button
              onClick={() => toggleEmailNotification('messages')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${emailNotifications.messages 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${emailNotifications.messages ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Resumo semanal</h4>
              <p className="text-purple-300 text-sm">Receba um resumo semanal com suas estatísticas e novas oportunidades</p>
            </div>
            <button
              onClick={() => toggleEmailNotification('weeklyDigest')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${emailNotifications.weeklyDigest 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${emailNotifications.weeklyDigest ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Emails de marketing</h4>
              <p className="text-purple-300 text-sm">Receba emails sobre novos recursos, dicas e promoções</p>
            </div>
            <button
              onClick={() => toggleEmailNotification('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${emailNotifications.marketingEmails 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${emailNotifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* Push Notifications */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Notificações Push</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Novas vagas</h4>
              <p className="text-purple-300 text-sm">Receba notificações quando novas vagas compatíveis forem encontradas</p>
            </div>
            <button
              onClick={() => togglePushNotification('newJobs')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${pushNotifications.newJobs 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${pushNotifications.newJobs ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Atualizações de candidaturas</h4>
              <p className="text-purple-300 text-sm">Receba notificações sobre o status de suas candidaturas</p>
            </div>
            <button
              onClick={() => togglePushNotification('applicationUpdates')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${pushNotifications.applicationUpdates 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${pushNotifications.applicationUpdates ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Mensagens</h4>
              <p className="text-purple-300 text-sm">Receba notificações quando receber novas mensagens</p>
            </div>
            <button
              onClick={() => togglePushNotification('messages')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${pushNotifications.messages 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${pushNotifications.messages ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Matches profissionais</h4>
              <p className="text-purple-300 text-sm">Receba notificações quando encontrarmos profissionais compatíveis</p>
            </div>
            <button
              onClick={() => togglePushNotification('matches')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${pushNotifications.matches 
                  ? 'bg-purple-500' 
                  : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${pushNotifications.matches ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button className="btn-primary">
          Salvar Preferências
        </button>
      </div>
    </div>
  );
};
