import React from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import StandardCard from '../components/ui/StandardCard';

export default function Home() {
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
            <div className="text-2xl font-bold text-white mb-2">12</div>
            <div className="text-sm text-gray-400">Tarefas Ativas</div>
          </div>
        </StandardCard>

        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">8</div>
            <div className="text-sm text-gray-400">Concluídas</div>
          </div>
        </StandardCard>

        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">3</div>
            <div className="text-sm text-gray-400">Usuários Ativos</div>
          </div>
        </StandardCard>

        <StandardCard>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-white mb-2">24h</div>
            <div className="text-sm text-gray-400">Última Atividade</div>
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
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(127, 228, 26, 0.05)' }}>
              <div>
                <h4 className="text-white font-medium">Implementar autenticação</h4>
                <p className="text-gray-400 text-sm">Criado há 2 horas</p>
              </div>
              <Badge variant="secondary" style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)', color: '#7fe41a' }}>
                Em Progresso
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(127, 228, 26, 0.05)' }}>
              <div>
                <h4 className="text-white font-medium">Corrigir bug do dashboard</h4>
                <p className="text-gray-400 text-sm">Criado há 5 horas</p>
              </div>
              <Badge variant="secondary" style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)', color: '#7fe41a' }}>
                Concluída
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(127, 228, 26, 0.05)' }}>
              <div>
                <h4 className="text-white font-medium">Revisar código do frontend</h4>
                <p className="text-gray-400 text-sm">Criado ontem</p>
              </div>
              <Badge variant="secondary" style={{ backgroundColor: 'rgba(127, 228, 26, 0.2)', color: '#7fe41a' }}>
                Pendente
              </Badge>
            </div>
          </div>
        </StandardCard>

        {/* Atividade recente */}
        <StandardCard 
          title="Atividade Recente"
          description="Últimas ações dos usuários"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7fe41a' }}></div>
              <div>
                <p className="text-white text-sm">Usuário admin criou uma nova tarefa</p>
                <p className="text-gray-400 text-xs">2 horas atrás</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7fe41a' }}></div>
              <div>
                <p className="text-white text-sm">Tarefa "Bug fix" foi concluída</p>
                <p className="text-gray-400 text-xs">5 horas atrás</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7fe41a' }}></div>
              <div>
                <p className="text-white text-sm">Novo usuário se registrou</p>
                <p className="text-gray-400 text-xs">1 dia atrás</p>
              </div>
            </div>
          </div>
        </StandardCard>
      </div>
    </div>
  );
}