import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';
import { login as apiLogin, register as apiRegister, logout as apiLogout, RegisterData, LoginResponse } from '../API/authApi';
import { setAuthToken } from '../API/apiClient';

interface ExtendedAuthState extends AuthState {
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  loginWithApi: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerWithApi: (data: RegisterData) => Promise<{ success: boolean; user?: User; error?: string }>;
}

export const useAuthStore = create<ExtendedAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      
      setToken: (token: string | null) => {
        set({ token });
        setAuthToken(token);
      },
      
      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
        }
      },
      
      loginWithApi: async (email: string, password: string) => {
        try {
          const response = await apiLogin({ email, password });
          
          // Map API response to User type
          const user: User = {
            id: String(response.id),
            name: response.name,
            email: response.email,
            role: response.role,
            skills: response.skills,
            company: response.company,
            avatar: response.avatar,
            bio: response.bio,
            location: response.location,
            phone: response.phone,
            website: response.website,
            experience: response.experience,
            education: response.education,
            linkedin: response.linkedin,
            github: response.github,
            portfolio: response.portfolio,
            companySize: response.company_size,
            industry: response.industry,
            founded: response.founded,
          };
          
          set({ user, token: response.token, isAuthenticated: true });
          setAuthToken(response.token);
          
          return { success: true, user };
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
          return { success: false, error: errorMessage };
        }
      },
      
      registerWithApi: async (data: RegisterData) => {
        try {
          const response = await apiRegister(data);
          
          if (response.user) {
            const user: User = {
              id: String(response.user.id),
              name: response.user.name,
              email: response.user.email,
              role: response.user.role as 'seeker' | 'employer',
            };
            
            set({ user, token: response.token, isAuthenticated: true });
            setAuthToken(response.token);
            
            return { success: true, user };
          }
          
          return { success: false, error: 'Registration failed. Please try again.' };
        } catch (error: any) {
          let errorMessage = 'Registration failed. Please try again.';
          if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData === 'object') {
              errorMessage = Object.values(errorData).flat().join('. ') || errorMessage;
            }
          }
          return { success: false, error: errorMessage };
        }
      },
      
      // Legacy login method for compatibility
      login: async (email: string, password: string) => {
        const result = await get().loginWithApi(email, password);
        return result.success;
      },
      
      logout: () => {
        apiLogout();
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
      onRehydrate: () => {
        return (state) => {
          // Restore token to axios headers on rehydration
          if (state?.token) {
            setAuthToken(state.token);
          }
        };
      }
    }
  )
);