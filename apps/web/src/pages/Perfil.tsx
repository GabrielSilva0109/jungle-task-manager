import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import StandardCard from '../components/ui/StandardCard';
import { useAuthStore } from '../stores/auth';
import { User, Mail, Calendar, Key, Edit, Save, X, Shield } from 'lucide-react';
import { tasksApi } from '../services/api';

export default function Perfil() {
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
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
    bio: '',
    phone: '',
    company: '',
    position: ''
  });
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
      console.error('Erro ao carregar estatísticas do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    // Aqui seria feita a chamada para a API para atualizar o perfil
    console.log('Salvando perfil:', editData);
    setEditMode(false);
  };

  const handleChangePassword = () => {
    // Aqui seria feita a chamada para a API para alterar a senha
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
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
      bio: '',
      phone: '',
      company: '',
      position: ''
    });
    setEditMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header da página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Perfil do Usuário</h1>
        <p className="text-gray-400">Gerencie suas informações pessoais e configurações</p>
      </div>

      {/* Informações principais */}
      <StandardCard 
        title="Informações Pessoais"
        headerAction={
          !editMode ? (
            <Button 
              onClick={() => setEditMode(true)}
              variant="outline" 
              size="sm"
              style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveProfile}
                size="sm"
                style={{ backgroundColor: '#7fe41a', color: '#000000' }}
                className="hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button 
                onClick={cancelEdit}
                variant="outline" 
                size="sm"
                style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )
        }
      >
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)' }}
          >
            <User className="w-12 h-12" style={{ color: '#7fe41a' }} />
          </div>

          {/* Informações */}
          <div className="flex-1 space-y-4">
            {!editMode ? (
              <>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{user?.username}</h3>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="text-gray-400 text-sm">Telefone</label>
                    <p className="text-white">{editData.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Empresa</label>
                    <p className="text-white">{editData.company || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cargo</label>
                    <p className="text-white">{editData.position || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Membro desde</label>
                    <p className="text-white">{new Date(profileStats.joinDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                {editData.bio && (
                  <div className="pt-4">
                    <label className="text-gray-400 text-sm">Bio</label>
                    <p className="text-white mt-1">{editData.bio}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Nome de usuário</label>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Conte um pouco sobre você..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </StandardCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas */}
        <StandardCard title="Estatísticas">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-400">Carregando estatísticas...</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tarefas Concluídas</span>
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
                    <span className="text-gray-400">Taxa de Conclusão</span>
                    <span className="text-white font-semibold">
                      {profileStats.totalTasks > 0 ? Math.round((profileStats.tasksCompleted / profileStats.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </StandardCard>

        {/* Informações da conta */}
        <StandardCard title="Informações da Conta">
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
                <p className="text-white font-medium">Último Login</p>
                <p className="text-gray-400 text-sm">
                  {new Date(profileStats.lastLogin).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </StandardCard>
      </div>

      {/* Segurança */}
      <StandardCard title="Segurança">
        {!showPasswordForm ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5" style={{ color: '#7fe41a' }} />
              <div>
                <p className="text-white font-medium">Senha</p>
                <p className="text-gray-400 text-sm">Altere sua senha regularmente para manter sua conta segura</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowPasswordForm(true)}
              variant="outline"
              style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
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
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleChangePassword}
                style={{ backgroundColor: '#7fe41a', color: '#000000' }}
                className="hover:opacity-90"
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