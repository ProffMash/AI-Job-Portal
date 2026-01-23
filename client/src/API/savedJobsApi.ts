import api from './apiClient';

export interface SavedJobResponse {
  id: number;
  job_details: any;
  saved_at: string;
}

export async function fetchSavedJobs(): Promise<SavedJobResponse[]> {
  const response = await api.get<SavedJobResponse[]>('saved-jobs/');
  return response.data;
}

export async function saveJob(jobId: number | string): Promise<SavedJobResponse> {
  const response = await api.post<SavedJobResponse>('saved-jobs/', { job_id: Number(jobId) });
  return response.data;
}

export async function unsaveJob(jobId: number | string): Promise<void> {
  await api.delete(`saved-jobs/${jobId}/`);
}

export async function checkSaved(jobId: number | string): Promise<{ is_saved: boolean }> {
  const response = await api.get<{ is_saved: boolean }>(`saved-jobs/check/${jobId}/`);
  return response.data;
}
