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
  isStarred?: boolean;
  onStar?: () => void;
  onUnstar?: () => void;
  matchScore?: number;
  matchReason?: string;
  useAIRecommendations?: boolean;
  aiRecommendations?: any[];
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, showApplicants = false, isApplied = false, isApplying = false, isStarred = false, onStar, onUnstar, matchScore, useAIRecommendations, aiRecommendations }) => {
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
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
            {typeof matchScore === 'number' && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                matchScore >= 70
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                  : matchScore >= 50
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {useAIRecommendations && aiRecommendations && aiRecommendations.length > 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414M17.657 17.657l-1.414-1.414M6.343 6.343L4.929 4.929" /></svg>
                )}
                {matchScore}% match
              </span>
            )}
          </div>
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
          {/* Match reason removed as requested */}
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
        <div className="flex justify-end items-center gap-2">
          {(typeof isStarred !== 'undefined' && (onStar || onUnstar)) && (
            <button
              onClick={isStarred ? onUnstar : onStar}
              className={`p-2 rounded-full border transition-colors ${isStarred ? 'bg-yellow-100 border-yellow-400 text-yellow-600' : 'bg-gray-100 border-gray-300 text-gray-400 hover:text-yellow-500 hover:border-yellow-400'}`}
              title={isStarred ? 'Unstar' : 'Star'}
              style={{ marginRight: 8 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isStarred ? 'fill-yellow-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118l-5.347-3.89c-.783-.57-.38-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z" />
              </svg>
            </button>
          )}
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