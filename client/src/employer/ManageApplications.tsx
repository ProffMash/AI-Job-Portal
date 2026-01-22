import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Briefcase, Clock, CheckCircle, XCircle, Eye, Calendar, Filter, Mail, Download, Star, Loader2, AlertCircle, Trash2, Edit3, X, MapPin, Phone, Link, Linkedin, Github, GraduationCap, User, Sparkles, Brain } from 'lucide-react';
import { getAllApplications, updateApplicationStatus, deleteApplication, ApplicationResponse } from '../API/applicationApi';
import { fetchMyJobs, Job } from '../API/jobApi';
import { getApplicantMatchScores, ApplicantMatchResult } from '../API/aiRecommendationApi';

type ApplicationStatus = 'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected';

export const ManageApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [matchScores, setMatchScores] = useState<Map<number, ApplicantMatchResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ApplicationResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'match'>('date');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [appsData, jobsData] = await Promise.all([
          getAllApplications(),
          fetchMyJobs()
        ]);
        setApplications(appsData);
        setEmployerJobs(jobsData);

        // Fetch AI match scores for all applications
        if (appsData.length > 0) {
          setAiLoading(true);
          try {
            const scores = await getApplicantMatchScores(appsData);
            setMatchScores(scores);
          } catch (aiErr) {
            console.error('AI matching failed:', aiErr);
            // Silently fail - will show no scores
          } finally {
            setAiLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusUpdate = async (applicationId: number, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    try {
      setUpdatingStatus(applicationId);
      const updated = await updateApplicationStatus(applicationId, newStatus);
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? updated : app
      ));
      setEditingStatusId(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update application status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (applicationId: number) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }
    try {
      setDeletingId(applicationId);
      await deleteApplication(applicationId);
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err) {
      console.error('Failed to delete application:', err);
      alert('Failed to delete application. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const employerApplications = applications;

  const filteredApplications = employerApplications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .filter(app => jobFilter === 'all' || app.job_details.id.toString() === jobFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
      }
      if (sortBy === 'match') {
        const scoreA = matchScores.get(a.id)?.matchScore || 0;
        const scoreB = matchScores.get(b.id)?.matchScore || 0;
        return scoreB - scoreA;
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
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'reviewed':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
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
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Manage Applications</h1>
            {matchScores.size > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
                <Sparkles className="h-3 w-3" />
                AI Matching
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {matchScores.size > 0 
              ? 'AI-powered candidate matching based on skills, experience & job requirements'
              : 'Review and manage all applications for your job postings'}
          </p>
          {aiLoading && (
            <div className="flex items-center gap-2 mt-2 text-purple-600 dark:text-purple-400 text-sm">
              <Brain className="h-4 w-4 animate-pulse" />
              AI is analyzing candidate profiles...
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewed}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reviewed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Accepted</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 col-span-2 sm:col-span-1 transition-colors">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 transition-colors">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'reviewed', 'accepted', 'rejected'] as ApplicationStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Job:</span>
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Jobs</option>
                  {employerJobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'match')}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="date">Date Applied</option>
                  <option value="status">Status</option>
                  <option value="match">AI Match Score</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading applications...</h3>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading applications</h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {employerJobs.length === 0
                  ? "Post a job to start receiving applications!"
                  : "No applications match your current filters."}
              </p>
            </div>
          ) : (
            filteredApplications.map(application => {
              const job = application.job_details;
              const matchResult = matchScores.get(application.id);

              return (
                <div key={application.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                  <div className="p-4 sm:p-6">
                    {/* AI Match Score Banner */}
                    {matchResult && (
                      <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
                        matchResult.matchScore >= 70 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : matchResult.matchScore >= 50 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Sparkles className={`h-4 w-4 ${
                            matchResult.matchScore >= 70 
                              ? 'text-green-600 dark:text-green-400'
                              : matchResult.matchScore >= 50 
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            matchResult.matchScore >= 70 
                              ? 'text-green-700 dark:text-green-300'
                              : matchResult.matchScore >= 50 
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {matchResult.matchReason}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                          matchResult.matchScore >= 70 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                            : matchResult.matchScore >= 50 
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {matchResult.matchScore}% match
                        </div>
                      </div>
                    )}
                    {aiLoading && !matchResult && (
                      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                        <span className="text-sm text-purple-700 dark:text-purple-300">AI analyzing candidate profile...</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-xl flex-shrink-0">
                          {application.seeker_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate">
                              {application.seeker_name}
                            </h3>
                            {matchResult && matchResult.matchScore >= 80 && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                <Star className="h-3 w-3 fill-white" /> Top Match
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{application.seeker_email}</span>
                          </div>
                          {/* Show matching skills if available */}
                          {matchResult && matchResult.matchingSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {matchResult.matchingSkills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full">
                                  ✓ {skill}
                                </span>
                              ))}
                              {matchResult.matchingSkills.length > 4 && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                  +{matchResult.matchingSkills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">Applied for: <span className="font-medium text-gray-700 dark:text-gray-300">{job.title}</span></span>
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {new Date(application.applied_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:space-y-2">
                        <div className="relative">
                          <button
                            onClick={() => setEditingStatusId(editingStatusId === application.id ? null : application.id)}
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize flex items-center ${getStatusColor(application.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                          >
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status}</span>
                            <Edit3 className="h-3 w-3 ml-1" />
                          </button>
                          {editingStatusId === application.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                              {(['pending', 'reviewed', 'accepted', 'rejected'] as const).map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(application.id, status)}
                                  disabled={updatingStatus === application.id}
                                  className={`w-full px-3 py-2 text-left text-sm capitalize hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 ${application.status === status ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}`}
                                >
                                  {getStatusIcon(status)}
                                  {status}
                                  {updatingStatus === application.id && application.status !== status && (
                                    <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Cover Letter:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{application.cover_letter}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                        <button 
                          onClick={() => setViewingProfile(application)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          View Profile
                        </button>
                        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Download </span>Resume
                        </button>
                        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Contact
                        </button>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        {(application.status === 'pending' || application.status === 'reviewed') && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'accepted')}
                              disabled={updatingStatus === application.id}
                              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === application.id ? 'Updating...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              disabled={updatingStatus === application.id}
                              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === application.id ? 'Updating...' : 'Reject'}
                            </button>
                          </>
                        )}
                        {application.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'reviewed')}
                            disabled={updatingStatus === application.id}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === application.id ? 'Updating...' : 'Mark Reviewed'}
                          </button>
                        )}
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(application.id)}
                          disabled={deletingId === application.id}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete application"
                        >
                          {deletingId === application.id ? (
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
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

      {/* Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Candidate Profile</h2>
              <button
                onClick={() => setViewingProfile(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {viewingProfile.seeker_details.avatar ? (
                    <img 
                      src={viewingProfile.seeker_details.avatar} 
                      alt={viewingProfile.seeker_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    viewingProfile.seeker_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingProfile.seeker_name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{viewingProfile.seeker_email}</p>
                  {viewingProfile.seeker_details.location && (
                    <p className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {viewingProfile.seeker_details.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <a href={`mailto:${viewingProfile.seeker_email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {viewingProfile.seeker_email}
                    </a>
                  </div>
                  {viewingProfile.seeker_details.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <a href={`tel:${viewingProfile.seeker_details.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {viewingProfile.seeker_details.phone}
                      </a>
                    </div>
                  )}
                  {viewingProfile.seeker_details.linkedin && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <a href={viewingProfile.seeker_details.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {viewingProfile.seeker_details.github && (
                    <div className="flex items-center text-sm">
                      <Github className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <a href={viewingProfile.seeker_details.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {viewingProfile.seeker_details.portfolio && (
                    <div className="flex items-center text-sm">
                      <Link className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <a href={viewingProfile.seeker_details.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                        Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {viewingProfile.seeker_details.bio && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{viewingProfile.seeker_details.bio}</p>
                </div>
              )}

              {/* Skills */}
              {viewingProfile.seeker_details.skills && viewingProfile.seeker_details.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProfile.seeker_details.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {viewingProfile.seeker_details.experience && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Experience
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {viewingProfile.seeker_details.experience}
                  </p>
                </div>
              )}

              {/* Education */}
              {viewingProfile.seeker_details.education && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Education
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {viewingProfile.seeker_details.education}
                  </p>
                </div>
              )}

              {/* Cover Letter for this application */}
              {viewingProfile.cover_letter && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cover Letter for {viewingProfile.job_details.title}</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {viewingProfile.cover_letter}
                    </p>
                  </div>
                </div>
              )}

              {/* Application Info */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Application Details</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p><span className="font-medium">Applied for:</span> {viewingProfile.job_details.title}</p>
                  <p><span className="font-medium">Applied on:</span> {new Date(viewingProfile.applied_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(viewingProfile.status)}`}>
                      {viewingProfile.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setViewingProfile(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${viewingProfile.seeker_email}`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Candidate
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
