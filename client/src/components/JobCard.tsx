import React from 'react';
import { MapPin, Clock, DollarSign, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface JobCardJob {
  id: number | string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string | null;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | string;
  posted_at?: string;
  postedAt?: Date;
  applicant_count?: number;
  applicantCount?: number;
}

interface JobCardProps {
  job: JobCardJob;
  onApply?: (jobId: string | number) => void;
  showApplicants?: boolean;
  isApplied?: boolean;
  isApplying?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, showApplicants = false, isApplied = false, isApplying = false }) => {
  const { user } = useAuthStore();

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const postedDate = job.posted_at || job.postedAt;
  const applicantCount = job.applicant_count ?? job.applicantCount ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">{job.company}</p>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm space-x-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            {postedDate && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(postedDate)}
              </div>
            )}
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
            job.type === 'remote' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
            job.type === 'full-time' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
            job.type === 'part-time' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
            'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300'
          }`}>
            {job.type.replace('-', ' ').toUpperCase()}
          </span>
          {showApplicants && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <Users className="h-4 w-4 mr-1" />
              {applicantCount} applicants
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{job.description}</p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements?.map((req, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
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
            disabled={isApplied || isApplying}
            className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center ${
              isApplied
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : isApplying
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : isApplied ? (
              'Applied'
            ) : (
              'Apply Now'
            )}
          </button>
        </div>
      )}
    </div>
  );
};