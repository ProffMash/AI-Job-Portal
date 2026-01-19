import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Star, StarOff, MapPin, Briefcase, Mail, ExternalLink, Search, Filter, Trash2, GraduationCap, Code, Clock } from 'lucide-react';

interface SavedCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  skills: string[];
  experience: string;
  education: string;
  matchScore: number;
  savedAt: Date;
  appliedFor?: string;
  notes?: string;
}

// Mock saved candidates data
const mockSavedCandidates: SavedCandidate[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    title: 'Senior Full Stack Developer',
    location: 'San Francisco, CA',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Thompson&background=6366f1&color=fff',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    experience: '7 years',
    education: 'MS Computer Science, Stanford',
    matchScore: 95,
    savedAt: new Date('2026-01-18'),
    appliedFor: 'Senior React Developer',
    notes: 'Strong technical background, excellent communication skills'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    title: 'Frontend Developer',
    location: 'Austin, TX',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=10b981&color=fff',
    skills: ['React', 'Vue.js', 'CSS', 'JavaScript', 'Figma'],
    experience: '5 years',
    education: 'BS Computer Science, UT Austin',
    matchScore: 88,
    savedAt: new Date('2026-01-17'),
    appliedFor: 'UI Developer'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    title: 'DevOps Engineer',
    location: 'Remote',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ef4444&color=fff',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    experience: '4 years',
    education: 'BS Computer Engineering, MIT',
    matchScore: 79,
    savedAt: new Date('2026-01-15'),
    notes: 'Great portfolio, considering for Cloud Engineer role'
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Mobile Developer',
    location: 'Los Angeles, CA',
    avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
    experience: '5 years',
    education: 'BS Computer Science, UCLA',
    matchScore: 75,
    savedAt: new Date('2026-01-12')
  }
];

export const SavedCandidates: React.FC = () => {
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>(mockSavedCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  const allSkills = Array.from(new Set(mockSavedCandidates.flatMap(c => c.skills)));

  const filteredCandidates = savedCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = skillFilter === 'all' || candidate.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  const removeCandidate = (id: string) => {
    setSavedCandidates(prev => prev.filter(c => c.id !== id));
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Saved Candidates</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {savedCandidates.length} candidate{savedCandidates.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="flex items-center text-yellow-600">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-yellow-500" />
            <span className="text-sm sm:text-base font-medium">{savedCandidates.length} Shortlisted</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search saved candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
          </div>
        </div>

        {/* Saved Candidates List */}
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <StarOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved candidates</h3>
              <p className="text-gray-600">
                {searchTerm || skillFilter !== 'all'
                  ? 'No candidates match your search criteria.'
                  : 'Save candidates you\'re interested in to view them later.'}
              </p>
            </div>
          ) : (
            filteredCandidates.map(candidate => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                              {candidate.name}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 truncate">{candidate.title}</p>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {candidate.location}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
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
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{candidate.skills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {candidate.appliedFor && (
                          <div className="mt-3">
                            <span className="text-sm text-blue-600">
                              Applied for: {candidate.appliedFor}
                            </span>
                          </div>
                        )}

                        {candidate.notes && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Notes:</span> {candidate.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">{candidate.matchScore}%</span>
                          <p className="text-xs text-gray-500">Match</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Saved {getDaysAgo(candidate.savedAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeCandidate(candidate.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:space-x-3">
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Contact
                      </button>
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        View Profile
                      </button>
                    </div>
                    <div className="flex items-center justify-end text-yellow-500">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500" />
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
