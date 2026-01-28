import apiClient from './apiClient';

export interface ApplicationResponse {
  id: number;
  job_id?: number;
  job_details: {
    id: number;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary: string | null;
    type: string;
    posted_at: string;
    applicant_count: number;
  };
  seeker_id: number;
  seeker_name: string;
  seeker_email: string;
  seeker_details: {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
    avatar: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    skills: string[];
    experience: string | null;
    education: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  cover_letter: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
}

export interface ApplyToJobRequest {
  job_id: number;
}

// Apply to a job (seeker only)
export const applyToJob = async (data: ApplyToJobRequest): Promise<ApplicationResponse> => {
  const response = await apiClient.post('/applications/', data);
  return response.data;
};

// Get all applications for the current seeker
export const getMyApplications = async (): Promise<ApplicationResponse[]> => {
  const response = await apiClient.get('/applications/my-applications/');
  return response.data;
};

// Get all applications for a specific job (employer only)
export const getApplicationsForJob = async (jobId: number): Promise<ApplicationResponse[]> => {
  const response = await apiClient.get(`/applications/for-job/${jobId}/`);
  return response.data;
};

// Update application status (employer only)
export const updateApplicationStatus = async (
  applicationId: number,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
): Promise<ApplicationResponse> => {
  const response = await apiClient.patch(`/applications/${applicationId}/status/`, { status });
  return response.data;
};

// Check if current user has applied to a job
export const checkApplied = async (jobId: number): Promise<boolean> => {
  const response = await apiClient.get(`/applications/check/${jobId}/`);
  return response.data.has_applied;
};

// Get a single application by ID
export const getApplication = async (applicationId: number): Promise<ApplicationResponse> => {
  const response = await apiClient.get(`/applications/${applicationId}/`);
  return response.data;
};

// Get all applications (based on user role - seeker sees theirs, employer sees for their jobs)
export const getAllApplications = async (): Promise<ApplicationResponse[]> => {
  const response = await apiClient.get('/applications/');
  return response.data;
};

// Withdraw an application (seeker only)
export const withdrawApplication = async (applicationId: number): Promise<void> => {
  await apiClient.delete(`/applications/${applicationId}/`);
};

// Delete an application (employer only)
export const deleteApplication = async (applicationId: number): Promise<void> => {
  await apiClient.delete(`/applications/${applicationId}/`);
};
