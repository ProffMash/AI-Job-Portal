import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { JobCard } from '../components/JobCard';
import { useAuthStore } from '../stores/authStore';
import { Search, Filter, Star, Briefcase, Loader2, AlertCircle, Sparkles, Brain } from 'lucide-react';
import { fetchJobs, Job } from '../API/jobApi';
import { applyToJob, getMyApplications, ApplicationResponse } from '../API/applicationApi';
import { getAIJobRecommendations, AIJobRecommendation } from '../API/aiRecommendationApi';
import { fetchProfile } from '../API/profileApi';
import { useJobsStore } from '../stores/jobsStore';

export const SeekerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const jobsStore = useJobsStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIJobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [applyingToJob, setApplyingToJob] = useState<number | string | null>(null);
  const [useAIRecommendations, setUseAIRecommendations] = useState(true);

  // Fetch jobs and applications on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [jobsData, applicationsData] = await Promise.all([
          fetchJobs(),
          getMyApplications()
        ]);
        setJobs(jobsData);
        setApplications(applicationsData);

        // Fetch AI recommendations if user is logged in
        if (user?.id) {
          setAiLoading(true);
          try {
            const profile = await fetchProfile(user.id);
            const recommendations = await getAIJobRecommendations(profile, jobsData);
            setAiRecommendations(recommendations);
          } catch (aiErr) {
            console.error('AI recommendations failed:', aiErr);
            // Silently fail - will use basic matching
          } finally {
            setAiLoading(false);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  // Get jobs to display (AI recommendations or basic matching)
  const getDisplayJobs = (): { job: Job; matchScore: number; matchReason?: string }[] => {
    if (useAIRecommendations && aiRecommendations.length > 0) {
      return aiRecommendations.map(rec => ({
        job: rec.job,
        matchScore: rec.matchScore,
        matchReason: rec.matchReason
      }));
    }
    
    // Fallback to basic matching
    return jobs.map(job => ({
      job,
      matchScore: getBasicMatchScore(job),
      matchReason: undefined
    }));
  };

    // Local alias for Job that may include the optional `starred` flag

  const getBasicMatchScore = (job: Job) => {
    if (!user?.skills || !job.requirements || job.requirements.length === 0) return 0;
    const matches = job.requirements.filter((req: string) =>
      user.skills!.some(skill =>
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      )
    ).length;
    return Math.round((matches / job.requirements.length) * 100);
  };

  const displayJobs = getDisplayJobs();

  const filteredJobs = displayJobs.filter(({ job }) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleApply = async (jobId: string | number) => {
    if (!user) return;
    
    // Check if already applied
    if (applications.some(app => app.job_details.id === jobId)) {
      alert('You have already applied to this job');
      return;
    }

    try {
      setApplyingToJob(jobId);
      const newApplication = await applyToJob({ job_id: Number(jobId) });
      setApplications(prev => [...prev, newApplication]);
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplyingToJob(null);
    }
  };

  const isApplied = (jobId: number | string) => {
    return applications.some(app => app.job_details.id === jobId);
  };

  const handleStar = (jobObj: Job) => user && jobsStore.starJob(jobObj, String(user.id));
  const handleUnstar = (jobId: string) => user && jobsStore.unstarJob(jobId, String(user.id));

  const avgMatchScore = filteredJobs.length > 0 
    ? Math.round(filteredJobs.reduce((acc, { matchScore }) => acc + matchScore, 0) / filteredJobs.length) 
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading jobs...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Error Loading Jobs</h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            {aiRecommendations.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {aiRecommendations.length > 0 
              ? 'AI-powered job recommendations based on your complete profile'
              : `Job recommendations based on your skills: ${user?.skills?.join(', ') || 'Add skills to your profile'}`
            }
          </p>
          {aiLoading && (
            <div className="flex items-center gap-2 mt-2 text-purple-600 dark:text-purple-400 text-sm">
              <Brain className="h-4 w-4 animate-pulse" />
              AI is analyzing your profile...
            </div>
          )}
        </div>

        {/* AI Toggle */}
        {aiRecommendations.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">AI Job Matching</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Powered by Hugging Face AI - analyzing your skills, experience & education
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUseAIRecommendations(!useAIRecommendations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useAIRecommendations ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useAIRecommendations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Matched Jobs</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{displayJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Match</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {avgMatchScore}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'No AI-matched jobs available at the moment'
                }
              </p>
            </div>
          ) : (
            filteredJobs.map(({ job, matchScore, matchReason }) => (
              <div key={job.id} className="relative">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col items-end gap-1">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    matchScore >= 70 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                      : matchScore >= 50 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {useAIRecommendations && aiRecommendations.length > 0 && (
                      <Sparkles className="h-3 w-3" />
                    )}
                    {matchScore}% match
                  </div>
                  {(() => {
                    const isStarred = user && jobsStore.starredJobs[String(user.id)] && jobsStore.starredJobs[String(user.id)].has(String(job.id));
                    return (
                      <button
                        onClick={() => isStarred ? handleUnstar(String(job.id)) : handleStar(job)}
                        className={`mt-2 p-2 rounded-full border transition-colors ${isStarred ? 'bg-yellow-100 border-yellow-400 text-yellow-600' : 'bg-gray-100 border-gray-300 text-gray-400 hover:text-yellow-500 hover:border-yellow-400'}`}
                        title={isStarred ? 'Unstar' : 'Star'}
                      >
                        <Star className={`h-5 w-5 ${isStarred ? 'fill-yellow-400' : ''}`} />
                      </button>
                    );
                  })()}
                </div>
                {matchReason && useAIRecommendations && (
                  <div className="absolute top-12 right-3 sm:top-14 sm:right-4 z-10 max-w-[200px]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                      {matchReason}
                    </p>
                  </div>
                )}
                <JobCard 
                  job={job} 
                  onApply={handleApply} 
                  isApplied={isApplied(job.id)}
                  isApplying={applyingToJob === job.id}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
