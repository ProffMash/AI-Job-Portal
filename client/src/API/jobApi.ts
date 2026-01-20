import api, { cachedGet, invalidateCacheFor } from './apiClient';

export interface Job {
  id: number | string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  posted_by: number;
  posted_by_details?: {
    id: number;
    name: string;
    email: string;
    company?: string;
  };
  posted_at: string;
  applicant_count: number;
}

export interface JobFilters {
  type?: string;
  location?: string;
  company?: string;
  search?: string;
}

// Fetch all jobs with optional filters
export async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  return await cachedGet<Job[]>('jobs/', filters as Record<string, unknown>, 60);
}

// Fetch a single job by ID
export async function fetchJobById(id: number | string): Promise<Job> {
  return await cachedGet<Job>(`jobs/${id}/`, undefined, 60);
}

// Create a new job (employer only)
export async function createJob(job: Omit<Job, 'id' | 'posted_by' | 'posted_by_details' | 'posted_at' | 'applicant_count'>): Promise<Job> {
  const response = await api.post<Job>('jobs/', job);
  invalidateCacheFor('jobs/', undefined);
  return response.data;
}

// Update an existing job
export async function updateJob(
  id: number | string,
  job: Partial<Omit<Job, 'id' | 'posted_by' | 'posted_by_details' | 'posted_at' | 'applicant_count'>>
): Promise<Job> {
  const response = await api.patch<Job>(`jobs/${id}/`, job);
  invalidateCacheFor('jobs/', undefined);
  invalidateCacheFor(`jobs/${id}/`, undefined);
  return response.data;
}

// Delete a job
export async function deleteJob(id: number | string): Promise<void> {
  await api.delete(`jobs/${id}/`);
  invalidateCacheFor('jobs/', undefined);
  invalidateCacheFor(`jobs/${id}/`, undefined);
}

// Get jobs posted by the current employer
export async function fetchMyJobs(): Promise<Job[]> {
  return await cachedGet<Job[]>('jobs/my_jobs/', undefined, 60);
}

// Get recent jobs
export async function fetchRecentJobs(): Promise<Job[]> {
  return await cachedGet<Job[]>('jobs/recent/', undefined, 60);
}

// Get jobs by a specific employer
export async function fetchJobsByEmployer(employerId: number | string): Promise<Job[]> {
  return await cachedGet<Job[]>('jobs/by_employer/', { employer_id: employerId }, 60);
}
