import React, { useState } from 'react';
import { X, Check, Loader, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  color: string;
  features: string[];
}

interface PlatformConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platformId: string, credentials: { email: string; password: string }) => void;
}

export const PlatformConnectionModal: React.FC<PlatformConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const platforms: Platform[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      description: 'Rede profissional com milhões de vagas',
      connected: false,
      color: 'from-blue-600 to-blue-700',
      features: ['Vagas premium', 'Networking', 'Perfil profissional']
    },
    {
      id: 'infojobs',
      name: 'InfoJobs',
      icon: '🔍',
      description: 'Portal líder em vagas de emprego',
      connected: false,
      color: 'from-orange-500 to-orange-600',
      features: ['Vagas locais', 'Filtros avançados', 'Alertas de vaga']
    },
    {
      id: 'catho',
      name: 'Catho',
      icon: '📋',
      description: 'Plataforma completa de recrutamento',
      connected: false,
      color: 'from-green-500 to-green-600',
      features: ['Testes vocacionais', 'Cursos online', 'Orientação de carreira']
    },
    {
      id: 'indeed',
      name: 'Indeed',
      icon: '🌐',
      description: 'Maior site de empregos do mundo',
      connected: false,
      color: 'from-blue-500 to-indigo-600',
      features: ['Vagas globais', 'Reviews de empresas', 'Salários']
    },
    {
      id: 'vagas',
      name: 'Vagas.com',
      icon: '💻',
      description: 'Portal brasileiro de oportunidades',
      connected: false,
      color: 'from-purple-500 to-purple-600',
      features: ['Vagas nacionais', 'Estágios', 'Trainee programs']
    }
  ];

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!selectedPlatform || !credentials.email || !credentials.password) return;

    setIsConnecting(true);
    
    // Simular conexão
    setTimeout(() => {
      onConnect(selectedPlatform.id, credentials);
      setIsConnecting(false);
      setSelectedPlatform(null);
      setCredentials({ email: '', password: '' });
      onClose();
    }, 2000);
  };

  const handleBack = () => {
    setSelectedPlatform(null);
    setCredentials({ email: '', password: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedPlatform ? `Conectar ${selectedPlatform.name}` : 'Conectar Plataformas'}
            </h2>
            <p className="text-slate-400 mt-1">
              {selectedPlatform 
                ? 'Digite suas credenciais para conectar sua conta'
                : 'Escolha uma plataforma para conectar sua conta'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {!selectedPlatform ? (
            /* Lista de Plataformas */
            <div className="space-y-4">
              {platforms.map((platform) => (
                <Card
                  key={platform.id}
                  className="cursor-pointer transition-all duration-300 bg-slate-800/50 hover:bg-slate-800 border-slate-700 hover:border-slate-600"
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-2xl`}>
                          {platform.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{platform.name}</h3>
                          <p className="text-slate-400 text-sm">{platform.description}</p>
                          <div className="flex gap-2 mt-2">
                            {platform.features.slice(0, 2).map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {platform.connected ? (
                          <div className="flex items-center gap-2 text-green-500">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Conectado</span>
                          </div>
                        ) : (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Conectar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Formulário de Conexão */
            <div className="space-y-6">
              {/* Info da Plataforma */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedPlatform.color} flex items-center justify-center text-3xl`}>
                      {selectedPlatform.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{selectedPlatform.name}</h3>
                      <p className="text-slate-400">{selectedPlatform.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aviso de Segurança */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-300 font-medium">Suas credenciais estão seguras</h4>
                    <p className="text-blue-200/80 text-sm mt-1">
                      Utilizamos criptografia de ponta para proteger seus dados. Suas credenciais são usadas apenas para automatizar aplicações em seu nome.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  disabled={isConnecting}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleConnect}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!credentials.email || !credentials.password || isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar Conta'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
