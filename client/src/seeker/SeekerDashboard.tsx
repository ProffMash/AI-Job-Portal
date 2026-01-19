import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { JobCard } from '../components/JobCard';
import { useAuthStore } from '../stores/authStore';
import { useJobsStore } from '../stores/jobsStore';
import { Search, Filter, Star, Briefcase } from 'lucide-react';

export const SeekerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { getJobsForSeeker, applyToJob, applications } = useJobsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const matchedJobs = user?.skills ? getJobsForSeeker(user.skills) : [];
  const userApplications = applications.filter(app => app.seekerId === user?.id);

  const filteredJobs = matchedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleApply = (jobId: string) => {
    if (!user) return;
    
    applyToJob(jobId, {
      jobId,
      seekerId: user.id,
      seekerName: user.name,
      seekerEmail: user.email,
      status: 'pending'
    });
  };

  const getMatchScore = (job: any) => {
    if (!user?.skills) return 0;
    const matches = job.requirements.filter((req: string) =>
      user.skills!.some(skill =>
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      )
    ).length;
    return Math.round((matches / job.requirements.length) * 100);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here are your AI-matched job recommendations based on your skills: {user?.skills?.join(', ')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Matched Jobs</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{matchedJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Applications</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{userApplications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Profile Match</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {matchedJobs.length > 0 ? Math.round(matchedJobs.reduce((acc, job) => acc + getMatchScore(job), 0) / matchedJobs.length) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'No AI-matched jobs available at the moment'
                }
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="relative">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {getMatchScore(job)}% match
                  </div>
                </div>
                <JobCard job={job} onApply={handleApply} />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
