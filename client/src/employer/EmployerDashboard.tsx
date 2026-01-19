import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useJobsStore } from '../stores/jobsStore';
import { Job } from '../types';
import { Plus, Briefcase, Users, Eye, X, Save, Edit2, Trash2, MapPin, Clock, DollarSign, AlertTriangle } from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { jobs, getApplicationsForEmployer, addJob, updateJob, deleteJob } = useJobsStore();
  
  // Modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  const employerJobs = jobs.filter(job => job.postedBy === user?.id);
  const applications = getApplicationsForEmployer(user?.id || '');
  const totalApplicants = employerJobs.reduce((sum, job) => sum + job.applicantCount, 0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'remote'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: user?.company || '',
      location: '',
      description: '',
      requirements: '',
      salary: '',
      type: 'full-time'
    });
    setErrors({});
    setEditingJob(null);
  };

  // Open modal for creating new job
  const handleOpenCreateModal = () => {
    resetForm();
    setShowJobModal(true);
  };

  // Open modal for editing existing job
  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements.join(', '),
      salary: job.salary || '',
      type: job.type
    });
    setErrors({});
    setShowJobModal(true);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (job: Job) => {
    setDeletingJob(job);
    setShowDeleteModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const requirementsArray = formData.requirements
      .split(',')
      .map(req => req.trim())
      .filter(req => req.length > 0);

    if (editingJob) {
      // Update existing job
      updateJob(editingJob.id, {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        requirements: requirementsArray,
        salary: formData.salary || undefined,
        type: formData.type
      });
    } else {
      // Create new job
      addJob({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        requirements: requirementsArray,
        salary: formData.salary || undefined,
        type: formData.type,
        postedBy: user?.id || ''
      });
    }

    setShowJobModal(false);
    resetForm();
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (deletingJob) {
      deleteJob(deletingJob.id);
      setShowDeleteModal(false);
      setDeletingJob(null);
    }
  };

  const handleCloseJobModal = () => {
    setShowJobModal(false);
    resetForm();
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingJob(null);
  };

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
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Employer Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your job postings and review applications
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Post New Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{employerJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => {
                const job = jobs.find(j => j.id === application.jobId);
                return (
                  <div key={application.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{application.seekerName}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Applied for: {job?.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Job Postings</h2>
        </div>

        <div className="space-y-6">
          {employerJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-4">
                Start by posting your first job opportunity
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            employerJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-base sm:text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                    <div className="flex flex-wrap items-center text-gray-500 text-xs sm:text-sm gap-2 sm:gap-4">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {formatDate(job.postedAt)}
                      </div>
                      {job.salary && (
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:space-y-2 w-full sm:w-auto justify-between sm:justify-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.type === 'remote' ? 'bg-green-100 text-green-800' :
                      job.type === 'full-time' ? 'bg-blue-100 text-blue-800' :
                      job.type === 'part-time' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {job.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {job.applicantCount} applicants
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.slice(0, 5).map((req, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                        +{job.requirements.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(job)}
                    className="flex items-center justify-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm sm:text-base"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(job)}
                    className="flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingJob ? 'Edit Job Posting' : 'Post a New Job'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {editingJob ? 'Update the job details below' : 'Fill out the details to create a new job posting'}
                </p>
              </div>
              <button
                onClick={handleCloseJobModal}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g. Senior React Developer"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g. TechCorp Inc."
                  />
                  {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (Optional)
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.requirements ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="List the required skills, experience, and qualifications (comma-separated)"
                />
                {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Separate each requirement with a comma (e.g. React, TypeScript, 3+ years experience)
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseJobModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingJob ? 'Save Changes' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Job Posting
              </h3>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete this job posting?
              </p>
              <p className="text-gray-900 font-medium text-center mb-4">
                "{deletingJob.title}"
              </p>
              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone. All {deletingJob.applicantCount} applications for this job will also be removed.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
