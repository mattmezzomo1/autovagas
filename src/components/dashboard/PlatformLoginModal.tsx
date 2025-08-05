import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ExternalLink, Link2, Globe, Briefcase, Building2 } from 'lucide-react';
import { platformAuthService, AuthResult } from '../../services/platformAuth.service';

interface PlatformLoginModalProps {
  platform: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (platform: string) => void;
}

const platformConfig = {
  linkedin: {
    name: 'LinkedIn',
    icon: ExternalLink,
    color: '#0077B5',
    description: 'Conecte-se com sua conta do LinkedIn para acessar vagas profissionais',
    isOAuth: true,
    loginUrl: 'https://www.linkedin.com'
  },
  infojobs: {
    name: 'InfoJobs',
    icon: Link2,
    color: '#2D72D9',
    description: 'Conecte-se com sua conta do InfoJobs para acessar milhares de vagas',
    isOAuth: false,
    loginUrl: 'https://www.infojobs.com.br'
  },
  catho: {
    name: 'Catho',
    icon: Briefcase,
    color: '#FF6B35',
    description: 'Conecte-se com sua conta da Catho para encontrar oportunidades',
    isOAuth: false,
    loginUrl: 'https://www.catho.com.br'
  },
  indeed: {
    name: 'Indeed',
    icon: Globe,
    color: '#2557A7',
    description: 'Conecte-se com sua conta do Indeed para acessar vagas globais',
    isOAuth: false,
    loginUrl: 'https://www.indeed.com.br'
  },
  vagas: {
    name: 'Vagas.com',
    icon: Building2,
    color: '#E31E24',
    description: 'Conecte-se com sua conta do Vagas.com para encontrar oportunidades',
    isOAuth: false,
    loginUrl: 'https://www.vagas.com.br'
  }
};

export const PlatformLoginModal: React.FC<PlatformLoginModalProps> = ({
  platform,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  const config = platformConfig[platform as keyof typeof platformConfig];
  const Icon = config?.icon || Globe;

  if (!isOpen || !config) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      let authResult: AuthResult;

      if (config.isOAuth) {
        // LinkedIn usa OAuth
        authResult = await platformAuthService.connectLinkedIn();
      } else {
        // Outras plataformas usam credenciais
        const credentials = { username, password };
        
        switch (platform) {
          case 'infojobs':
            authResult = await platformAuthService.connectInfoJobs(credentials);
            break;
          case 'catho':
            authResult = await platformAuthService.connectCatho(credentials);
            break;
          case 'indeed':
            authResult = await platformAuthService.connectIndeed(credentials);
            break;
          case 'vagas':
            authResult = await platformAuthService.connectVagas(credentials);
            break;
          default:
            authResult = {
              success: false,
              message: 'Plataforma não suportada'
            };
        }
      }

      setResult(authResult);

      if (authResult.success) {
        setTimeout(() => {
          onSuccess(platform);
          onClose();
          setUsername('');
          setPassword('');
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setResult({
        success: false,
        message: 'Erro inesperado durante a autenticação'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setUsername('');
      setPassword('');
      setResult(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20`, border: `1px solid ${config.color}40` }}
            >
              <Icon className="w-6 h-6" style={{ color: config.color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Conectar {config.name}</h2>
              <p className="text-purple-200 text-sm">Faça login para continuar</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-purple-300 hover:text-purple-200 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Description */}
        <p className="text-purple-200 text-sm mb-6 text-center">
          {config.description}
        </p>

        {/* OAuth Notice for LinkedIn */}
        {config.isOAuth && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 font-medium">Autenticação Segura</span>
            </div>
            <p className="text-blue-200/80 text-sm">
              Você será redirecionado para o {config.name} para fazer login de forma segura. 
              Não compartilhamos suas credenciais.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!config.isOAuth && (
            <>
              {/* Username/Email */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Email ou Usuário
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Seu email ou usuário"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    placeholder="Sua senha"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Result Message */}
          {result && (
            <div className={`p-4 rounded-xl border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/20 text-green-200' 
                : 'bg-red-500/10 border-red-500/20 text-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm font-medium">
                  {result.success ? 'Conectado com sucesso!' : 'Erro na conexão'}
                </span>
              </div>
              <p className="text-sm mt-1 opacity-80">{result.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!config.isOAuth && (!username || !password))}
            className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: config.color,
              color: 'white'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Icon className="w-5 h-5" />
                Conectar com {config.name}
              </>
            )}
          </button>
        </form>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <p className="text-purple-300 text-sm">
            Não tem uma conta?{' '}
            <a
              href={config.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-200 hover:text-white underline"
            >
              Criar conta no {config.name}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
