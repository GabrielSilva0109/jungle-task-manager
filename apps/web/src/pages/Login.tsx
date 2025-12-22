import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const { login, register, isLoading, isAuthenticated } = useAuthStore();
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data: LoginForm | RegisterForm) => {
    try {
      if (isRegister) {
        await register(data as RegisterForm);
        toast.success('Conta criada com sucesso!');
      } else {
        await login(data as LoginForm);
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Criar conta' : 'Entrar na sua conta'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...registerField('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            {isRegister && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário
                </label>
                <input
                  {...registerField('username')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...registerField('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Carregando...' : (isRegister ? 'Criar conta' : 'Entrar')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-500"
            >
              {isRegister ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}