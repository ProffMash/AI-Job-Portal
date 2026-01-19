export interface User {
  id: string;
  name: string;
  email: string;
  role: 'seeker' | 'employer';
  skills?: string[];
  company?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  experience?: string;
  education?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  companySize?: string;
  industry?: string;
  founded?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  postedBy: string;
  postedAt: Date;
  applicantCount: number;
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  appliedAt: Date;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<User>) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface JobsState {
  jobs: Job[];
  applications: Application[];
  addJob: (job: Omit<Job, 'id' | 'postedAt' | 'applicantCount'>) => void;
  updateJob: (jobId: string, updates: Partial<Omit<Job, 'id' | 'postedAt' | 'applicantCount'>>) => void;
  deleteJob: (jobId: string) => void;
  applyToJob: (jobId: string, application: Omit<Application, 'id' | 'appliedAt'>) => void;
  getJobsForSeeker: (seekerSkills: string[]) => Job[];
  getApplicationsForEmployer: (employerId: string) => Application[];
}