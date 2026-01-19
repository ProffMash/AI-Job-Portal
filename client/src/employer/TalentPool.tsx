import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Search, UserPlus, MapPin, Briefcase, Star, StarOff, Mail, ExternalLink, Filter, GraduationCap, Code } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  skills: string[];
  experience: string;
  education: string;
  matchScore: number;
  isShortlisted: boolean;
  availability: 'immediate' | '2weeks' | '1month' | 'negotiable';
}

// Mock candidates data
const mockCandidates: Candidate[] = [
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
    isShortlisted: false,
    availability: 'immediate'
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
    isShortlisted: true,
    availability: '2weeks'
  },
  {
    id: '3',
    name: 'James Wilson',
    title: 'Backend Engineer',
    location: 'Seattle, WA',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=f59e0b&color=fff',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
    experience: '6 years',
    education: 'BS Software Engineering, UW',
    matchScore: 82,
    isShortlisted: false,
    availability: '1month'
  },
  {
    id: '4',
    name: 'Sarah Chen',
    title: 'DevOps Engineer',
    location: 'Remote',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ef4444&color=fff',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    experience: '4 years',
    education: 'BS Computer Engineering, MIT',
    matchScore: 79,
    isShortlisted: true,
    availability: 'negotiable'
  },
  {
    id: '5',
    name: 'David Kim',
    title: 'Mobile Developer',
    location: 'Los Angeles, CA',
    avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
    experience: '5 years',
    education: 'BS Computer Science, UCLA',
    matchScore: 75,
    isShortlisted: false,
    availability: 'immediate'
  },
  {
    id: '6',
    name: 'Emily Brown',
    title: 'Data Scientist',
    location: 'Boston, MA',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Brown&background=06b6d4&color=fff',
    skills: ['Python', 'TensorFlow', 'SQL', 'Machine Learning', 'Statistics'],
    experience: '4 years',
    education: 'PhD Data Science, Harvard',
    matchScore: 71,
    isShortlisted: false,
    availability: '2weeks'
  }
];

export const TalentPool: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);

  const allSkills = Array.from(new Set(mockCandidates.flatMap(c => c.skills)));

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = skillFilter === 'all' || candidate.skills.includes(skillFilter);
    const matchesShortlist = !showShortlistedOnly || candidate.isShortlisted;
    return matchesSearch && matchesSkill && matchesShortlist;
  });

  const toggleShortlist = (id: string) => {
    setCandidates(prev =>
      prev.map(c => c.id === id ? { ...c, isShortlisted: !c.isShortlisted } : c)
    );
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'immediate':
        return 'bg-green-100 text-green-700';
      case '2weeks':
        return 'bg-blue-100 text-blue-700';
      case '1month':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'immediate':
        return 'Available Immediately';
      case '2weeks':
        return 'Available in 2 Weeks';
      case '1month':
        return 'Available in 1 Month';
      default:
        return 'Negotiable';
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
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex-shrink-0"
                      />
                      <div className="min-w-0">
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

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(candidate.availability)}`}>
                        {getAvailabilityText(candidate.availability)}
                      </span>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Contact
                        </button>
                        <button className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
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
      </div>
    </Layout>
  );
};
