import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import StandardCard from '../components/ui/StandardCard';
import { Search, UserPlus, MoreHorizontal, Mail, Calendar, User } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'User' | 'Viewer';
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  createdAt: string;
  lastLogin?: string;
  tasksCount: number;
}

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data dos usuários
  const [users] = useState<User[]>([
    {
      id: 1,
      username: 'admin',
      email: 'admin@jungle.com',
      role: 'Admin',
      status: 'Ativo',
      createdAt: '2024-01-10',
      lastLogin: '2024-01-15',
      tasksCount: 12
    },
    {
      id: 2,
      username: 'joao.silva',
      email: 'joao.silva@email.com',
      role: 'User',
      status: 'Ativo',
      createdAt: '2024-01-12',
      lastLogin: '2024-01-14',
      tasksCount: 8
    },
    {
      id: 3,
      username: 'maria.costa',
      email: 'maria.costa@email.com',
      role: 'User',
      status: 'Ativo',
      createdAt: '2024-01-13',
      lastLogin: '2024-01-15',
      tasksCount: 5
    },
    {
      id: 4,
      username: 'pedro.santos',
      email: 'pedro.santos@email.com',
      role: 'Viewer',
      status: 'Inativo',
      createdAt: '2024-01-11',
      lastLogin: '2024-01-12',
      tasksCount: 2
    },
    {
      id: 5,
      username: 'ana.oliveira',
      email: 'ana.oliveira@email.com',
      role: 'User',
      status: 'Suspenso',
      createdAt: '2024-01-09',
      lastLogin: '2024-01-13',
      tasksCount: 0
    }
  ]);

  const getStatusColor = (status: User['status']) => {
    const colors = {
      'Ativo': '#10b981',
      'Inativo': '#6b7280',
      'Suspenso': '#ef4444'
    };
    return colors[status];
  };

  const getRoleColor = (role: User['role']) => {
    const colors = {
      'Admin': '#7fe41a',
      'User': '#3b82f6',
      'Viewer': '#8b5cf6'
    };
    return colors[role];
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: users.length,
      description: 'Usuários cadastrados'
    },
    {
      title: 'Usuários Ativos',
      value: users.filter(u => u.status === 'Ativo').length,
      description: 'Usuários ativos no sistema'
    },
    {
      title: 'Administradores',
      value: users.filter(u => u.role === 'Admin').length,
      description: 'Usuários com privilégios de admin'
    },
    {
      title: 'Novos (7 dias)',
      value: users.filter(u => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(u.createdAt) >= weekAgo;
      }).length,
      description: 'Usuários criados na última semana'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400">Gerencie todos os usuários do sistema</p>
        </div>
        
        <Button 
          style={{ backgroundColor: '#7fe41a', color: '#000000' }}
          className="hover:opacity-90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <StandardCard key={index}>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-white mb-1">{stat.title}</div>
              <div className="text-xs text-gray-400">{stat.description}</div>
            </div>
          </StandardCard>
        ))}
      </div>

      {/* Filtros e busca */}
      <StandardCard>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuários por nome ou email..."
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <select className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Suspenso">Suspenso</option>
            </select>
            
            <select className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="">Todas as Funções</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
      </StandardCard>

      {/* Lista de usuários */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <StandardCard key={user.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)' }}
                >
                  <User className="w-6 h-6" style={{ color: '#7fe41a' }} />
                </div>
                
                {/* Informações do usuário */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">{user.username}</h3>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: `${getStatusColor(user.status)}20`, color: getStatusColor(user.status) }}
                    >
                      {user.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{user.tasksCount} tarefas</span>
                    {user.lastLogin && (
                      <span>Último login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </StandardCard>
        ))}
        
        {filteredUsers.length === 0 && (
          <StandardCard>
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 text-lg mb-2">Nenhum usuário encontrado</p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Tente ajustar sua busca' : 'Não há usuários cadastrados no sistema'}
              </p>
            </div>
          </StandardCard>
        )}
      </div>
    </div>
  );
}