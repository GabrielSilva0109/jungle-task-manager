import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../services/api';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: loginStore, register: registerStore } = useAuthStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      await loginStore(data);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      await registerStore({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      navigate({ to: '/' });
    } catch (err: any) {
        console.log('err', err);
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Jungle Task Manager
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </Label>
                <Input
                  {...loginForm.register('email')}
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </Label>
                <Input
                  {...loginForm.register('password')}
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div>
                <Label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </Label>
                <Input
                  {...registerForm.register('email')}
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </Label>
                <Input
                  {...registerForm.register('username')}
                  id="register-username"
                  type="text"
                  placeholder="seuusername"
                  disabled={isLoading}
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </Label>
                <Input
                  {...registerForm.register('password')}
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </Label>
                <Input
                  {...registerForm.register('confirmPassword')}
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          )}
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 text-sm"
              disabled={isLoading}
            >
              {isLogin 
                ? 'Não tem conta? Cadastre-se' 
                : 'Já tem conta? Faça login'
              }
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-xs text-gray-600">
              💡 Sistema integrado com JWT e backend real
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Status: ✅ Auth Service • ✅ API Gateway • ✅ Database
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}