import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobsState, Job, Application } from '../types';

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    description: 'We are looking for a Senior React Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows.',
    requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
    salary: '$120,000 - $150,000',
    type: 'full-time',
    postedBy: '2',
    postedAt: new Date('2024-01-15'),
    applicantCount: 12
  },
  {
    id: '2',
    title: 'Full Stack Python Developer',
    company: 'DataFlow Solutions',
    location: 'New York, NY',
    description: 'Join our team as a Full Stack Python Developer. You will work on cutting-edge data processing applications and web services.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'React', '3+ years experience'],
    salary: '$100,000 - $130,000',
    type: 'full-time',
    postedBy: '2',
    postedAt: new Date('2024-01-10'),
    applicantCount: 8
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    location: 'Austin, TX',
    description: 'We need a DevOps Engineer to help us scale our cloud infrastructure and improve our deployment processes.',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', '4+ years experience'],
    salary: '$110,000 - $140,000',
    type: 'full-time',
    postedBy: '2',
    postedAt: new Date('2024-01-12'),
    applicantCount: 15
  },
  {
    id: '4',
    title: 'Java Backend Developer',
    company: 'Enterprise Solutions Ltd.',
    location: 'Chicago, IL',
    description: 'Looking for a Java Backend Developer to work on enterprise-level applications and microservices architecture.',
    requirements: ['Java', 'Spring Boot', 'Microservices', 'AWS', '3+ years experience'],
    salary: '$95,000 - $125,000',
    type: 'full-time',
    postedBy: '2',
    postedAt: new Date('2024-01-08'),
    applicantCount: 6
  },
  {
    id: '5',
    title: 'Frontend React Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    description: 'Remote opportunity for a Frontend React Developer to build modern web applications for our growing startup.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', '2+ years experience'],
    salary: '$80,000 - $100,000',
    type: 'remote',
    postedBy: '2',
    postedAt: new Date('2024-01-14'),
    applicantCount: 20
  }
];

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,
      applications: [],
      addJob: (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: Date.now().toString(),
          postedAt: new Date(),
          applicantCount: 0
        };
        set(state => ({ jobs: [...state.jobs, newJob] }));
      },
      updateJob: (jobId, updates) => {
        set(state => ({
          jobs: state.jobs.map(job =>
            job.id === jobId
              ? { ...job, ...updates }
              : job
          )
        }));
      },
      deleteJob: (jobId) => {
        set(state => ({
          jobs: state.jobs.filter(job => job.id !== jobId),
          applications: state.applications.filter(app => app.jobId !== jobId)
        }));
      },
      applyToJob: (jobId, applicationData) => {
        const newApplication: Application = {
          ...applicationData,
          id: Date.now().toString(),
          appliedAt: new Date(),
          status: 'pending'
        };
        set(state => ({
          applications: [...state.applications, newApplication],
          jobs: state.jobs.map(job =>
            job.id === jobId
              ? { ...job, applicantCount: job.applicantCount + 1 }
              : job
          )
        }));
      },
      getJobsForSeeker: (seekerSkills) => {
        const { jobs } = get();
        // AI-like matching: jobs that have at least one matching skill
        return jobs.filter(job =>
          job.requirements.some(req =>
            seekerSkills.some(skill =>
              skill.toLowerCase().includes(req.toLowerCase()) ||
              req.toLowerCase().includes(skill.toLowerCase())
            )
          )
        ).sort((a, b) => {
          // Sort by relevance (number of matching skills)
          const aMatches = a.requirements.filter(req =>
            seekerSkills.some(skill =>
              skill.toLowerCase().includes(req.toLowerCase()) ||
              req.toLowerCase().includes(skill.toLowerCase())
            )
          ).length;
          const bMatches = b.requirements.filter(req =>
            seekerSkills.some(skill =>
              skill.toLowerCase().includes(req.toLowerCase()) ||
              req.toLowerCase().includes(skill.toLowerCase())
            )
          ).length;
          return bMatches - aMatches;
        });
      },
      getApplicationsForEmployer: (employerId) => {
        const { applications, jobs } = get();
        const employerJobs = jobs.filter(job => job.postedBy === employerId);
        return applications.filter(app =>
          employerJobs.some(job => job.id === app.jobId)
        );
      }
    }),
    {
      name: 'jobs-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          
          // Convert date strings back to Date objects
          if (data.state?.jobs) {
            data.state.jobs = data.state.jobs.map((job: any) => ({
              ...job,
              postedAt: new Date(job.postedAt)
            }));
          }
          
          if (data.state?.applications) {
            data.state.applications = data.state.applications.map((app: any) => ({
              ...app,
              appliedAt: new Date(app.appliedAt)
            }));
          }
          
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);