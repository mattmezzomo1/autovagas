import React, { ReactNode } from 'react';
import { Header } from '../Header';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente de layout padrão para páginas com header fixo
 * Adiciona automaticamente o padding-top necessário para evitar que o conteúdo seja cortado pelo header
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 text-white">
      <Header />
      <div className={`pt-24 ${className}`}>
        {children}
      </div>
    </div>
  );
};
