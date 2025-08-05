import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Bell, Lock, CreditCard } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { PageContainer } from '../components/layout/PageContainer';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { BillingSettings } from '../components/settings/BillingSettings';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { profile } = useAuthStore();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <PageContainer>
      <div className="pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Perfil
          </Link>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-purple-200 mt-2">Gerencie suas preferências e informações de conta</p>
        </div>

        {/* Settings Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-4 shadow-xl">
              <div className="flex items-center gap-4 p-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-bold text-white">
                  {profile.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-medium">{profile.fullName}</h3>
                  <p className="text-purple-200 text-sm">{profile.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                    ${activeTab === 'profile'
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-200 hover:bg-white/5'
                    }`}
                >
                  <User className="w-5 h-5" />
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                    ${activeTab === 'notifications'
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-200 hover:bg-white/5'
                    }`}
                >
                  <Bell className="w-5 h-5" />
                  Notificações
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                    ${activeTab === 'security'
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-200 hover:bg-white/5'
                    }`}
                >
                  <Lock className="w-5 h-5" />
                  Segurança
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                    ${activeTab === 'billing'
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-200 hover:bg-white/5'
                    }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Assinatura
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
