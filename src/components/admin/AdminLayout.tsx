import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

/**
 * Layout base para todas as páginas administrativas
 * Inclui sidebar, header e área de conteúdo
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  description 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1">
          <AdminHeader 
            title={title} 
            onMenuClick={() => setSidebarOpen(true)} 
          />
          
          <main className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {description && (
                <p className="text-purple-200 mt-2">{description}</p>
              )}
            </div>
            
            {/* Page Content */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
