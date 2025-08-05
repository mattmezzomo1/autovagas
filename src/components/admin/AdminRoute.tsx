import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rotas administrativas
 * Verifica se o usuário está autenticado e tem role "admin"
 * Redireciona para a página de login caso contrário
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { profile } = useAuthStore();
  
  // Verifica se o usuário está autenticado e tem role "admin"
  const isAdmin = profile?.role === 'admin';
  
  if (!isAdmin) {
    // Redireciona para a página de login
    return <Navigate to="/login" replace />;
  }
  
  // Renderiza o conteúdo protegido
  return <>{children}</>;
};
