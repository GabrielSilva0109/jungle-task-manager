import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import StandardCard from '../components/ui/StandardCard';
import { Trophy, Medal, Award } from 'lucide-react';
import { statsApi } from '../services/api';

export default function Home() {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [usersRanking, setUsersRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [dashboardData, userData, rankingData] = await Promise.all([
        statsApi.getDashboardStats(),
        statsApi.getUserStats(),
        statsApi.getUsersRanking()
      ]);
      setDashboardStats(dashboardData);
      setUserStats(userData);
      setUsersRanking(rankingData);
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Ranking de usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StandardCard 
          title="🏆 Ranking de Produtividade" 
          description="Usuários que mais concluíram tarefas"
          
        >
          <div className="space-y-4">
            {usersRanking?.length > 0 ? (
              usersRanking.map((user: any, index: number) => {
                const getRankIcon = () => {
                  switch(index) {
                    case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
                    case 1: return <Medal className="w-5 h-5 text-gray-400" />;
                    case 2: return <Award className="w-5 h-5 text-orange-500" />;
                    default: return <span className="w-5 h-5 flex items-center justify-center text-gray-400 text-sm font-bold">{index + 1}º</span>;
                  }
                };

                const getRankColor = () => {
                  switch(index) {
                    case 0: return '#fbbf24'; // gold
                    case 1: return '#9ca3af'; // silver
                    case 2: return '#fb923c'; // bronze
                    default: return '#6b7280'; // gray
                  }
                };

                return (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(127, 228, 26, 0.05)' }}>
                    <div className="flex items-center space-x-3">
                      {getRankIcon()}
                      <div>
                        <h4 className="text-white font-medium">{user.username}</h4>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">{user.completedTasks}</div>
                      <div className="text-gray-400 text-sm">tarefas concluídas</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma tarefa concluída ainda</p>
                <p className="text-gray-500 text-sm mt-1">Complete algumas tarefas para aparecer no ranking!</p>
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
            <p className="text-gray-400">Nenhuma atividade recente</p>
            <p className="text-gray-500 text-sm mt-1">Crie ou atualize tarefas para ver a atividade aqui!</p>
                </div>
              )}
            </div>
        </StandardCard>
      </div>
    </div>
  );
}