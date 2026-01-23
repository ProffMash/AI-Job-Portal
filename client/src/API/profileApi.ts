import { API_BASE } from './apiClient';
// Utility to get the correct avatar URL (handles production and local)
export function getAvatarUrl(avatarPath?: string): string | undefined {
  if (!avatarPath) return undefined;
  if (avatarPath.startsWith('http')) return avatarPath;
  // Remove trailing slash from API_BASE if present, and remove '/api' if present
  let baseUrl = API_BASE.replace(/\/$/, '');
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  return `${baseUrl}${avatarPath}`;
}
import api, { cachedGet, invalidateCacheFor } from './apiClient';

export interface UserProfile {
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

export interface UpdateProfileData {
  name?: string;
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
}

// Get current user's profile by ID
export async function fetchProfile(userId: number | string): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`users/${userId}/`);
  return response.data;
}

// Update current user's profile by ID
export async function updateProfile(userId: number | string, data: UpdateProfileData): Promise<UserProfile> {
  const response = await api.patch<UserProfile>(`users/${userId}/`, data);
  invalidateCacheFor(`users/${userId}/`, undefined);
  return response.data;
}

// Get a user's public profile by ID
export async function fetchUserById(userId: number | string): Promise<UserProfile> {
  return await cachedGet<UserProfile>(`users/${userId}/`, undefined, 120);
}

// Get all job seekers
export async function fetchSeekers(): Promise<UserProfile[]> {
  return await cachedGet<UserProfile[]>('users/seekers/', undefined, 60);
}

// Get all employers
export async function fetchEmployers(): Promise<UserProfile[]> {
  return await cachedGet<UserProfile[]>('users/employers/', undefined, 60);
}

// Upload avatar image
export async function uploadAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.post<UserProfile>('profile/avatar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  invalidateCacheFor('users/me/', undefined);
  return response.data;
}

// Update user skills (for seekers)
export async function updateSkills(skills: string[]): Promise<UserProfile> {
  const response = await api.patch<UserProfile>('profile/skills/', { skills });
  invalidateCacheFor('users/me/', undefined);
  return response.data;
}

// Update company info (for employers)
export async function updateCompanyInfo(data: {
  company?: string;
  company_size?: string;
  industry?: string;
  founded?: string;
  website?: string;
}): Promise<UserProfile> {
  const response = await api.patch<UserProfile>('profile/company/', data);
  invalidateCacheFor('users/me/', undefined);
  return response.data;
}
