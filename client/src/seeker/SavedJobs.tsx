import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Bookmark, BookmarkCheck, MapPin, Building, Clock, DollarSign, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { Job } from '../types';

// Mock saved jobs - in a real app, this would come from a store or API
const mockSavedJobs: Job[] = [
  {
    id: 'saved1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: 'We are looking for an experienced React developer to join our team...',
    requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    salary: '$150,000 - $180,000',
    type: 'full-time',
    postedBy: 'emp1',
    postedAt: new Date('2026-01-15'),
    applicantCount: 45
  },
  {
    id: 'saved2',
    title: 'Full Stack Engineer',
    company: 'StartupX',
    location: 'Remote',
    description: 'Join our fast-growing startup and work on cutting-edge technology...',
    requirements: ['React', 'Python', 'AWS', 'PostgreSQL'],
    salary: '$120,000 - $160,000',
    type: 'remote',
    postedBy: 'emp2',
    postedAt: new Date('2026-01-17'),
    applicantCount: 32
  },
  {
    id: 'saved3',
    title: 'Frontend Developer',
    company: 'DesignStudio',
    location: 'New York, NY',
    description: 'Create beautiful and responsive web applications...',
    requirements: ['Vue.js', 'CSS', 'JavaScript', 'Figma'],
    salary: '$100,000 - $130,000',
    type: 'full-time',
    postedBy: 'emp3',
    postedAt: new Date('2026-01-18'),
    applicantCount: 28
  },
  {
    id: 'saved4',
    title: 'Backend Developer',
    company: 'DataFlow Inc',
    location: 'Seattle, WA',
    description: 'Build scalable backend services and APIs...',
    requirements: ['Go', 'Kubernetes', 'Redis', 'MongoDB'],
    salary: '$140,000 - $170,000',
    type: 'full-time',
    postedBy: 'emp4',
    postedAt: new Date('2026-01-12'),
    applicantCount: 38
  }
];

export const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>(mockSavedJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRemoveJob = (jobId: string) => {
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="flex items-center text-blue-600">
            <BookmarkCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <span className="text-sm sm:text-base font-medium">{savedJobs.length} Saved</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs</h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all'
                  ? 'No jobs match your search criteria.'
                  : 'Save jobs you\'re interested in to view them later.'}
              </p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-xl flex-shrink-0">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                              {job.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mt-1">
                              <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium truncate">{job.company}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-3 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            {job.location}
                          </span>
                          {job.salary && (
                            <span className="flex items-center text-green-600 font-medium">
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
                            job.type === 'remote' ? 'bg-green-100 text-green-700' :
                            job.type === 'full-time' ? 'bg-blue-100 text-blue-700' :
                            job.type === 'part-time' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:space-y-2">
                      <span className="text-xs text-gray-400 order-1 sm:order-2">
                        {job.applicantCount} applicants
                      </span>
                      <button
                        onClick={() => handleRemoveJob(job.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors order-2 sm:order-1"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:space-x-3">
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center">
                        Apply Now
                      </button>
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                    <div className="hidden sm:flex items-center text-blue-600">
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
