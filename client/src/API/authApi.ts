import api from './apiClient';
import { setAuthToken } from './apiClient';

// Backend User response type (snake_case)
export interface UserResponse {
  id: number;
  email: string;
  username: string;
  name: string;
  role: 'seeker' | 'employer';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  company?: string;
  company_size?: string;
  industry?: string;
  founded?: string;
  is_active: boolean;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  username?: string;
  role?: 'seeker' | 'employer';
  phone?: string;
  location?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user?: {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
  };
}

export interface LoginResponse extends UserResponse {
  message: string;
  token: string;
}

// Register a new user
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('auth/register/', data);
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
}

// Login user
export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('auth/login/', data);
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
}

// Logout user
export function logout(): void {
  setAuthToken(null);
}

// Get current user profile
export async function fetchCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>('users/me/');
  return response.data;
}

// Update current user profile
export async function updateProfile(data: Partial<UserResponse>): Promise<UserResponse> {
  const response = await api.patch<UserResponse>('users/me/', data);
  return response.data;
}

// Get all seekers
export async function fetchSeekers(): Promise<UserResponse[]> {
  const response = await api.get<UserResponse[]>('users/seekers/');
  return response.data;
}

// Get all employers
export async function fetchEmployers(): Promise<UserResponse[]> {
  const response = await api.get<UserResponse[]>('users/employers/');
  return response.data;
}
