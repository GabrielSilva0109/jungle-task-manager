import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import StandardCard from '../components/ui/StandardCard';
import { useAuthStore } from '../stores/auth';
import { User, Mail, Calendar, Key, Edit, Save, X, Shield } from 'lucide-react';
import { tasksApi, authApi } from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileStats, setProfileStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    totalTasks: 0,
    joinDate: user?.createdAt || '2024-01-10',
    lastLogin: user?.updatedAt || '2024-01-15T14:30:00'
  });
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: (user as any)?.bio || '',
    phone: (user as any)?.phone || '',
    company: (user as any)?.company || '',
    position: (user as any)?.position || ''
  });

  // Atualizar editData quando user mudar
  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        bio: (user as any)?.bio || '',
        phone: (user as any)?.phone || '',
        company: (user as any)?.company || '',
        position: (user as any)?.position || ''
      });
    }
  }, [user]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      // Get all tasks to calculate user-specific statistics
      const tasksResponse = await tasksApi.getTasks({ page: 1, size: 1000 });
      const allTasks = tasksResponse.data;
      
      // Filter tasks for current user (in a real app, this would be done server-side)
      const userTasks = allTasks; // For now, showing all tasks since we don't have user-specific filtering
      
      const completed = userTasks.filter(task => task.status === 'DONE').length;
      const inProgress = userTasks.filter(task => task.status === 'IN_PROGRESS').length;
      const total = userTasks.length;
      
      setProfileStats({
        tasksCompleted: completed,
        tasksInProgress: inProgress,
        totalTasks: total,
        joinDate: user?.createdAt || '2024-01-10',
        lastLogin: user?.updatedAt || new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao carregar estatisticas do usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      alert('Erro: usuário não encontrado');
      return;
    }

    try {
      setSaving(true);
      
      // Atualizar perfil via API
      const updatedUser = await authApi.updateProfile(user.id, {
        username: editData.username,
        email: editData.email,
        bio: editData.bio,
        phone: editData.phone,
        company: editData.company,
        position: editData.position
      });
      
      // Atualizar o usuário no store com TODOS os campos
      setUser({
        ...user,
        username: editData.username,
        email: editData.email,
        bio: editData.bio,
        phone: editData.phone,
        company: editData.company,
        position: editData.position
      } as any);
      
      // Atualizar localStorage do auth com todos os campos
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.state.user = {
          ...parsed.state.user,
          username: editData.username,
          email: editData.email,
          bio: editData.bio,
          phone: editData.phone,
          company: editData.company,
          position: editData.position
        };
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
      
      setEditMode(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    // Aqui seria feita a chamada para a API para alterar a senha
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas nao coincidem!');
      return;
    }
    console.log('Alterando senha');
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const cancelEdit = () => {
    setEditData({
      username: user?.username || '',
      email: user?.email || '',
      bio: (user as any)?.bio || '',
      phone: (user as any)?.phone || '',
      company: (user as any)?.company || '',
      position: (user as any)?.position || ''
    });
    setEditMode(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header da pagina */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Perfil do Usuario</h1>
        <p className="text-gray-400 text-sm sm:text-base">Gerencie suas informacoes pessoais e configuracoes</p>
      </div>

      {/* Informacoes principais */}
      <StandardCard 
        title="Informacoes Pessoais"
        headerAction={
          !editMode ? (
            <Button 
              onClick={() => setEditMode(true)}
              variant="outline" 
              size="sm"
              style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
              className="w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                size="sm"
                style={{ backgroundColor: '#7fe41a', color: '#000000' }}
                className="hover:opacity-90 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button 
                onClick={cancelEdit}
                disabled={saving}
                variant="outline" 
                size="sm"
                style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0"
            style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)' }}
          >
            <User className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#7fe41a' }} />
          </div>

          {/* Informacoes */}
          <div className="flex-1 w-full space-y-4">
            {!editMode ? (
              <>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{user?.username}</h3>
                  <div className="flex items-center justify-center sm:justify-start space-x-1 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="break-all">{user?.email}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
                  <div>
                    <label className="text-gray-400 text-sm">Telefone</label>
                    <p className="text-white text-sm sm:text-base">{editData.phone || 'Nao informado'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Empresa</label>
                    <p className="text-white text-sm sm:text-base">{editData.company || 'Nao informado'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cargo</label>
                    <p className="text-white text-sm sm:text-base">{editData.position || 'Nao informado'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Membro desde</label>
                    <p className="text-white text-sm sm:text-base">{new Date(profileStats.joinDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                {editData.bio && (
                  <div className="pt-4">
                    <label className="text-gray-400 text-sm">Bio</label>
                    <p className="text-white mt-1 text-sm sm:text-base">{editData.bio}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Nome de usuario</label>
                    <Input
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Email</label>
                    <Input
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Telefone</label>
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Empresa</label>
                    <Input
                      value={editData.company}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      placeholder="Nome da empresa"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Cargo</label>
                  <Input 
                    value={editData.position}
                    onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                    placeholder="Seu cargo na empresa"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Bio</label>
                  <Textarea                 
                    value={editData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Conte um pouco sobre voce..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </StandardCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatisticas */}
        <StandardCard title="Estatisticas">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-400">Carregando estatisticas...</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tarefas Concluidas</span>
                  <span className="text-white font-semibold">{profileStats.tasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tarefas em Progresso</span>
                  <span className="text-white font-semibold">{profileStats.tasksInProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total de Tarefas</span>
                  <span className="text-white font-semibold">{profileStats.totalTasks}</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Taxa de Conclusao</span>
                    <span className="text-white font-semibold">
                      {profileStats.totalTasks > 0 ? Math.round((profileStats.tasksCompleted / profileStats.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </StandardCard>

        {/* Informacoes da conta */}
        <StandardCard title="Informacoes da Conta">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5" style={{ color: '#7fe41a' }} />
              <div>
                <p className="text-white font-medium">Tipo de Conta</p>
                <p className="text-gray-400 text-sm">Administrador</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5" style={{ color: '#7fe41a' }} />
              <div>
                <p className="text-white font-medium">Ultimo Login</p>
                <p className="text-gray-400 text-sm">
                  {new Date(profileStats.lastLogin).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </StandardCard>
      </div>

      {/* Seguranca */}
      <StandardCard title="Segurança">
        {!showPasswordForm ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 flex-shrink-0" style={{ color: '#7fe41a' }} />
              <div>
                <p className="text-white font-medium">Senha</p>
                <p className="text-gray-400 text-sm">Altere sua senha regularmente para manter sua conta segura</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowPasswordForm(true)}
              variant="outline"
              style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
              className="w-full sm:w-auto"
            >
              Alterar Senha
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Senha Atual</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Nova Senha</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Confirmar Nova Senha</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleChangePassword}
                style={{ backgroundColor: '#7fe41a', color: '#000000' }}
                className="hover:opacity-90 w-full sm:w-auto"
              >
                Alterar Senha
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </StandardCard>
    </div>
  );
}