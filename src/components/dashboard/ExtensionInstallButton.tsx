import React, { useState, useEffect } from 'react';
import { Download, Chrome, CheckCircle, Bot } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export const ExtensionInstallButton: React.FC = () => {
  const { profile } = useAuthStore();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  // Verifica se o usuário tem plano básico
  const hasBasicPlan = profile.subscription?.plan === 'basic';

  // Verifica se a extensão está instalada
  useEffect(() => {
    checkExtensionInstalled();
  }, []);

  const checkExtensionInstalled = () => {
    // Verifica se a extensão está instalada
    const extensionId = 'autovagas-extension-id'; // ID real da extensão

    try {
      if (window.chrome && window.chrome.runtime) {
        window.chrome.runtime.sendMessage(extensionId, { action: 'ping' }, (response) => {
          setIsExtensionInstalled(!!response);
        });
      }
    } catch (error) {
      setIsExtensionInstalled(false);
    }
  };

  const handleInstallExtension = () => {
    const extensionUrl = 'https://chrome.google.com/webstore/detail/autovagas-extension/[ID_DA_EXTENSAO]';
    window.open(extensionUrl, '_blank');
  };

  const handleOpenExtension = () => {
    if (isExtensionInstalled) {
      alert('Clique no ícone da extensão AutoVagas na barra de ferramentas do Chrome para abrir o painel de controle.');
    }
  };

  // Só mostra para usuários do plano básico
  if (!hasBasicPlan) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
            <Chrome className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">Extensão Chrome</h3>
              {isExtensionInstalled && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Instalada</span>
                </div>
              )}
            </div>
            <p className="text-orange-200 text-sm">
              {isExtensionInstalled
                ? 'Clique no ícone da extensão para usar'
                : '50 aplicações automáticas incluídas no seu plano'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isExtensionInstalled ? (
            <button
              onClick={handleInstallExtension}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
          ) : (
            <button
              onClick={handleOpenExtension}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Bot className="w-4 h-4" />
              Abrir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
