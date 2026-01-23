import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Bookmark, BookmarkCheck, MapPin, Building, Clock, DollarSign, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { useJobsStore } from '../stores/jobsStore';
import { useAuthStore } from '../stores/authStore';

export const SavedJobs: React.FC = () => {
  const jobsStore = useJobsStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Only show jobs that are starred by this user
  const savedJobs = user && jobsStore.starredJobs[String(user.id)]
    ? jobsStore.jobs.filter((job: import('../types').Job) => jobsStore.starredJobs[String(user.id)].has(String(job.id)))
    : [];

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        await jobsStore.syncSavedJobs(String(user.id));
      } catch (err) {
        console.error('Failed to sync saved jobs', err);
      }
    })();
  }, [user?.id]);

  const filteredJobs = savedJobs.filter((job: import('../types').Job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRemoveJob = (jobId: string) => {
    if (user) jobsStore.unstarJob(jobId, String(user.id));
  };

  const getDaysAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Saved Jobs</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <BookmarkCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <span className="text-sm sm:text-base font-medium">{savedJobs.length} Saved</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 transition-colors">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Saved Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved jobs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || typeFilter !== 'all'
                  ? 'No jobs match your search criteria.'
                  : 'Save jobs you\'re interested in to view them later.'}
              </p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-xl flex-shrink-0">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate">
                              {job.title}
                            </h3>
                            <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                              <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium truncate">{job.company}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-3 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            {job.location}
                          </span>
                          {job.salary && (
                            <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {job.salary}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            Posted {getDaysAgo(job.postedAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.type === 'remote' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                            job.type === 'full-time' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                            job.type === 'part-time' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                            'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                          }`}>
                            {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:space-y-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500 order-1 sm:order-2">
                        {job.applicantCount} applicants
                      </span>
                      <button
                        onClick={() => handleRemoveJob(job.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors order-2 sm:order-1"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:space-x-3">
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center">
                        Apply Now
                      </button>
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                    <div className="hidden sm:flex items-center text-blue-600 dark:text-blue-400">
                      <BookmarkCheck className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
