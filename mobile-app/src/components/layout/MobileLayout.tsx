import React from 'react';
import { Header } from './Header';
import { NavigationBar } from './NavigationBar';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header fixo no topo */}
      <Header />
      
      {/* Conteúdo principal com padding para header e navigation */}
      <main className={`pt-16 pb-20 px-4 ${className}`}>
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
      
      {/* Navigation bar fixa na parte inferior */}
      <NavigationBar />
    </div>
  );
};
