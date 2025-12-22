import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import StandardCard from '../components/ui/StandardCard';
import { statsApi } from '../services/api';

export default function Home() {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [dashboardData, userData] = await Promise.all([
        statsApi.getDashboardStats(),
        statsApi.getUserStats()
      ]);
      setDashboardStats(dashboardData);
      setUserStats(userData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Carregando informações...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header da página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do seu Jungle Task Manager</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">{dashboardStats?.activeTasks || 0}</div>
            <div className="text-sm text-gray-400">Tarefas Ativas</div>
          </div>
        </StandardCard>

        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">{dashboardStats?.completedTasks || 0}</div>
            <div className="text-sm text-gray-400">Concluídas</div>
          </div>
        </StandardCard>

        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">{userStats?.totalUsers || 0}</div>
            <div className="text-sm text-gray-400">Usuários Totais</div>
          </div>
        </StandardCard>

        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">{dashboardStats?.lastSync ? 'Online' : 'Offline'}</div>
            <div className="text-sm text-gray-400">Status do Sistema</div>
          </div>
        </StandardCard>
      </div>

      {/* Tarefas recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StandardCard 
          title="Tarefas Recentes" 
          description="Últimas tarefas criadas ou modificadas"
          headerAction={
            <Button 
              variant="outline" 
              size="sm"
              style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
            >
              Ver Todas
            </Button>
          }
        >
          <div className="space-y-4">
            {dashboardStats?.recentTasks?.length > 0 ? (
              dashboardStats.recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(127, 228, 26, 0.05)' }}>
                  <div>
                    <h4 className="text-white font-medium">{task.title}</h4>
                    <p className="text-gray-400 text-sm">Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Badge variant="secondary" style={{ 
                    backgroundColor: task.status === 'DONE' ? 'rgba(16, 185, 129, 0.2)' : 
                                   task.status === 'IN_PROGRESS' ? 'rgba(127, 228, 26, 0.2)' : 
                                   'rgba(156, 163, 175, 0.2)', 
                    color: task.status === 'DONE' ? '#10b981' : 
                          task.status === 'IN_PROGRESS' ? '#7fe41a' : 
                          '#9ca3af' 
                  }}>
                    {task.status === 'DONE' ? 'Concluída' : 
                     task.status === 'IN_PROGRESS' ? 'Em Progresso' : 
                     'Pendente'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma tarefa recente encontrada</p>
              </div>
            )}
          </div>
        </StandardCard>

        {/* Atividade recente */}
        <StandardCard 
          title="Atividade Recente"
          description="Últimas ações dos usuários"
        >
          <div className="space-y-4">
            {dashboardStats?.recentActivity?.length > 0 ? (
              dashboardStats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7fe41a' }}></div>
                  <div>
                    <p className="text-white text-sm">{activity.description}</p>
                    <p className="text-gray-400 text-xs">{new Date(activity.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </StandardCard>
      </div>
    </div>
  );
}