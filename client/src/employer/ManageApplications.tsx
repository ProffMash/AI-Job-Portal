import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useJobsStore } from '../stores/jobsStore';
import { Briefcase, Clock, CheckCircle, XCircle, Eye, Calendar, Filter, Mail, Download, Star } from 'lucide-react';

type ApplicationStatus = 'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected';

export const ManageApplications: React.FC = () => {
  const { user } = useAuthStore();
  const { applications, jobs } = useJobsStore();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const employerJobs = jobs.filter(job => job.postedBy === user?.id);
  const employerApplications = applications.filter(app => 
    employerJobs.some(job => job.id === app.jobId)
  );

  const filteredApplications = employerApplications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .filter(app => jobFilter === 'all' || app.jobId === jobFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      }
      return a.status.localeCompare(b.status);
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'reviewed':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: employerApplications.length,
    pending: employerApplications.filter(a => a.status === 'pending').length,
    reviewed: employerApplications.filter(a => a.status === 'reviewed').length,
    accepted: employerApplications.filter(a => a.status === 'accepted').length,
    rejected: employerApplications.filter(a => a.status === 'rejected').length
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Applications</h1>
          <p className="text-sm sm:text-base text-gray-600">Review and manage all applications for your job postings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs sm:text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs sm:text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.reviewed}</p>
                <p className="text-xs sm:text-sm text-gray-500">Reviewed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.accepted}</p>
                <p className="text-xs sm:text-sm text-gray-500">Accepted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs sm:text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'reviewed', 'accepted', 'rejected'] as ApplicationStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Job:</span>
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Jobs</option>
                  {employerJobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date Applied</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {employerJobs.length === 0
                  ? "Post a job to start receiving applications!"
                  : "No applications match your current filters."}
              </p>
            </div>
          ) : (
            filteredApplications.map(application => {
              const job = jobs.find(j => j.id === application.jobId);
              if (!job) return null;

              return (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-xl flex-shrink-0">
                          {application.seekerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                            {application.seekerName}
                          </h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{application.seekerEmail}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">Applied for: <span className="font-medium text-gray-700">{job.title}</span></span>
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:space-y-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize flex items-center ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status}</span>
                        </span>
                      </div>
                    </div>

                    {application.coverLetter && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Cover Letter:</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{application.coverLetter}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          View Profile
                        </button>
                        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Download </span>Resume
                        </button>
                        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Contact
                        </button>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                              Accept
                            </button>
                            <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};
