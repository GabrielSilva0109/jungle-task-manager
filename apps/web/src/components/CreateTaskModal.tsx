import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const createTaskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  deadline: z.string().min(1, 'Data limite é obrigatória'),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskForm) => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      deadline: '',
    },
  });

  const handleSubmit = async (data: CreateTaskForm) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nova Tarefa</CardTitle>
          <CardDescription>
            Preencha as informações da nova tarefa
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </Label>
              <Input
                {...form.register('title')}
                id="title"
                placeholder="Digite o título da tarefa"
                disabled={isLoading}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </Label>
              <textarea
                {...form.register('description')}
                id="description"
                rows={3}
                placeholder="Descreva a tarefa em detalhes"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </Label>
              <select
                {...form.register('priority')}
                id="priority"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
              {form.formState.errors.priority && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Data Limite
              </Label>
              <Input
                {...form.register('deadline')}
                id="deadline"
                type="date"
                disabled={isLoading}
              />
              {form.formState.errors.deadline && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.deadline.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}