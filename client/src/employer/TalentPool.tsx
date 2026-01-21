import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, UserPlus, MapPin, Briefcase, Star, StarOff, Mail, ExternalLink, Filter, GraduationCap, Code, Loader2, X, Linkedin, Github, Globe, Phone } from 'lucide-react';
import { fetchSeekers, UserProfile } from '../API/profileApi';
import { useSavedCandidatesStore } from '../stores/savedCandidatesStore';

interface Candidate {
  id: number;
  name: string;
  title: string;
  location: string;
  avatar: string;
  skills: string[];
  experience: string;
  education: string;
  matchScore: number;
  isShortlisted: boolean;
  email: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  phone?: string;
}

// Profile Modal Component
const ProfileModal: React.FC<{
  candidate: Candidate | null;
  onClose: () => void;
  onToggleShortlist: (id: number) => void;
}> = ({ candidate, onClose, onToggleShortlist }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            
            <div className="flex items-center space-x-4">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
              />
              <div className="text-white">
                <h2 className="text-2xl font-bold">{candidate.name}</h2>
                <p className="text-blue-100">{candidate.title}</p>
                <div className="flex items-center mt-1 text-blue-100">
                  <MapPin className="h-4 w-4 mr-1" />
                  {candidate.location}
                </div>
              </div>
            </div>
            
            {/* Match Score Badge */}
            <div className="absolute top-4 left-6 bg-white rounded-full px-3 py-1 shadow-lg">
              <span className="text-lg font-bold text-blue-600">{candidate.matchScore}%</span>
              <span className="text-xs text-gray-500 ml-1">Match</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[50vh]">
            {/* Bio */}
            {candidate.bio && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{candidate.bio}</p>
              </div>
            )}

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.length > 0 ? (
                  candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No skills listed</span>
                )}
              </div>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-700">Experience</h3>
                </div>
                <p className="text-gray-600">{candidate.experience}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-700">Education</h3>
                </div>
                <p className="text-gray-600">{candidate.education}</p>
              </div>
            </div>

            {/* Contact & Links */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact & Links</h3>
              <div className="space-y-2">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  {candidate.email}
                </a>
                {candidate.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-4 w-4 mr-3 text-gray-400" />
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
                {candidate.github && (
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Github className="h-4 w-4 mr-3 text-gray-400" />
                    GitHub Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
                {candidate.portfolio && (
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Globe className="h-4 w-4 mr-3 text-gray-400" />
                    Portfolio Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => onToggleShortlist(candidate.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                candidate.isShortlisted
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className={`h-5 w-5 mr-2 ${candidate.isShortlisted ? 'fill-yellow-500' : ''}`} />
              {candidate.isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
            </button>
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Message
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TalentPool: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Use saved candidates store
  const { addCandidate, removeCandidate, isShortlisted, fetchCandidates: fetchSavedCandidates, savedCandidates } = useSavedCandidatesStore();

  // Fetch saved candidates on mount
  useEffect(() => {
    fetchSavedCandidates();
  }, [fetchSavedCandidates]);

  // Fetch seekers from API
  useEffect(() => {
    const loadSeekers = async () => {
      try {
        setLoading(true);
        setError(null);
        const seekers = await fetchSeekers();
        
        // Map UserProfile to Candidate format
        const mappedCandidates: Candidate[] = seekers.map((seeker: UserProfile) => ({
          id: seeker.id,
          name: seeker.name || seeker.username,
          title: seeker.bio?.split('\n')[0] || 'Job Seeker',
          location: seeker.location || 'Not specified',
          avatar: seeker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seeker.name || seeker.username)}&background=6366f1&color=fff`,
          skills: seeker.skills || [],
          experience: seeker.experience || 'Not specified',
          education: seeker.education || 'Not specified',
          matchScore: Math.floor(Math.random() * 30) + 70, // Random score for now (70-100)
          isShortlisted: isShortlisted(seeker.id),
          email: seeker.email,
          bio: seeker.bio,
          linkedin: seeker.linkedin,
          github: seeker.github,
          portfolio: seeker.portfolio,
          phone: seeker.phone,
        }));
        
        setCandidates(mappedCandidates);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };
    
    loadSeekers();
  }, [savedCandidates]);

  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills)));

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = skillFilter === 'all' || candidate.skills.includes(skillFilter);
    const matchesShortlist = !showShortlistedOnly || candidate.isShortlisted;
    return matchesSearch && matchesSkill && matchesShortlist;
  });

  const toggleShortlist = async (id: number) => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    try {
      if (candidate.isShortlisted) {
        // Remove from saved candidates
        await removeCandidate(id);
      } else {
        // Add to saved candidates
        await addCandidate({
          id: candidate.id,
          name: candidate.name,
          title: candidate.title,
          location: candidate.location,
          avatar: candidate.avatar,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education,
          matchScore: candidate.matchScore,
          email: candidate.email,
          bio: candidate.bio,
          linkedin: candidate.linkedin,
          github: candidate.github,
          portfolio: candidate.portfolio,
          phone: candidate.phone,
        });
      }

      // Update local state
      setCandidates(prev =>
        prev.map(c => c.id === id ? { ...c, isShortlisted: !c.isShortlisted } : c)
      );
    } catch (err) {
      console.error('Failed to toggle shortlist:', err);
    }
  };



  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Talent Pool</h1>
            <p className="text-sm sm:text-base text-gray-600">Discover and connect with top candidates</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs sm:text-sm text-gray-500">
              {candidates.filter(c => c.isShortlisted).length} shortlisted
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading candidates...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search by name, title, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
                  showShortlistedOnly
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className={`h-4 w-4 mr-1 ${showShortlistedOnly ? 'fill-yellow-500' : ''}`} />
                Shortlisted
              </button>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredCandidates.length === 0 ? (
            <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <UserPlus className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredCandidates.map(candidate => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                        onClick={() => setSelectedCandidate(candidate)}
                      />
                      <div className="min-w-0">
                        <h3 
                          onClick={() => setSelectedCandidate(candidate)}
                          className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate"
                        >
                          {candidate.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 truncate">{candidate.title}</p>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          {candidate.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <button
                        onClick={() => toggleShortlist(candidate.id)}
                        className={`p-2 rounded-full transition-colors ${
                          candidate.isShortlisted
                            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                        }`}
                      >
                        {candidate.isShortlisted ? (
                          <Star className="h-5 w-5 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex items-center">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">{candidate.matchScore}%</span>
                          <p className="text-xs text-gray-500">Match</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                      {candidate.experience} experience
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{candidate.education}</span>
                    </div>
                    <div className="flex items-start text-xs sm:text-sm text-gray-600">
                      <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="px-1.5 sm:px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{candidate.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {(candidate.linkedin || candidate.github || candidate.portfolio) && (
                    <div className="mt-3 flex items-center space-x-3">
                      {candidate.linkedin && (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.github && (
                        <a
                          href={candidate.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.portfolio && (
                        <a
                          href={candidate.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="Portfolio"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3">
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <a 
                          href={`mailto:${candidate.email}`}
                          className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                        >
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Contact
                        </a>
                        <button 
                          onClick={() => setSelectedCandidate(candidate)}
                          className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}
      </div>

      {/* Profile Modal */}
      {selectedCandidate && (
        <ProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onToggleShortlist={(id) => {
            toggleShortlist(id);
            // Update the selected candidate's shortlist status
            setSelectedCandidate(prev => 
              prev ? { ...prev, isShortlisted: !prev.isShortlisted } : null
            );
          }}
        />
      )}
    </Layout>
  );
};
