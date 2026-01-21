import { create } from 'zustand';
import {
  fetchSavedCandidates,
  saveCandidate,
  removeSavedCandidate,
  updateCandidateNotes,
  SavedCandidateResponse,
} from '../API/savedCandidatesApi';

export interface SavedCandidate {
  id: number;
  name: string;
  title: string;
  location: string;
  avatar: string;
  skills: string[];
  experience: string;
  education: string;
  matchScore: number;
  savedAt: string;
  email: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  phone?: string;
  notes?: string;
  appliedFor?: string;
}

interface SavedCandidatesState {
  savedCandidates: SavedCandidate[];
  isLoading: boolean;
  error: string | null;
  fetchCandidates: () => Promise<void>;
  addCandidate: (candidate: Omit<SavedCandidate, 'savedAt' | 'notes' | 'appliedFor'>) => Promise<void>;
  removeCandidate: (id: number) => Promise<void>;
  isShortlisted: (id: number) => boolean;
  updateNotes: (id: number, notes: string) => Promise<void>;
}

// Transform API response to frontend format
const transformCandidate = (response: SavedCandidateResponse): SavedCandidate => {
  const details = response.candidate_details;
  return {
    id: details.id,
    name: details.name || details.username,
    title: details.experience || 'Job Seeker',
    location: details.location || 'Not specified',
    avatar: details.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(details.name || details.username)}&background=f59e0b&color=fff`,
    skills: details.skills || [],
    experience: details.experience || 'Not specified',
    education: details.education || 'Not specified',
    matchScore: response.match_score,
    savedAt: response.saved_at,
    email: details.email,
    bio: details.bio || undefined,
    linkedin: details.linkedin || undefined,
    github: details.github || undefined,
    portfolio: details.portfolio || undefined,
    phone: details.phone || undefined,
    notes: response.notes || undefined,
    appliedFor: response.applied_for || undefined,
  };
};

export const useSavedCandidatesStore = create<SavedCandidatesState>()((set, get) => ({
  savedCandidates: [],
  isLoading: false,
  error: null,

  fetchCandidates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchSavedCandidates();
      const candidates = response.map(transformCandidate);
      set({ savedCandidates: candidates, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch saved candidates:', error);
      set({ error: 'Failed to load saved candidates', isLoading: false });
    }
  },

  addCandidate: async (candidate) => {
    const { savedCandidates } = get();
    // Check if already saved locally
    if (savedCandidates.some((c) => c.id === candidate.id)) {
      return;
    }

    try {
      const response = await saveCandidate({
        candidate_id: candidate.id,
        match_score: candidate.matchScore,
      });
      const newCandidate = transformCandidate(response);
      set({ savedCandidates: [newCandidate, ...savedCandidates] });
    } catch (error) {
      console.error('Failed to save candidate:', error);
      throw error;
    }
  },

  removeCandidate: async (id) => {
    const { savedCandidates } = get();
    // Optimistically remove from UI
    set({ savedCandidates: savedCandidates.filter((c) => c.id !== id) });

    try {
      await removeSavedCandidate(id);
    } catch (error) {
      console.error('Failed to remove candidate:', error);
      // Revert on error
      set({ savedCandidates });
      throw error;
    }
  },

  isShortlisted: (id) => {
    return get().savedCandidates.some((c) => c.id === id);
  },

  updateNotes: async (id, notes) => {
    const { savedCandidates } = get();
    try {
      await updateCandidateNotes(id, notes);
      set({
        savedCandidates: savedCandidates.map((c) =>
          c.id === id ? { ...c, notes } : c
        ),
      });
    } catch (error) {
      console.error('Failed to update notes:', error);
      throw error;
    }
  },
}));
