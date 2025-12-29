import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import StandardCard from '../components/ui/StandardCard';
import { Search, UserPlus, MoreHorizontal, Mail, Calendar, User, Edit, Save, X, Trash2 } from 'lucide-react';
import { authApi, tasksApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  tasksCount: number;
}

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ role: string; isActive: boolean }>({ role: 'user', isActive: true });
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'viewer'>('all');
  
  // Check if current user is admin by looking at role
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCurrentUserData();
  }, []);

  const loadCurrentUserData = async () => {
    try {
      const usersData = await authApi.getUsers();
      const currentUserInfo = usersData.find(u => u.username === currentUser?.username || u.email === currentUser?.email);
      setCurrentUserData(currentUserInfo);
      setIsCurrentUserAdmin(currentUserInfo?.role === 'admin');
    } catch (error) {
      console.error('Erro ao carregar dados do usuário atual:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await authApi.getUsers();
      
      // Get tasks count for each user
      const usersWithTasksCount = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Get tasks for this specific user by making a request with their user ID
            const tasksResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tasks`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.tokens?.accessToken : ''}`,
                'x-user-id': user.id
              }
            });
            
            if (tasksResponse.ok) {
              const tasksData = await tasksResponse.json();
              const taskCount = tasksData.meta?.total || 0;
              return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
                lastLogin: user.updatedAt,
                tasksCount: taskCount
              };
            } else {
              // Fallback if request fails
              return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
                lastLogin: user.updatedAt,
                tasksCount: 0
              };
            }
          } catch (error) {
            console.error(`Erro ao buscar tarefas para usuário ${user.username}:`, error);
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role || 'user',
              isActive: user.isActive !== false,
              createdAt: user.createdAt,
              lastLogin: user.updatedAt,
              tasksCount: 0
            };
          }
        })
      );
      
      setUsers(usersWithTasksCount);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user.id);
    setEditData({ 
      role: user.role, 
      isActive: user.isActive 
    });
  };

  const handleSaveUser = async (userId: string) => {
    try {
      await authApi.updateUser(userId, editData);
      await loadUsers(); // Reload users to get updated data
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditData({ role: 'user', isActive: true });
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      try {
        await authApi.deleteUser(userId);
        await loadUsers(); // Reload users list
        console.log('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. Tente novamente.');
      }
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#6b7280';
  };

  const getRoleColor = (role: User['role']) => {
    const colors = {
      'admin': '#7fe41a',
      'user': '#3b82f6',
      'viewer': '#8b5cf6'
    };
    return colors[role];
  };

  const filteredUsers = users.filter(user => {
    // Filtro de busca por nome ou email
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    
    // Filtro de role
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: users.length,
      description: 'Usuários cadastrados'
    },
    {
      title: 'Usuários Ativos',
      value: users.filter(u => u.isActive === true).length,
      description: 'Usuários ativos no sistema'
    },
    {
      title: 'Administradores',
      value: users.filter(u => u.role === 'admin').length,
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400">Carregando informações dos usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header da página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400 text-sm sm:text-base">Gerencie todos os usuários do sistema</p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuários por nome ou email..."
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="flex-1 sm:flex-none bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user' | 'viewer')}
              className="flex-1 sm:flex-none bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todas as Funções</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </StandardCard>

      {/* Lista de usuários */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <StandardCard key={user.id}>
            <div className="space-y-4">
              {/* Header do usuário - avatar, nome e badges */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)' }}
                >
                  <User className="w-6 h-6" style={{ color: '#7fe41a' }} />
                </div>
                
                {/* Informações principais */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h3 className="text-white font-semibold text-lg truncate">{user.username}</h3>
                    
                    {/* Ações desktop */}
                    <div className="hidden sm:flex items-center space-x-2">
                      {isCurrentUserAdmin && (
                        editingUser === user.id ? (
                          // Botões de salvar/cancelar
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                              onClick={() => handleSaveUser(user.id)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          // Botões de editar e excluir
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            {/* Prevent deleting own account and prevent deleting last admin */}
                            {currentUserData?.id !== user.id && (user.role !== 'admin' || users.filter(u => u.role === 'admin').length > 1) && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )
                      )}
                      
                      {!isCurrentUserAdmin && (
                        <span className="text-xs text-gray-500">Sem permissão</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Badges de status e role */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editingUser === user.id && isCurrentUserAdmin ? (
                      // Edit mode - mobile and desktop
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <select
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        
                        <select
                          value={editData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'active' })}
                          className="bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <Badge 
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }}
                        >
                          {user.role}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: `${getStatusColor(user.isActive)}20`, color: getStatusColor(user.isActive) }}
                        >
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Informações de contato e datas */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1 text-sm text-gray-400">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="break-all">{user.email}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <span>{user.tasksCount} tarefas</span>
                  
                  {user.lastLogin && (
                    <span>Último login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
              
              {/* Ações mobile - aparece apenas em telas pequenas */}
              {isCurrentUserAdmin && (
                <div className="flex sm:hidden gap-2 pt-3 border-t border-gray-700">
                  {editingUser === user.id ? (
                    // Botões de salvar/cancelar mobile
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                        onClick={() => handleSaveUser(user.id)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    // Botões de editar e excluir mobile
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      
                      {/* Prevent deleting own account and prevent deleting last admin */}
                      {currentUserData?.id !== user.id && (user.role !== 'admin' || users.filter(u => u.role === 'admin').length > 1) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {!isCurrentUserAdmin && (
                <div className="flex sm:hidden pt-3 border-t border-gray-700 justify-center">
                  <span className="text-xs text-gray-500">Sem permissão para editar</span>
                </div>
              )}
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