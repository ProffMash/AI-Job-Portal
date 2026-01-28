export interface User {
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
  companySize?: string;
  industry?: string;
  founded?: string;
  isActive?: boolean;
  createdAt?: string;
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
  starred?: boolean; // Added for starring jobs
}

export interface Application {
  id: number;
  jobId: number;
  seekerId: number;
  seekerName: string;
  seekerEmail: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  // resumeUrl removed
  updatedAt?: string;
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
  // Map of userId to Set of starred job ids
  starredJobs: { [userId: string]: Set<string> };
  addJob: (job: Omit<Job, 'id' | 'postedAt' | 'applicantCount'>) => void;
  updateJob: (jobId: string, updates: Partial<Omit<Job, 'id' | 'postedAt' | 'applicantCount'>>) => void;
  deleteJob: (jobId: string) => void;
  applyToJob: (jobId: string, application: Omit<Application, 'id' | 'appliedAt'>) => void;
  getJobsForSeeker: (seekerSkills: string[]) => Job[];
  getApplicationsForEmployer: (employerId: string) => Application[];
  starJob: (jobIdOrJob: string | any, userId: string) => void;
  unstarJob: (jobIdOrJob: string | any, userId: string) => void;
  syncSavedJobs: (userId: string) => Promise<void>;
}