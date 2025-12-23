import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import StandardCard from '../components/ui/StandardCard';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { tasksApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pendente' | 'Em Progresso' | 'Concluída' | 'Cancelada';
  priority: 'Baixa' | 'Média' | 'Alta';
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
}
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pendente' | 'Em Progresso' | 'Concluída' | 'Cancelada';
  priority: 'Baixa' | 'Média' | 'Alta';
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
}

export default function Tarefas() {
  const { user, tokens, isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const { state } = JSON.parse(authData);
      } else {
        console.log('❌ No auth data found');
      }
      
      const response = await tasksApi.getTasks({ page: 1, size: 100 });
      setTasks(response.data.map(task => {
        let status: 'Pendente' | 'Em Progresso' | 'Concluída' | 'Cancelada';
        if (task.status === 'TODO') {
          status = 'Pendente';
        } else if (task.status === 'IN_PROGRESS') {
          status = 'Em Progresso';
        } else if (task.status === 'DONE') {
          status = 'Concluída';
        } else {
          status = 'Cancelada';
        }

        let priority: 'Baixa' | 'Média' | 'Alta';
        if (task.priority === 'LOW') {
          priority = 'Baixa';
        } else if (task.priority === 'MEDIUM') {
          priority = 'Média';
        } else {
          priority = 'Alta';
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status,
          priority,
          assignedTo: 'Admin',
          createdAt: task.createdAt.toString(),
        };
      }));
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateTask = async () => {
    if (newTask.title.trim()) {
      try {
        const taskData = {
          title: newTask.title,
          description: newTask.description,
          priority: (newTask.priority === 'Baixa' ? TaskPriority.LOW :
                   newTask.priority === 'Média' ? TaskPriority.MEDIUM : TaskPriority.HIGH),
          deadline: newTask.dueDate || '2024-12-31T23:59:59.000Z'
        };

        console.log('📋 Creating task:', taskData);
        console.log('🏪 Auth Store - User:', user);
        console.log('🏪 Auth Store - Tokens:', tokens);
        console.log('🏪 Auth Store - isAuthenticated:', isAuthenticated);
        
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const { state } = JSON.parse(authData);
          console.log('👤 Current user ID from localStorage:', state.user?.id);
          console.log('👤 User data:', state.user);
          console.log('🔑 Tokens from localStorage:', state.tokens);
        } else {
          console.log('❌ No auth data found in localStorage');
        }
        
        await tasksApi.createTask(taskData);
        await loadTasks(); // Recarregar tarefas
        setNewTask({ title: '', description: '', priority: 'Média', dueDate: '' });
        setShowCreateForm(false);
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateTask = async () => {
    if (editingTask && newTask.title.trim()) {
      try {
        const taskData = {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority === 'Baixa' ? TaskPriority.LOW :
                   newTask.priority === 'Média' ? TaskPriority.MEDIUM : TaskPriority.HIGH,
          deadline: newTask.dueDate || '2024-12-31T23:59:59.000Z'
        };
        
        await tasksApi.updateTask(editingTask.id, taskData);
        await loadTasks(); // Recarregar tarefas
        setNewTask({ title: '', description: '', priority: 'Média', dueDate: '' });
        setEditingTask(null);
        setShowEditForm(false);
      } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'Pendente' | 'Em Progresso' | 'Concluída') => {
    try {
      const statusMapping: Record<'Pendente' | 'Em Progresso' | 'Concluída', TaskStatus> = {
        'Pendente': TaskStatus.TODO,
        'Em Progresso': TaskStatus.IN_PROGRESS,
        'Concluída': TaskStatus.DONE
      };
      
      await tasksApi.updateTask(taskId, { status: statusMapping[newStatus] as TaskStatus });
      await loadTasks(); // Recarregar tarefas
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await tasksApi.deleteTask(taskId);
        await loadTasks(); // Recarregar tarefas
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
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

      {/* Formulário de edição de tarefa */}
      {showEditForm && editingTask && (
        <StandardCard 
          title="Editar Tarefa" 
          description="Modifique as informações da tarefa"
        >
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
                onClick={handleUpdateTask}
                style={{ backgroundColor: '#7fe41a', color: '#000000' }}
                className="hover:opacity-90"
              >
                Salvar Alterações
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', priority: 'Média', dueDate: '' });
                }}
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
              
              <div className="flex items-center space-x-2">
                {/* Botão para mudar status */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as 'Pendente' | 'Em Progresso' | 'Concluída')}
                  className="bg-gray-800 border-gray-700 text-white rounded px-2 py-1 text-sm"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Progresso">Em Progresso</option>
                  <option value="Concluída">Concluída</option>
                </select>
                
                {/* Botão de editar */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                  onClick={() => handleEditTask(task)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                {/* Botão de excluir */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
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