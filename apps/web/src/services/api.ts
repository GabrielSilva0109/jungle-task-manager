import axios from 'axios';
import {
  AuthResponse,
  AuthTokens,
  LoginDto,
  RegisterDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  PaginatedResponse,
  PaginationDto,
  Comment,
  CreateCommentDto,
  Notification,
} from '@jungle/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentar timeout para 30 segundos
});

// Request interceptor to add auth token and user ID
api.interceptors.request.use((config) => {
  // Get token from auth storage
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      
      // Add auth token if available
      if (state.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
      } else {
        console.log('❌ No access token found in auth storage');
      }
      
      // Add user ID if available
      if (state.user?.id) {
        config.headers['x-user-id'] = state.user.id;
      } else {
        console.log('❌ No user ID found in auth state');
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
  } else {
    console.log('❌ No auth data found in localStorage');
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const { state } = JSON.parse(authData);
        if (state.tokens?.refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: state.tokens.refreshToken,
            });
            const newTokens = response.data;
            
            // Update stored tokens
            const newState = {
              ...state,
              tokens: newTokens,
            };
            localStorage.setItem('auth-storage', JSON.stringify({ state: newState }));
            
            // Retry original request
            error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api.request(error.config);
          } catch (refreshError) {
            // Refresh failed, logout
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (data: LoginDto): Promise<AuthResponse> =>
    api.post('/auth/login', data).then(res => res.data),
  register: (data: RegisterDto): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
  logout: (): Promise<void> =>
    api.post('/auth/logout').then(() => undefined),
  refresh: (refreshToken: string): Promise<AuthTokens> =>
    api.post('/auth/refresh', { refreshToken }).then(res => res.data),
  getUsers: (): Promise<any[]> =>
    api.get('/auth/users').then(res => res.data),
  updateUser: (id: string, data: { role?: string; isActive?: boolean }): Promise<any> =>
    api.patch(`/auth/users/${id}`, data).then(res => res.data),
  deleteUser: (id: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/auth/users/${id}`).then(res => res.data),
};

// Tasks API
export const tasksApi = {
  getTasks: (params: PaginationDto & { search?: string; status?: string; assigned?: boolean }): Promise<PaginatedResponse<Task>> =>
    api.get('/tasks', { params }).then(res => res.data),
  getTask: (id: string): Promise<Task> =>
    api.get(`/tasks/${id}`).then(res => res.data),
  createTask: (data: CreateTaskDto): Promise<Task> =>
    api.post('/tasks', data).then(res => res.data),
  updateTask: (id: string, data: UpdateTaskDto): Promise<Task> =>
    api.patch(`/tasks/${id}`, data).then(res => res.data),
  deleteTask: (id: string): Promise<void> =>
    api.delete(`/tasks/${id}`).then(() => undefined),
};

// Comments API
export const commentsApi = {
  getComments: (taskId: string, params: PaginationDto): Promise<PaginatedResponse<Comment>> =>
    api.get(`/tasks/${taskId}/comments`, { params }).then(res => res.data),
  createComment: (taskId: string, data: CreateCommentDto): Promise<Comment> =>
    api.post(`/tasks/${taskId}/comments`, data).then(res => res.data),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params: PaginationDto): Promise<PaginatedResponse<Notification>> =>
    api.get('/notifications', { params }).then(res => res.data),
  markAsRead: (id: string): Promise<void> =>
    api.patch(`/notifications/${id}/read`).then(() => undefined),
  markAllAsRead: (): Promise<void> =>
    api.patch('/notifications/read-all').then(() => undefined),
};

// Stats API
export const statsApi = {
  getDashboardStats: (): Promise<any> =>
    api.get('/stats/dashboard').then(res => res.data),
  getUserStats: (): Promise<any> =>
    api.get('/stats/users').then(res => res.data),
  getUsersRanking: (): Promise<any> =>
    api.get('/stats/users-ranking').then(res => res.data),
};

export default api;