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
  initializeAuth: () => void;
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
            id: response.id,
            email: response.email,
            username: response.username,
            name: response.name,
            role: response.role,
            avatar: response.avatar,
            bio: response.bio,
            location: response.location,
            phone: response.phone,
            website: response.website,
            skills: response.skills,
            experience: response.experience,
            education: response.education,
            linkedin: response.linkedin,
            github: response.github,
            portfolio: response.portfolio,
            company: response.company,
            companySize: response.company_size,
            industry: response.industry,
            founded: response.founded,
            isActive: response.is_active,
            createdAt: response.created_at,
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
              id: response.user.id,
              email: response.user.email,
              username: response.user.username || response.user.email.split('@')[0],
              name: response.user.name,
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
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      initializeAuth: () => {
        const { token } = get();
        if (token) {
          setAuthToken(token);
        }
      }
    }),
    {
      name: 'auth-storage',
      onRehydrate: (state) => {
        // Called after rehydration - restore token to axios headers
        return (rehydratedState, error) => {
          if (!error && rehydratedState?.token) {
            setAuthToken(rehydratedState.token);
          }
        };
      }
    }
  )
);

// Initialize auth token from persisted state on module load
// This ensures the token is set even before React components mount
const initialState = useAuthStore.getState();
if (initialState.token) {
  setAuthToken(initialState.token);
}