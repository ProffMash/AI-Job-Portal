import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addCandidate: (candidate: Omit<SavedCandidate, 'savedAt' | 'notes' | 'appliedFor'>) => void;
  removeCandidate: (id: number) => void;
  isShortlisted: (id: number) => boolean;
  updateNotes: (id: number, notes: string) => void;
  updateAppliedFor: (id: number, appliedFor: string) => void;
}

export const useSavedCandidatesStore = create<SavedCandidatesState>()(
  persist(
    (set, get) => ({
      savedCandidates: [],

      addCandidate: (candidate) => {
        const { savedCandidates } = get();
        // Check if already saved
        if (savedCandidates.some(c => c.id === candidate.id)) {
          return;
        }
        
        const newCandidate: SavedCandidate = {
          ...candidate,
          savedAt: new Date().toISOString(),
        };
        
        set({ savedCandidates: [newCandidate, ...savedCandidates] });
      },

      removeCandidate: (id) => {
        set(state => ({
          savedCandidates: state.savedCandidates.filter(c => c.id !== id)
        }));
      },

      isShortlisted: (id) => {
        return get().savedCandidates.some(c => c.id === id);
      },

      updateNotes: (id, notes) => {
        set(state => ({
          savedCandidates: state.savedCandidates.map(c =>
            c.id === id ? { ...c, notes } : c
          )
        }));
      },

      updateAppliedFor: (id, appliedFor) => {
        set(state => ({
          savedCandidates: state.savedCandidates.map(c =>
            c.id === id ? { ...c, appliedFor } : c
          )
        }));
      },
    }),
    {
      name: 'saved-candidates-storage',
    }
  )
);
