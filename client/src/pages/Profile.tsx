import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { User as UserType } from '../types';
import { User, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, CreditCard as Edit3, Save, X, Plus, Linkedin, Github, ExternalLink, Building, Loader2, AtSign, Calendar } from 'lucide-react';
import { updateProfile as apiUpdateProfile, uploadAvatar, UpdateProfileData } from '../API/profileApi';
import { clearSeekerRecommendationsCache, clearApplicantScoresCache } from '../API/aiRecommendationApi';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType | undefined>(user ?? undefined);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user || !editedUser) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Map frontend field names to backend field names
      const profileData: UpdateProfileData = {
        name: editedUser.name,
        bio: editedUser.bio,
        location: editedUser.location,
        phone: editedUser.phone,
        website: editedUser.website,
        skills: editedUser.skills,
        experience: editedUser.experience,
        education: editedUser.education,
        linkedin: editedUser.linkedin,
        github: editedUser.github,
        portfolio: editedUser.portfolio,
        company: editedUser.company,
        company_size: editedUser.companySize,
        industry: editedUser.industry,
        founded: editedUser.founded,
      };

      const updatedProfile = await apiUpdateProfile(user.id, profileData);
      
      // Map backend response to frontend User type
      const updatedUser: Partial<UserType> = {
        username: updatedProfile.username,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        location: updatedProfile.location,
        phone: updatedProfile.phone,
        website: updatedProfile.website,
        skills: updatedProfile.skills,
        experience: updatedProfile.experience,
        education: updatedProfile.education,
        linkedin: updatedProfile.linkedin,
        github: updatedProfile.github,
        portfolio: updatedProfile.portfolio,
        company: updatedProfile.company,
        companySize: updatedProfile.company_size,
        industry: updatedProfile.industry,
        founded: updatedProfile.founded,
        avatar: updatedProfile.avatar,
        isActive: updatedProfile.is_active,
        createdAt: updatedProfile.created_at,
      };

      updateProfile(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear AI recommendation caches since profile has changed
      clearSeekerRecommendationsCache();
      clearApplicantScoresCache();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join('. ') ||
        'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedProfile = await uploadAvatar(file);
      updateProfile({ avatar: updatedProfile.avatar });
      setEditedUser(prev => prev ? ({ ...prev, avatar: updatedProfile.avatar }) : prev);
      setSuccessMessage('Avatar updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to upload avatar. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // resume upload removed

  const handleCancel = () => {
    setEditedUser(user ?? undefined);
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (field: keyof UserType, value: string) => {
    setEditedUser(prev => prev ? ({ ...prev, [field]: value }) : prev);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedUser.skills?.includes(newSkill.trim())) {
      setEditedUser(prev => prev ? ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }) : prev);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditedUser(prev => prev ? ({
      ...prev,
      skills: prev.skills?.filter((skill: string) => skill !== skillToRemove) || []
    }) : prev);
  };

  const isSeeker = user.role === 'seeker';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    className="h-24 w-24 rounded-full mx-auto mb-4"
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=96`}
                    alt={user.name}
                  />
                  {isEditing && (
                    <label className="absolute bottom-3 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Edit3 className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={isSaving}
                      />
                    </label>
                  )}
                </div>
                {/* Resume feature removed */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl font-bold text-gray-900 text-center w-full border border-gray-300 rounded-md px-2 py-1 mb-2"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{user.name}</h2>
                )}

                {user.username && (
                  <div className="flex items-center justify-center text-gray-500 mb-2">
                    <AtSign className="h-3 w-3 mr-1" />
                    <span className="text-sm">{user.username}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span className="capitalize">{user.role}</span>
                </div>

                {isEditing ? (
                  <textarea
                    value={editedUser.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full text-gray-600 text-center border border-gray-300 rounded-md px-3 py-2 h-20 resize-none"
                  />
                ) : (
                  <p className="text-gray-600 text-center">{user.bio}</p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{user.email}</span>
                </div>
                
                {(user.phone || isEditing) && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Phone number"
                        className="text-sm flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <span className="text-sm">{user.phone}</span>
                    )}
                  </div>
                )}

                {(user.location || isEditing) && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Location"
                        className="text-sm flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <span className="text-sm">{user.location}</span>
                    )}
                  </div>
                )}

                {(user.website || isEditing) && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-3 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedUser.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="Website URL"
                        className="text-sm flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                        {user.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(user.linkedin || user.github || user.portfolio || isEditing) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Links</h3>
                  <div className="space-y-2">
                    {(user.linkedin || isEditing) && (
                      <div className="flex items-center">
                        <Linkedin className="h-4 w-4 mr-3 text-blue-600 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="url"
                            value={editedUser.linkedin || ''}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            placeholder="LinkedIn URL"
                            className="text-sm flex-1 border border-gray-300 rounded-md px-2 py-1"
                          />
                        ) : (
                          <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    )}

                    {isSeeker && (user.github || isEditing) && (
                      <div className="flex items-center">
                        <Github className="h-4 w-4 mr-3 text-gray-700 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="url"
                            value={editedUser.github || ''}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            placeholder="GitHub URL"
                            className="text-sm flex-1 border border-gray-300 rounded-md px-2 py-1"
                          />
                        ) : (
                          <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            GitHub
                          </a>
                        )}
                      </div>
                    )}

                    {isSeeker && (user.portfolio || isEditing) && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="url"
                            value={editedUser.portfolio || ''}
                            onChange={(e) => handleInputChange('portfolio', e.target.value)}
                            placeholder="Portfolio URL"
                            className="text-sm flex-1 border border-gray-300 rounded-md px-2 py-1"
                          />
                        ) : (
                          <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            Portfolio
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Member Since */}
              {user.createdAt && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section (Job Seekers) */}
            {isSeeker && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Skills
                </h3>
                
                {isEditing && (
                  <div className="mb-4 flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      onClick={addSkill}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(editedUser.skills || user.skills || []).map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center ${
                        isEditing ? 'pr-1' : ''
                      }`}
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section (Job Seekers) */}
            {isSeeker && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experience
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.experience || ''}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Years of experience"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-600">{user.experience || 'Not specified'}</p>
                )}
              </div>
            )}

            {/* Education Section (Job Seekers) */}
            {isSeeker && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedUser.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="Your educational background"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-20 resize-none"
                  />
                ) : (
                  <p className="text-gray-600">{user.education || 'Not specified'}</p>
                )}
              </div>
            )}

            {/* Company Information (Employers) */}
            {!isSeeker && (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      ) : (
                        <p className="text-gray-600">{user.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.industry || ''}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          placeholder="e.g. Technology, Healthcare"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      ) : (
                        <p className="text-gray-600">{user.industry || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                      {isEditing ? (
                        <select
                          value={editedUser.companySize || ''}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="">Select size</option>
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-200 employees">51-200 employees</option>
                          <option value="201-500 employees">201-500 employees</option>
                          <option value="500-1000 employees">500-1000 employees</option>
                          <option value="1000+ employees">1000+ employees</option>
                        </select>
                      ) : (
                        <p className="text-gray-600">{user.companySize || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Founded</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.founded || ''}
                          onChange={(e) => handleInputChange('founded', e.target.value)}
                          placeholder="e.g. 2015"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      ) : (
                        <p className="text-gray-600">{user.founded || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};