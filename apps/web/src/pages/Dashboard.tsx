import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth';
import { Button } from '../components/ui/button';
import NavButton from '../components/ui/NavButton';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';
import StatusIndicator from '../components/StatusIndicator';
import Home from './Home';
import Tarefas from './Tarefas';
import Usuarios from './Usuarios';
import Perfil from './Perfil';

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('home');
  const { notifications, removeNotification, success, error: notifyError } = useNotifications();
  const hasShownWelcome = useRef(false);

  // Navegação entre páginas
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'tarefas':
        return <Tarefas />;
      case 'usuarios':
        return <Usuarios />;
      case 'perfil':
        return <Perfil />;
      default:
        return <Home />;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Show welcome notification only once
    if (!hasShownWelcome.current) {
      success('Bem-vindo!', `Login realizado com sucesso. Bem-vindo ao Jungle Task Manager, ${user?.username}!`);
      hasShownWelcome.current = true;
    }
  }, [isAuthenticated, user, success]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0809' }}>
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg shadow-lg"
        style={{ 
          backgroundColor: 'rgba(11, 8, 9, 0.8)',
          borderBottom: '1px solid rgba(127, 228, 26, 0.2)',
          outlineColor: 'color-mix(in oklab, #7fe41a 50%, transparent)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold" style={{ color: '#7fe41a' }}>
                Jungle
              </h1>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-2">
              <NavButton
                isActive={currentPage === 'home'}
                onClick={() => setCurrentPage('home')}
              >
                Home
              </NavButton>
              <NavButton
                isActive={currentPage === 'tarefas'}
                onClick={() => setCurrentPage('tarefas')}
              >
                Tarefas
              </NavButton>
              <NavButton
                isActive={currentPage === 'usuarios'}
                onClick={() => setCurrentPage('usuarios')}
              >
                Usuários
              </NavButton>
              <NavButton
                isActive={currentPage === 'perfil'}
                onClick={() => setCurrentPage('perfil')}
              >
                Perfil
              </NavButton>
            </nav>

            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm" style={{ color: '#9f9fa9' }}>
                  Olá, {user?.username}!
                </span>
                <StatusIndicator isOnline={true} lastSync={new Date()} />
              </div>
              <Button 
                onClick={logout} 
                variant="outline"
                size="sm"
                className="transition-all duration-200"
                style={{ 
                  color: '#ffffff',
                  borderColor: '#7fe41a',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#7fe41a';
                  (e.target as HTMLElement).style.color = '#0b0809';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLElement).style.color = '#ffffff';
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: '5rem' }}>
        {renderCurrentPage()}
      </main>

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}