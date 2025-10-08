import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Settings, Crown, LogOut, User, Mail, Phone, MapPin, Edit,
  Camera, Shield, Bell, Palette, Globe, HelpCircle,
  CreditCard, Calendar, Award, BarChart3, Target,
  CheckCircle, AlertCircle, Star, TrendingUp, Zap,
  Download, Share2, Eye, EyeOff, Lock, Smartphone,
  Briefcase, GraduationCap, Heart, Bookmark
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { PaymentMethodsModal } from '../components/profile/PaymentMethodsModal';
import { useAuthStore } from '../store/authStore';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  const { user, logout } = useAuthStore();

  // Estados locais
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    title: 'Desenvolvedor Frontend Sênior',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    location: 'São Paulo, SP',
    bio: 'Desenvolvedor apaixonado por tecnologia com 5+ anos de experiência em React e TypeScript.',
    avatar: 'JS',
    memberSince: 'Janeiro 2024',
    profileVisibility: 'public',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false
  });

  const [subscriptionData] = useState({
    plan: 'Plus',
    price: 49,
    currency: 'R$',
    period: 'mês',
    applications: 100,
    usedApplications: 67,
    renewalDate: '2024-02-15',
    daysUntilRenewal: 15,
    features: [
      'Auto-aplicação em 5 plataformas',
      '100 aplicações por mês',
      'Suporte prioritário',
      'Análise de currículo com IA',
      'Relatórios detalhados'
    ],
    paymentMethod: '**** 1234',
    nextBilling: 'R$ 49,00 em 15/02/2024'
  });

  const [userStats] = useState({
    totalApplications: 234,
    successRate: 18,
    profileViews: 1247,
    coursesCompleted: 8,
    certificatesEarned: 6,
    skillsLearned: 24,
    interviewsScheduled: 12,
    averageRating: 4.7,
    streakDays: 15,
    totalStudyHours: 156
  });

  const [activityData] = useState([
    {
      id: 1,
      type: 'application',
      title: 'Aplicação enviada para Desenvolvedor React',
      company: 'TechCorp',
      date: '2024-01-20',
      status: 'pending'
    },
    {
      id: 2,
      type: 'course',
      title: 'Concluído: JavaScript Avançado',
      instructor: 'Maria Santos',
      date: '2024-01-19',
      status: 'completed'
    },
    {
      id: 3,
      type: 'interview',
      title: 'Entrevista agendada com StartupXYZ',
      date: '2024-01-18',
      status: 'scheduled'
    }
  ]);

  // Funções
  const handleEditProfile = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      addNotification({
        type: 'success',
        message: 'Perfil atualizado com sucesso!'
      });
    }
  };

  const handleLogout = () => {
    addNotification({
      type: 'info',
      message: 'Saindo da conta...'
    });
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1000);
  };

  const handleSubscriptionManagement = () => {
    addNotification({
      type: 'info',
      message: 'Abrindo gerenciamento de assinatura...'
    });
  };

  const handleSettingsChange = (setting: string, value: any) => {
    setProfileData(prev => ({ ...prev, [setting]: value }));
    addNotification({
      type: 'success',
      message: 'Configuração atualizada!'
    });
  };

  const handleExportData = () => {
    addNotification({
      type: 'info',
      message: 'Preparando exportação dos seus dados...'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'scheduled': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return Briefcase;
      case 'course': return GraduationCap;
      case 'interview': return Calendar;
      default: return CheckCircle;
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">{profileData.avatar}</span>
                </div>
                <button
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-gray-900"
                  onClick={() => addNotification({ type: 'info', message: 'Alterando foto do perfil...' })}
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-purple-500/20 text-white text-lg font-bold rounded px-2 py-1 border border-purple-500/30 focus:border-purple-400 outline-none"
                    />
                    <input
                      type="text"
                      value={profileData.title}
                      onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-purple-500/20 text-purple-200 text-sm rounded px-2 py-1 border border-purple-500/30 focus:border-purple-400 outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-white font-bold text-lg truncate">{profileData.name}</h2>
                    <p className="text-purple-200 text-sm truncate">{profileData.title}</p>
                    <p className="text-purple-300 text-xs">Membro desde {profileData.memberSince}</p>
                  </>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                onClick={handleEditProfile}
              >
                {isEditing ? <CheckCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
            </div>

            {/* Bio */}
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-purple-500/20 text-purple-200 text-sm rounded px-3 py-2 border border-purple-500/30 focus:border-purple-400 outline-none resize-none"
                rows={3}
                placeholder="Conte um pouco sobre você..."
              />
            ) : (
              <p className="text-purple-200 text-sm leading-relaxed">{profileData.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 text-lg font-bold">{userStats.totalApplications}</div>
                <div className="text-purple-200 text-xs">Aplicações</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 text-lg font-bold">{userStats.successRate}%</div>
                <div className="text-purple-200 text-xs">Taxa sucesso</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 text-lg font-bold">{userStats.profileViews}</div>
                <div className="text-purple-200 text-xs">Visualizações</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {profileData.profileVisibility === 'public' ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <span className="text-gray-400 text-xs">
                  {profileData.profileVisibility === 'public' ? 'Público' : 'Privado'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-white text-sm">{profileData.email}</p>
                    )}
                    <p className="text-gray-400 text-xs">Email principal</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs">Verificado</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-white text-sm">{profileData.phone}</p>
                    )}
                    <p className="text-gray-400 text-xs">Telefone</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs">Pendente</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-white text-sm">{profileData.location}</p>
                  )}
                  <p className="text-gray-400 text-xs">Localização</p>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            {showPrivacySettings && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Configurações de Privacidade
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Perfil visível</span>
                    <select
                      value={profileData.profileVisibility}
                      onChange={(e) => handleSettingsChange('profileVisibility', e.target.value)}
                      className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 outline-none"
                    >
                      <option value="public">Público</option>
                      <option value="private">Privado</option>
                      <option value="contacts">Apenas contatos</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assinatura */}
        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Plano {subscriptionData.plan}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">Ativo</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Uso atual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-200">Aplicações utilizadas</span>
                <span className="text-yellow-400 font-medium">
                  {subscriptionData.usedApplications}/{subscriptionData.applications}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{width: `${(subscriptionData.usedApplications / subscriptionData.applications) * 100}%`}}
                ></div>
              </div>
              <p className="text-yellow-200 text-xs">
                {subscriptionData.applications - subscriptionData.usedApplications} aplicações restantes este mês
              </p>
            </div>

            {/* Detalhes do plano */}
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div>
                <p className="text-white font-medium">
                  {subscriptionData.currency} {subscriptionData.price}/{subscriptionData.period}
                </p>
                <p className="text-yellow-200 text-sm">{subscriptionData.applications} aplicações/mês</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-300 text-xs">Próxima cobrança</p>
                <p className="text-yellow-400 text-sm font-medium">
                  {new Date(subscriptionData.renewalDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Recursos inclusos */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Recursos inclusos:</h4>
              <div className="space-y-1">
                {subscriptionData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-yellow-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Método de pagamento */}
            <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-400" />
                <span className="text-orange-200 text-sm">Cartão {subscriptionData.paymentMethod}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-500 text-orange-300 hover:bg-orange-500/10"
                onClick={() => setShowPaymentModal(true)}
              >
                Alterar
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                onClick={handleSubscriptionManagement}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
                onClick={() => addNotification({ type: 'info', message: 'Abrindo planos disponíveis...' })}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityData.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                      {activity.company && (
                        <p className="text-gray-400 text-xs">{activity.company}</p>
                      )}
                      {activity.instructor && (
                        <p className="text-gray-400 text-xs">por {activity.instructor}</p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(activity.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status === 'completed' ? 'Concluído' :
                       activity.status === 'pending' ? 'Pendente' :
                       activity.status === 'scheduled' ? 'Agendado' : activity.status}
                    </span>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              onClick={() => addNotification({ type: 'info', message: 'Abrindo histórico completo...' })}
            >
              Ver Histórico Completo
            </Button>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Notificações */}
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="text-white text-sm">Notificações</span>
                  </div>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Email</span>
                    <button
                      onClick={() => handleSettingsChange('emailNotifications', !profileData.emailNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        profileData.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        profileData.emailNotifications ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Push</span>
                    <button
                      onClick={() => handleSettingsChange('pushNotifications', !profileData.pushNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        profileData.pushNotifications ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        profileData.pushNotifications ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Marketing</span>
                    <button
                      onClick={() => handleSettingsChange('marketingEmails', !profileData.marketingEmails)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        profileData.marketingEmails ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        profileData.marketingEmails ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Métodos de Pagamento */}
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    <div>
                      <span className="text-white text-sm">Métodos de Pagamento</span>
                      <p className="text-gray-400 text-xs">Gerencie seus cartões e formas de pagamento</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPaymentModal(true)}
                    className="border-green-500 text-green-300 hover:bg-green-500/10"
                  >
                    Gerenciar
                  </Button>
                </div>
              </div>

              {/* Outras configurações */}
              {[
                {
                  icon: Palette,
                  label: 'Aparência',
                  action: 'Personalizar',
                  onClick: () => addNotification({ type: 'info', message: 'Abrindo configurações de aparência...' })
                },
                {
                  icon: Globe,
                  label: 'Idioma e Região',
                  action: 'Português (BR)',
                  onClick: () => addNotification({ type: 'info', message: 'Abrindo configurações de idioma...' })
                },
                {
                  icon: Shield,
                  label: 'Privacidade e Segurança',
                  action: 'Configurar',
                  onClick: () => addNotification({ type: 'info', message: 'Abrindo configurações de privacidade...' })
                },
                {
                  icon: Download,
                  label: 'Exportar Dados',
                  action: 'Baixar',
                  onClick: handleExportData
                },
                {
                  icon: HelpCircle,
                  label: 'Ajuda e Suporte',
                  action: 'Contatar',
                  onClick: () => addNotification({ type: 'info', message: 'Abrindo central de ajuda...' })
                },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-white text-sm">{item.label}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{item.action}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <GraduationCap className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-green-400 text-sm font-bold">{userStats.coursesCompleted}</div>
                <div className="text-green-200 text-xs">Cursos</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Award className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-yellow-400 text-sm font-bold">{userStats.certificatesEarned}</div>
                <div className="text-yellow-200 text-xs">Certificados</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Target className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <div className="text-blue-400 text-sm font-bold">{userStats.skillsLearned}</div>
                <div className="text-blue-200 text-xs">Skills</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <div className="text-purple-400 text-sm font-bold">{userStats.streakDays}</div>
                <div className="text-purple-200 text-xs">Dias seguidos</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Próxima conquista</p>
                  <p className="text-green-200 text-xs">Complete mais 2 cursos para desbloquear "Expert"</p>
                </div>
                <div className="text-green-400 text-2xl">🏆</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="bg-red-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                onClick={() => addNotification({ type: 'info', message: 'Compartilhando perfil...' })}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar Perfil
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Modal */}
      <PaymentMethodsModal
        isVisible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </MobileLayout>
  );
};
