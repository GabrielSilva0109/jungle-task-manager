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
    <div className="min-h-screen flex items-center justify-center bg-gray-900" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-md w-full space-y-8">
        <div 
          className="bg-black rounded-lg p-8 shadow-xl border"
          style={{ 
            borderColor: 'rgba(127, 228, 26, 0.3)',
            borderWidth: '1px'
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#7fe41a' }}>
              Jungle
            </h1>
            <h2 className="text-2xl font-bold text-white mb-2">
              Task Manager
            </h2>
            <p className="text-gray-400">
              {isRegister ? 'Criar sua conta' : 'Entre na sua conta'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  {...registerField('email')}
                  type="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
              
              {isRegister && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome de usuário
                  </label>
                  <input
                    {...registerField('username')}
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                    placeholder="seu nome"
                  />
                  {(errors as any).username && (
                    <p className="mt-2 text-sm text-red-400">{(errors as any).username.message}</p>
                  )}
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  {...registerField('password')}
                  type="password"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-black font-semibold rounded-md transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#7fe41a',
                }}
              >
                {isLoading ? 'Carregando...' : (isRegister ? 'Criar conta' : 'Entrar')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
                >
                  {isRegister ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}