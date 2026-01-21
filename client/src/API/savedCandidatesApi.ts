import apiClient from './apiClient';

export interface SavedCandidateResponse {
  id: number;
  candidate_details: {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
    avatar: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    website: string | null;
    skills: string[];
    experience: string | null;
    education: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  match_score: number;
  notes: string | null;
  applied_for: string | null;
  saved_at: string;
}

export interface SaveCandidateRequest {
  candidate_id: number;
  match_score?: number;
  notes?: string;
  applied_for?: string;
}

// Fetch all saved candidates for the current employer
export const fetchSavedCandidates = async (): Promise<SavedCandidateResponse[]> => {
  const response = await apiClient.get('/saved-candidates/');
  return response.data;
};

// Save a candidate
export const saveCandidate = async (data: SaveCandidateRequest): Promise<SavedCandidateResponse> => {
  const response = await apiClient.post('/saved-candidates/', data);
  return response.data;
};

// Remove a saved candidate by candidate ID
export const removeSavedCandidate = async (candidateId: number): Promise<void> => {
  await apiClient.delete(`/saved-candidates/by-candidate/${candidateId}/`);
};

// Check if a candidate is saved
export const checkCandidateSaved = async (candidateId: number): Promise<boolean> => {
  const response = await apiClient.get(`/saved-candidates/check/${candidateId}/`);
  return response.data.is_saved;
};

// Update notes for a saved candidate
export const updateCandidateNotes = async (candidateId: number, notes: string): Promise<SavedCandidateResponse> => {
  const response = await apiClient.patch(`/saved-candidates/notes/${candidateId}/`, { notes });
  return response.data;
};
