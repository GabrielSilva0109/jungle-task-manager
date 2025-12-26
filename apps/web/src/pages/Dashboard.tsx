import { useState } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth';
import { Button } from '../components/ui/button';
import NavButton from '../components/ui/NavButton';
import { WebSocketTester } from '../components/WebSocketTester';
import Home from './Home';
import Tasks from './Tasks';
import Users from './Users';
import Profile from './Profile';
import jungleLogo from '../assets/jungle.svg';

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navegação entre páginas
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'tarefas':
        return <Tasks />;
      case 'usuarios':
        return <Users />;
      case 'perfil':
        return <Profile />;
      case 'websocket':
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Testes WebSocket</h1>
            <WebSocketTester />
          </div>
        );
      default:
        return <Home />;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
 
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2a2627' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg shadow-lg"
        style={{
          backgroundColor: 'rgba(11, 8, 9, 0.8)',
          borderBottom: '1px solid rgba(127, 228, 26, 0.2)',
          outlineColor: 'color-mix(in oklab, #7fe41a 50%, transparent)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <img
                src={jungleLogo}
                alt="Jungle Logo"
                style={{ width: '64px' }}
              />
            </div>

            {/* Desktop Navigation */}
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
              <NavButton
                isActive={currentPage === 'websocket'}
                onClick={() => setCurrentPage('websocket')}
              >
                WebSocket
              </NavButton>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">

              {/* Desktop user info */}
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm" style={{ color: '#9f9fa9' }}>
                  Olá, {user?.username}!
                </span>
              </div>

              {/* Logout button (desktop + mobile) */}
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="transition-all duration-200 hidden md:inline-flex"
                style={{
                  color: '#ffffff',
                  borderColor: '#7fe41a',
                  backgroundColor: 'transparent',
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

              {/* Mobile menu button */}
              <button
                className="md:hidden flex items-center justify-center p-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 shadow-lg"
            style={{
              backgroundColor: 'rgba(11, 8, 9, 0.95)',
              borderTop: '1px solid rgba(127, 228, 26, 0.2)',
            }}
          >
            <div className="flex flex-col px-4 py-4 space-y-2">
              <NavButton
                isActive={currentPage === 'home'}
                onClick={() => {
                  setCurrentPage('home');
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </NavButton>

              <NavButton
                isActive={currentPage === 'tarefas'}
                onClick={() => {
                  setCurrentPage('tarefas');
                  setIsMobileMenuOpen(false);
                }}
              >
                Tarefas
              </NavButton>

              <NavButton
                isActive={currentPage === 'usuarios'}
                onClick={() => {
                  setCurrentPage('usuarios');
                  setIsMobileMenuOpen(false);
                }}
              >
                Usuários
              </NavButton>

              <NavButton
                isActive={currentPage === 'perfil'}
                onClick={() => {
                  setCurrentPage('perfil');
                  setIsMobileMenuOpen(false);
                }}
              >
                Perfil
              </NavButton>

              <NavButton
                isActive={currentPage === 'websocket'}
                onClick={() => {
                  setCurrentPage('websocket');
                  setIsMobileMenuOpen(false);
                }}
              >
                WebSocket
              </NavButton>

              <div className="border-t border-white/10 pt-4 mt-4">
                <span className="block text-sm mb-3" style={{ color: '#9f9fa9' }}>
                  Olá, {user?.username}
                </span>

                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  style={{
                    color: '#ffffff',
                    borderColor: '#7fe41a',
                    backgroundColor: 'transparent',
                    width: '100%',
                  }}
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main style={{ paddingTop: '5rem' }}>
        {renderCurrentPage()}
      </main>
    </div>
  );
}