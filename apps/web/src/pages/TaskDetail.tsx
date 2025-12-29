import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Navigate, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageCircle, Clock, User, Edit, Trash2, Send, X, AlertTriangle, Save } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { tasksApi, commentsApi, authApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

export default function TaskDetail() {
  const { taskId } = useParams({ strict: false });
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: '',
    status: ''
  });

    // Audit log
  const { data: auditLog, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-log', taskId],
    queryFn: () => tasksApi.getAuditLog(taskId!),
    enabled: !!taskId && isAuthenticated,
  });

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

  const creatorId =
    typeof task?.createdBy === 'object'
      ? task?.createdBy?.id
      : typeof task?.createdBy === 'string'
      ? task?.createdBy
      : undefined;

  const { data: taskCreator } = useQuery({
    queryKey: ['user', creatorId],
    queryFn: () => authApi.getUser(creatorId!),
    enabled: !!creatorId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.createComment(taskId!, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setNewComment('');
    },
    onError: (error) => {
      console.error('Erro ao adicionar comentário:', error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.updateTask(taskId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['audit-log', taskId] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar tarefa:', error);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
    onError: (error) => {
      console.error('Erro ao excluir comentário:', error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(taskId!),
    onSuccess: () => {
      navigate({ to: '/' });
    },
    onError: (error) => {
      console.error('Erro ao excluir tarefa:', error);
    },
  });

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsAddingComment(true);
    try {
      await addCommentMutation.mutateAsync(newComment.trim());
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
    setIsAddingComment(false);
  };


  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate();
    setShowDeleteModal(false);
  };

  const handleEditTask = () => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateTaskMutation.mutate({
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority.toUpperCase(),
      status: editForm.status.toUpperCase()
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'todo': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (taskLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2a2627' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-300">Carregando tarefa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2a2627' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-300 text-xl">Tarefa não encontrada.</p>
            <Button 
              onClick={handleBack}
              className="mt-4"
              style={{ backgroundColor: '#7fe41a', color: '#0b0809' }}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2a2627' }}>
      {/* Header */}
      <header 
        className="shadow-lg"
        style={{
          backgroundColor: 'rgba(11, 8, 9, 0.8)',
          borderBottom: '1px solid rgba(127, 228, 26, 0.2)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button 
              onClick={handleBack}
              className="mr-4 text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Detalhes da Tarefa</h2>
                <div>
                  {!isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleEditTask}
                      className="text-gray-400"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:bg-red-400 hover:text-white"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {isEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">EM PROGRESSO</option>
                        <option value="DONE">CONCLUÍDA</option>
                        <option value="CANCELLED">CANCELADA</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Prioridade</label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="LOW">BAIXA</option>
                        <option value="MEDIUM">MÉDIA</option>
                        <option value="HIGH">ALTA</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSaveEdit}
                      disabled={updateTaskMutation.isPending}
                      style={{ backgroundColor: '#7fe41a', color: '#0b0809' }}
                      className="hover:bg-green-400"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="text-black border-gray-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                    <p className="text-gray-100 bg-gray-700 p-4 rounded-lg">{task.description || 'Nenhuma descrição fornecida.'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <Badge className={`${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Prioridade</label>
                      <Badge className={`${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prazo</label>
                    <div className="flex items-center text-gray-100 bg-gray-700 p-3 rounded-lg">
                      <Clock className="w-4 h-4 mr-2" />
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR') : 'Sem prazo definido'}
                    </div>
                  </div>
                  
                  {task.assignedUsers && task.assignedUsers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Atribuído a</label>
                      <div className="space-y-2">
                        {task.assignedUsers.map((assignedUser) => (
                          <div key={assignedUser.id} className="flex items-center text-gray-100 bg-gray-700 p-3 rounded-lg">
                            <User className="w-4 h-4 mr-2" />
                            {assignedUser.username} ({assignedUser.email})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="mt-6 bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comentários ({commentsData?.data.length || 0})
              </h3>
              
              {/* Add comment form */}
              <div className="mb-6 space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar um comentário..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    style={{ backgroundColor: '#7fe41a', color: '#0b0809' }}
                    className="hover:bg-green-400"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isAddingComment ? 'Enviando...' : 'Comentar'}
                  </Button>
                </div>
              </div>
              
              {commentsLoading ? (
                <p className="text-gray-400">Carregando comentários...</p>
              ) : (
                <div className="space-y-4">
                  {commentsData?.data.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-green-500 pl-4 bg-gray-700 p-4 rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {comment.author?.username || 'Usuário Desconhecido'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString('pt-BR')}
                          </span>
                          {comment.author?.id === user?.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Excluir comentário"
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-200">{comment.content}</p>
                    </div>
                  ))}
                  
                  {commentsData?.data.length === 0 && (
                    <p className="text-gray-400 text-center py-8 bg-gray-700 rounded-lg">
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-300 block">Criado em:</span>
                  <span className="text-gray-100">
                    {new Date(task.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-300 block">Atualizado em:</span>
                  <span className="text-gray-100">
                    {new Date(task.updatedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-300 block">Criado por:</span>
                  <span className="text-gray-100">
                    {taskCreator?.username ? taskCreator.username : (task.createdBy || 'Usuário desconhecido')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log (apenas para admin) */}
        {isAdmin && (
          <div className="mt-6 bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Histórico de Alterações
              </h3>
              {auditLoading ? (
                <p className="text-gray-400">Carregando histórico...</p>
              ) : auditLog && auditLog.length > 0 ? (
                <div className="space-y-4">
                  {auditLog.map((log) => {
                    const isExpanded = expandedLogs[log.id];
                    return (
                      <div
                        key={log.id}
                        className={`border-l-4 border-yellow-500 pl-4 bg-gray-700 p-4 rounded-r-lg transition-all duration-200 cursor-pointer`}
                        style={{ maxHeight: isExpanded ? '1000px' : '200px', overflow: isExpanded ? 'visible' : 'hidden' }}
                        onClick={() => setExpandedLogs((prev) => ({ ...prev, [log.id]: !isExpanded }))}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-300">
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-400">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : ''}
                          </span>
                        </div>
                        <pre className="text-gray-200 text-xs whitespace-pre-wrap break-all">
                          {log.oldValue && log.newValue
                            ? `De: ${JSON.stringify(log.oldValue, null, 2)}\nPara: ${JSON.stringify(log.newValue, null, 2)}`
                            : log.oldValue
                            ? `Antes: ${JSON.stringify(log.oldValue, null, 2)}`
                            : log.newValue
                            ? `Depois: ${JSON.stringify(log.newValue, null, 2)}`
                            : ''}
                        </pre>
                        {!isExpanded && (
                          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t to-transparent flex items-end justify-center pointer-events-none">
                            <span className="text-xs text-yellow-200 bg-gray-700 px-2 rounded pointer-events-auto">Clique para expandir</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8 bg-gray-700 rounded-lg">
                  Nenhuma alteração registrada para esta tarefa.
                </p>
              )}
          </div>
        )}
      </main>

      {/* Delete Task Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium text-white">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir a tarefa "<span className="font-medium text-white">{task?.title}</span>"? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="text-black border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteTask}
                disabled={deleteTaskMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteTaskMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      {showDeleteCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium text-white">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDeleteComment}
                className="text-black border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteComment}
                disabled={deleteCommentMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteCommentMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}