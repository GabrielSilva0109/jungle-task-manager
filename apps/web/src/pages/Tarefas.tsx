import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import StandardCard from '../components/ui/StandardCard';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Pendente' | 'Em Progresso' | 'Concluída' | 'Cancelada';
  priority: 'Baixa' | 'Média' | 'Alta';
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
}

export default function Tarefas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: 'Baixa' | 'Média' | 'Alta';
    dueDate: string;
  }>({
    title: '',
    description: '',
    priority: 'Média',
    dueDate: ''
  });

  // Mock data das tarefas
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Implementar autenticação',
      description: 'Criar sistema de login e registro de usuários',
      status: 'Em Progresso',
      priority: 'Alta',
      assignedTo: 'Admin',
      createdAt: '2024-01-15',
      dueDate: '2024-01-20'
    },
    {
      id: 2,
      title: 'Corrigir bug do dashboard',
      description: 'Resolver problema de infinite loop nas notificações',
      status: 'Concluída',
      priority: 'Alta',
      assignedTo: 'Admin',
      createdAt: '2024-01-14'
    },
    {
      id: 3,
      title: 'Revisar código do frontend',
      description: 'Análise de código e otimizações',
      status: 'Pendente',
      priority: 'Média',
      assignedTo: 'Admin',
      createdAt: '2024-01-13',
      dueDate: '2024-01-25'
    },
    {
      id: 4,
      title: 'Documentar API',
      description: 'Criar documentação completa da API REST',
      status: 'Pendente',
      priority: 'Baixa',
      assignedTo: 'Admin',
      createdAt: '2024-01-12'
    }
  ]);

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      'Pendente': '#fbbf24',
      'Em Progresso': '#7fe41a',
      'Concluída': '#10b981',
      'Cancelada': '#ef4444'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      'Baixa': '#6b7280',
      'Média': '#f59e0b',
      'Alta': '#ef4444'
    };
    return colors[priority];
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: tasks.length + 1,
        title: newTask.title,
        description: newTask.description,
        status: 'Pendente',
        priority: newTask.priority,
        assignedTo: 'Admin',
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: newTask.dueDate || undefined
      };
      
      setTasks([task, ...tasks]);
      setNewTask({ title: '', description: '', priority: 'Média', dueDate: '' });
      setShowCreateForm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tarefas</h1>
          <p className="text-gray-400">Gerencie todas as suas tarefas</p>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ backgroundColor: '#7fe41a', color: '#000000' }}
          className="hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (
        <StandardCard title="Criar Nova Tarefa" className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Título</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Digite o título da tarefa..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Descrição</label>
              <Textarea
                value={newTask.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Descreva a tarefa..."
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Prioridade</label>
                <select
                  value={newTask.priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTask({ ...newTask, priority: e.target.value as 'Baixa' | 'Média' | 'Alta' })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Data de Entrega</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleCreateTask}
                style={{ backgroundColor: '#7fe41a', color: '#000000' }}
                className="hover:opacity-90"
              >
                Criar Tarefa
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </StandardCard>
      )}

      {/* Filtros e busca */}
      <StandardCard>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tarefas..."
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" style={{ borderColor: 'rgba(127, 228, 26, 0.3)', color: '#7fe41a' }}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </StandardCard>

      {/* Lista de tarefas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <StandardCard key={task.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </Badge>
                  <Badge 
                    variant="outline"
                    style={{ borderColor: getPriorityColor(task.priority), color: getPriorityColor(task.priority) }}
                  >
                    {task.priority}
                  </Badge>
                </div>
                
                <p className="text-gray-400 mb-4">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Atribuído a: {task.assignedTo}</span>
                  <span>Criado em: {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
                  {task.dueDate && (
                    <span>Entrega: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </StandardCard>
        ))}
        
        {filteredTasks.length === 0 && (
          <StandardCard>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira tarefa para começar'}
              </p>
            </div>
          </StandardCard>
        )}
      </div>
    </div>
  );
}