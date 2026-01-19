import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'seeker',
    skills: ['React', 'TypeScript', 'Node.js', 'Python'],
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    bio: 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Love working with modern technologies and solving complex problems.',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    experience: '5+ years',
    education: 'BS Computer Science, Stanford University',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    role: 'employer',
    company: 'TechCorp Inc.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    bio: 'HR Director at TechCorp Inc. with over 8 years of experience in talent acquisition and team building. Passionate about connecting great talent with amazing opportunities.',
    location: 'New York, NY',
    phone: '+1 (555) 987-6543',
    website: 'https://techcorp.com',
    companySize: '500-1000 employees',
    industry: 'Technology',
    founded: '2015'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    role: 'seeker',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    bio: 'Backend engineer specializing in Java and cloud technologies. Experienced in building microservices and distributed systems.',
    location: 'Austin, TX',
    phone: '+1 (555) 456-7890',
    experience: '3+ years',
    education: 'MS Software Engineering, UT Austin',
    linkedin: 'https://linkedin.com/in/mikewilson',
    github: 'https://github.com/mikewilson'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
          // Update the mock user in the array for persistence
          const userIndex = mockUsers.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser;
          }
        }
      },
      login: async (email: string, password: string) => {
        // Mock authentication - in real app, this would call an API
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'password') {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);