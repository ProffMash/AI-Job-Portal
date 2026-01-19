import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useJobsStore } from '../stores/jobsStore';
import { Briefcase, Clock, CheckCircle, XCircle, Eye, MapPin, Building, Calendar, Filter } from 'lucide-react';

type ApplicationStatus = 'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected';

export const MyApplications: React.FC = () => {
  const { user } = useAuthStore();
  const { applications, jobs } = useJobsStore();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const userApplications = applications.filter(app => app.seekerId === user?.id);

  const filteredApplications = userApplications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
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
    total: userApplications.length,
    pending: userApplications.filter(a => a.status === 'pending').length,
    reviewed: userApplications.filter(a => a.status === 'reviewed').length,
    accepted: userApplications.filter(a => a.status === 'accepted').length,
    rejected: userApplications.filter(a => a.status === 'rejected').length
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-sm sm:text-base text-gray-600">Track and manage your job applications</p>
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
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">Filter:</span>
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
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-600">Sort:</span>
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

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all'
                  ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                  : `No ${statusFilter} applications found.`}
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
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-xl flex-shrink-0">
                          {job.company.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{job.company}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {job.salary && (
                              <span className="text-gray-600 font-medium">{job.salary}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:space-y-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize flex items-center ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status}</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.type === 'remote' ? 'bg-green-100 text-green-700' :
                          job.type === 'full-time' ? 'bg-blue-100 text-blue-700' :
                          job.type === 'part-time' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>

                    {/* Application Timeline */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${application.status !== 'rejected' ? 'bg-green-500' : 'bg-green-500'}`} />
                          <div className={`w-16 h-0.5 ${application.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            application.status === 'reviewed' || application.status === 'accepted' ? 'bg-green-500' :
                            application.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <div className={`w-16 h-0.5 ${
                            application.status === 'accepted' ? 'bg-green-500' :
                            application.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                        </div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            application.status === 'accepted' ? 'bg-green-500' :
                            application.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Applied</span>
                        <span>In Review</span>
                        <span>{application.status === 'rejected' ? 'Rejected' : 'Decision'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                      <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center">
                        View Job Details
                      </button>
                      <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                        Withdraw Application
                      </button>
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
