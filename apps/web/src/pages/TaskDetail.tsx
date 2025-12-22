import { useQuery } from '@tanstack/react-query';
import { useParams, Navigate } from '@tanstack/react-router';
import { ArrowLeft, MessageCircle, Clock, User } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { tasksApi, commentsApi } from '../services/api';

export default function TaskDetail() {
  const { taskId } = useParams({ strict: false });
  const { isAuthenticated } = useAuthStore();

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getTask(taskId!),
    enabled: !!taskId && isAuthenticated,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentsApi.getComments(taskId!, { page: 1, size: 50 }),
    enabled: !!taskId && isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando tarefa...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Tarefa não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button className="mr-4 text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Tarefa</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="mt-1 text-gray-900">{task.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prazo</label>
                  <div className="mt-1 flex items-center text-gray-900">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(task.deadline).toLocaleDateString()}
                  </div>
                </div>
                
                {task.assignedUsers && task.assignedUsers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Atribuído a</label>
                    <div className="mt-1 space-y-1">
                      {task.assignedUsers.map((user) => (
                        <div key={user.id} className="flex items-center text-gray-900">
                          <User className="w-4 h-4 mr-2" />
                          {user.username} ({user.email})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comentários ({commentsData?.data.length || 0})
              </h3>
              
              {commentsLoading ? (
                <p className="text-gray-500">Carregando comentários...</p>
              ) : (
                <div className="space-y-4">
                  {commentsData?.data.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  
                  {commentsData?.data.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum comentário ainda.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Editar Tarefa
                </button>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Adicionar Comentário
                </button>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Excluir Tarefa
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Criado em:</span>
                  <br />
                  {new Date(task.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Atualizado em:</span>
                  <br />
                  {new Date(task.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}