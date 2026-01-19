import React from 'react';
import { Job } from '../types';
import { MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useJobsStore } from '../stores/jobsStore';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  showApplicants?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, showApplicants = false }) => {
  const { user } = useAuthStore();
  const { applications } = useJobsStore();
  
  const hasApplied = applications.some(
    app => app.jobId === job.id && app.seekerId === user?.id
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
          <div className="flex items-center text-gray-500 text-sm space-x-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(job.postedAt)}
            </div>
            {job.salary && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.salary}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.type === 'remote' ? 'bg-green-100 text-green-800' :
            job.type === 'full-time' ? 'bg-blue-100 text-blue-800' :
            job.type === 'part-time' ? 'bg-yellow-100 text-yellow-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {job.type.replace('-', ' ').toUpperCase()}
          </span>
          {showApplicants && (
            <div className="flex items-center text-gray-500 text-sm">
              <Users className="h-4 w-4 mr-1" />
              {job.applicantCount} applicants
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements.map((req, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {req}
            </span>
          ))}
        </div>
      </div>

      {onApply && user?.role === 'seeker' && (
        <div className="flex justify-end">
          <button
            onClick={() => onApply(job.id)}
            disabled={hasApplied}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              hasApplied
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {hasApplied ? 'Applied' : 'Apply Now'}
          </button>
        </div>
      )}
    </div>
  );
};