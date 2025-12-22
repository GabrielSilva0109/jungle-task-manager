import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import StandardCard from '../components/ui/StandardCard';
import { Search, UserPlus, MoreHorizontal, Mail, Calendar, User, Edit, Save, X, Trash2 } from 'lucide-react';
import { authApi } from '../services/api';
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

export default function Usuarios() {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ role: string; isActive: boolean }>({ role: 'user', isActive: true });
  
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
      
      // Convert backend data to frontend format
      setUsers(usersData.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        lastLogin: user.updatedAt,
        tasksCount: 0 // Would need to be calculated from tasks
      })));
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
                    
                    {editingUser === user.id && isCurrentUserAdmin ? (
                      // Edit mode
                      <>
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
                      </>
                    ) : (
                      // View mode
                      <>
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }}
                        >
                          {user.role}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${getStatusColor(user.isActive)}20`, color: getStatusColor(user.isActive) }}
                        >
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </>
                    )}
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
              
              {/* Botões de ação para admin */}
              <div className="flex items-center space-x-2">
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