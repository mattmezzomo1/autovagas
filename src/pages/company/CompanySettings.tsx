import React, { useState } from 'react';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  Save, 
  Bell, 
  Users, 
  Shield, 
  CreditCard,
  Brain,
  Mail,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'general', label: 'Geral', icon: Users },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'billing', label: 'Faturamento', icon: CreditCard },
    { id: 'ai', label: 'Configurações IA', icon: Brain },
    { id: 'security', label: 'Segurança', icon: Shield }
  ];

  const teamMembers = [
    { id: '1', name: 'João Silva', email: 'joao@techcorp.com', role: 'Admin', status: 'active' },
    { id: '2', name: 'Maria Santos', email: 'maria@techcorp.com', role: 'Recruiter', status: 'active' },
    { id: '3', name: 'Carlos Oliveira', email: 'carlos@techcorp.com', role: 'Viewer', status: 'pending' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Informações da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    defaultValue="TechCorp Inovações"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">CNPJ</label>
                  <input
                    type="text"
                    defaultValue="12.345.678/0001-90"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Website</label>
                  <input
                    type="url"
                    defaultValue="https://techcorp.com.br"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Telefone</label>
                  <input
                    type="tel"
                    defaultValue="(11) 99999-9999"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Descrição da Empresa</label>
              <textarea
                rows={4}
                defaultValue="Empresa líder em soluções tecnológicas inovadoras..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Preferências de Notificação</h3>
              <div className="space-y-4">
                {[
                  { title: 'Novas candidaturas', desc: 'Receber notificação quando alguém se candidatar', enabled: true },
                  { title: 'Candidatos em destaque', desc: 'IA encontrou candidatos com alto score', enabled: true },
                  { title: 'Relatórios semanais', desc: 'Resumo semanal de performance das vagas', enabled: false },
                  { title: 'Lembretes de entrevista', desc: 'Lembrete 1 hora antes das entrevistas', enabled: true }
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h4 className="text-white font-medium">{notification.title}</h4>
                      <p className="text-white/60 text-sm">{notification.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={notification.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Canais de Notificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">Email</h4>
                    <p className="text-white/60 text-sm">admin@techcorp.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <Smartphone className="w-5 h-5 text-green-400" />
                  <div>
                    <h4 className="text-white font-medium">WhatsApp</h4>
                    <p className="text-white/60 text-sm">(11) 99999-9999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Membros da Equipe</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
                <Plus className="w-4 h-4" />
                Convidar Membro
              </button>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{member.name}</h4>
                      <p className="text-white/60 text-sm">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {member.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                    
                    <select 
                      defaultValue={member.role}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Admin" className="bg-slate-800">Admin</option>
                      <option value="Recruiter" className="bg-slate-800">Recruiter</option>
                      <option value="Viewer" className="bg-slate-800">Viewer</option>
                    </select>

                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Plano Atual</h3>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">Plano Profissional</h4>
                    <p className="text-white/60">15 vagas ativas • 200 candidaturas/mês</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">R$ 197</p>
                    <p className="text-white/60 text-sm">/mês</p>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg transition-all">
                  Gerenciar Assinatura
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Histórico de Pagamentos</h3>
              <div className="space-y-3">
                {[
                  { date: '2024-01-15', amount: 197, status: 'paid' },
                  { date: '2023-12-15', amount: 197, status: 'paid' },
                  { date: '2023-11-15', amount: 197, status: 'paid' }
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Plano Profissional</p>
                      <p className="text-white/60 text-sm">{new Date(payment.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">R$ {payment.amount}</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        Pago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Configurações da IA</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Triagem Automática</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <p className="text-white/60 text-sm">IA analisa automaticamente novos candidatos</p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Sugestões de Melhoria</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <p className="text-white/60 text-sm">Receber sugestões para otimizar vagas</p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-medium mb-2">Nível de Rigor da IA</h4>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="low" className="bg-slate-800">Baixo - Mais candidatos aprovados</option>
                    <option value="medium" className="bg-slate-800">Médio - Equilibrado</option>
                    <option value="high" className="bg-slate-800">Alto - Apenas candidatos ideais</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Segurança da Conta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Autenticação de Dois Fatores</h3>
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">2FA via SMS</h4>
                    <p className="text-white/60 text-sm">Adicione uma camada extra de segurança</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                    Ativar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <CompanyLayout
      title="Configurações"
      description="Gerencie as configurações da sua empresa"
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>
      }
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
