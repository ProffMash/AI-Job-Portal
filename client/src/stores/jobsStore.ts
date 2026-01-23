import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobsState, Job, Application } from '../types';
import { fetchSavedJobs, saveJob as apiSaveJob, unsaveJob as apiUnsaveJob } from '../API/savedJobsApi';

// No mock jobs — start with empty list; jobs will be populated from API or user actions

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: [],
      applications: [],
      starredJobs: {},
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
          applications: state.applications.filter(app => String(app.jobId) !== String(jobId))
        }));
      },
      applyToJob: (jobId, applicationData) => {
        const newApplication: Application = {
          ...applicationData,
          id: Date.now(), // number, not string
          appliedAt: new Date().toISOString(), // string, not Date
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
          employerJobs.some(job => String(job.id) === String(app.jobId))
        );
      },
      // Per-user starring (optimistic local update + backend sync)
      starJob: (jobOrId: string | Job, userId: string) => {
        set(state => {
          const id = typeof jobOrId === 'string' ? jobOrId : jobOrId.id;
          // Add job to jobs list if not present
          let jobs = state.jobs;
          if (!jobs.some(j => String(j.id) === String(id)) && typeof jobOrId !== 'string') {
            const incoming: any = jobOrId;
            const newJob: Job = {
              id: String(incoming.id),
              title: incoming.title || incoming.job_title || '',
              company: incoming.company || '',
              location: incoming.location || '',
              description: incoming.description || '',
              requirements: incoming.requirements || incoming.skills || [],
              salary: incoming.salary,
              type: incoming.type || 'full-time',
              postedBy: incoming.posted_by ? String(incoming.posted_by) : (incoming.postedBy || ''),
              postedAt: incoming.posted_at ? new Date(incoming.posted_at) : (incoming.postedAt ? new Date(incoming.postedAt) : new Date()),
              applicantCount: incoming.applicant_count ?? 0
            };
            jobs = [...jobs, newJob];
          }
          // Add to user's starred set
          const starredJobs = { ...state.starredJobs };
          if (!starredJobs[userId]) starredJobs[userId] = new Set();
          starredJobs[userId] = new Set(starredJobs[userId]);
          starredJobs[userId].add(String(id));
          return { jobs, starredJobs };
        });

        // Fire-and-forget API call to persist on server
        (async () => {
          try {
            await apiSaveJob(typeof jobOrId === 'string' ? jobOrId : jobOrId.id);
          } catch (err) {
            console.error('Failed to save job on server', err);
          }
        })();
      },

      unstarJob: (jobOrId: string | Job, userId: string) => {
        set(state => {
          const id = typeof jobOrId === 'string' ? jobOrId : jobOrId.id;
          const starredJobs = { ...state.starredJobs };
          if (starredJobs[userId]) {
            starredJobs[userId] = new Set(starredJobs[userId]);
            starredJobs[userId].delete(String(id));
          }
          return { starredJobs };
        });

        (async () => {
          try {
            await apiUnsaveJob(typeof jobOrId === 'string' ? jobOrId : jobOrId.id);
          } catch (err) {
            console.error('Failed to unsave job on server', err);
          }
        })();
      },

      // Sync saved jobs from backend for a user
      syncSavedJobs: async (userId: string) => {
        try {
          const saved = await fetchSavedJobs();
          set(state => {
            const starredJobs = { ...state.starredJobs };
            starredJobs[userId] = new Set(saved.map(s => String(s.job_details.id)));

            // Add any missing jobs into the jobs list
            const jobsMap: Record<string, Job> = {};
            state.jobs.forEach(j => { jobsMap[String(j.id)] = j; });
            const incomingJobs: Job[] = [];
            saved.forEach(s => {
              const jd: any = s.job_details;
              const idStr = String(jd.id);
              if (!jobsMap[idStr]) {
                const newJob: Job = {
                  id: idStr,
                  title: jd.title || '',
                  company: jd.company || '',
                  location: jd.location || '',
                  description: jd.description || '',
                  requirements: jd.requirements || [],
                  salary: jd.salary,
                  type: jd.type || 'full-time',
                  postedBy: jd.posted_by ? String(jd.posted_by) : (jd.postedBy || ''),
                  postedAt: jd.posted_at ? new Date(jd.posted_at) : (jd.postedAt ? new Date(jd.postedAt) : new Date()),
                  applicantCount: jd.applicant_count ?? 0
                };
                incomingJobs.push(newJob);
              }
            });

            return { jobs: [...state.jobs, ...incomingJobs], starredJobs };
          });
        } catch (err) {
          console.error('Failed to sync saved jobs', err);
        }
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
          
          // Rebuild starredJobs Sets saved as arrays in localStorage
          if (data.state?.starredJobs) {
            const rebuilt: Record<string, Set<string>> = {};
            Object.entries(data.state.starredJobs).forEach(([userId, value]: [string, any]) => {
              // value may be an array of ids or an object; handle array case
              if (Array.isArray(value)) {
                rebuilt[userId] = new Set(value.map(String));
              } else if (value && typeof value === 'object') {
                // If value was serialized as an object with numeric keys, convert its values
                const arr = Object.values(value).map(String);
                rebuilt[userId] = new Set(arr);
              } else {
                rebuilt[userId] = new Set();
              }
            });
            data.state.starredJobs = rebuilt;
          }
          
          return data;
        },
        setItem: (name, value) => {
          // Convert starredJobs Sets to arrays for JSON serialization
          try {
            const copy: any = { ...value };
            if (copy?.state && copy.state.starredJobs) {
              const serializable: Record<string, string[]> = {};
              Object.entries(copy.state.starredJobs).forEach(([userId, setLike]: [string, any]) => {
                try {
                  // If it's a Set, Array.from it; if array, keep; otherwise coerce to array
                  if (setLike instanceof Set) {
                    serializable[userId] = Array.from(setLike);
                  } else if (Array.isArray(setLike)) {
                    serializable[userId] = setLike.map(String);
                  } else if (setLike && typeof setLike === 'object') {
                    serializable[userId] = Object.values(setLike).map(String);
                  } else {
                    serializable[userId] = [];
                  }
                } catch (e) {
                  serializable[userId] = [];
                }
              });
              copy.state = { ...copy.state, starredJobs: serializable };
            }
            localStorage.setItem(name, JSON.stringify(copy));
          } catch (e) {
            // Fallback: best-effort stringify
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);