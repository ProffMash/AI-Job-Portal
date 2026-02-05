import { Job } from './jobApi';
import { UserProfile } from './profileApi';

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const HF_MODEL = import.meta.env.VITE_HF_MODEL;

// Cache keys
const SEEKER_CACHE_KEY = 'ai_job_recommendations_cache';
const EMPLOYER_CACHE_KEY = 'ai_applicant_scores_cache';

// Generate a hash for cache invalidation
function generateHash(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Cache interface
interface CachedRecommendations {
  profileHash: string;
  jobsHash: string;
  recommendations: AIJobRecommendation[];
  timestamp: number;
}

interface CachedApplicantScores {
  applicationsHash: string;
  scores: { [key: number]: ApplicantMatchResult };
  timestamp: number;
}

// Get cached seeker recommendations
function getCachedRecommendations(profileHash: string, jobsHash: string): AIJobRecommendation[] | null {
  try {
    const cached = localStorage.getItem(SEEKER_CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedRecommendations = JSON.parse(cached);
    
    // Check if hashes match (profile and jobs haven't changed)
    if (data.profileHash === profileHash && data.jobsHash === jobsHash) {
      return data.recommendations;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Save seeker recommendations to cache
function cacheRecommendations(profileHash: string, jobsHash: string, recommendations: AIJobRecommendation[]): void {
  try {
    const data: CachedRecommendations = {
      profileHash,
      jobsHash,
      recommendations,
      timestamp: Date.now()
    };
    localStorage.setItem(SEEKER_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to cache recommendations:', err);
  }
}

// Get cached employer applicant scores
function getCachedApplicantScores(applicationsHash: string): Map<number, ApplicantMatchResult> | null {
  try {
    const cached = localStorage.getItem(EMPLOYER_CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedApplicantScores = JSON.parse(cached);
    
    // Check if hash matches (applications haven't changed)
    if (data.applicationsHash === applicationsHash) {
      return new Map(Object.entries(data.scores).map(([k, v]) => [parseInt(k), v]));
    }
    
    return null;
  } catch {
    return null;
  }
}

// Save employer applicant scores to cache
function cacheApplicantScores(applicationsHash: string, scores: Map<number, ApplicantMatchResult>): void {
  try {
    const scoresObj: { [key: number]: ApplicantMatchResult } = {};
    scores.forEach((value, key) => {
      scoresObj[key] = value;
    });
    
    const data: CachedApplicantScores = {
      applicationsHash,
      scores: scoresObj,
      timestamp: Date.now()
    };
    localStorage.setItem(EMPLOYER_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to cache applicant scores:', err);
  }
}

// Clear seeker cache (call when profile is updated)
export function clearSeekerRecommendationsCache(): void {
  try {
    localStorage.removeItem(SEEKER_CACHE_KEY);
  } catch {
    // Ignore errors
  }
}

// Clear employer cache (call when needed)
export function clearApplicantScoresCache(): void {
  try {
    localStorage.removeItem(EMPLOYER_CACHE_KEY);
  } catch {
    // Ignore errors
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Get embeddings from Hugging Face API
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: texts,
        options: { wait_for_model: true }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Hugging Face API error:', errorText);
    throw new Error('Failed to get embeddings from AI model');
  }

  const data = await response.json();
  return data;
}

// Create a profile summary text for embedding
function createProfileSummary(profile: UserProfile): string {
  const parts: string[] = [];
  
  if (profile.skills && profile.skills.length > 0) {
    parts.push(`Skills: ${profile.skills.join(', ')}`);
  }
  
  if (profile.experience) {
    parts.push(`Experience: ${profile.experience}`);
  }
  
  if (profile.education) {
    parts.push(`Education: ${profile.education}`);
  }
  
  if (profile.bio) {
    parts.push(`About: ${profile.bio}`);
  }
  
  return parts.join('. ') || 'No profile information available';
}

// Create a job summary text for embedding
function createJobSummary(job: Job): string {
  const parts: string[] = [];
  
  parts.push(`Job Title: ${job.title}`);
  parts.push(`Company: ${job.company}`);
  
  if (job.description) {
    parts.push(`Description: ${job.description}`);
  }
  
  if (job.requirements && job.requirements.length > 0) {
    parts.push(`Requirements: ${job.requirements.join(', ')}`);
  }
  
  parts.push(`Type: ${job.type}`);
  parts.push(`Location: ${job.location}`);
  
  return parts.join('. ');
}

export interface AIJobRecommendation {
  job: Job;
  matchScore: number;
  matchReason: string;
}

// Get AI-powered job recommendations based on seeker profile
export async function getAIJobRecommendations(
  profile: UserProfile,
  jobs: Job[]
): Promise<AIJobRecommendation[]> {
  if (!jobs || jobs.length === 0) {
    return [];
  }

  // Generate hashes for cache lookup
  const profileData = {
    skills: profile.skills,
    experience: profile.experience,
    education: profile.education,
    bio: profile.bio
  };
  const profileHash = generateHash(profileData);
  
  const jobsData = jobs.map(j => ({
    id: j.id,
    title: j.title,
    requirements: j.requirements,
    description: j.description
  }));
  const jobsHash = generateHash(jobsData);

  // Check cache first
  const cached = getCachedRecommendations(profileHash, jobsHash);
  if (cached) {
    console.log('Using cached AI recommendations');
    // Re-attach job objects to cached recommendations
    return cached.map(rec => {
      const job = jobs.find(j => j.id === rec.job.id);
      return job ? { ...rec, job } : rec;
    }).filter(rec => rec.job);
  }

  try {
    // Create text summaries
    const profileSummary = createProfileSummary(profile);
    const jobSummaries = jobs.map(job => createJobSummary(job));
    
    // Get all embeddings in one API call
    const allTexts = [profileSummary, ...jobSummaries];
    const embeddings = await getEmbeddings(allTexts);
    
    // Profile embedding is the first one
    const profileEmbedding = embeddings[0];
    
    // Calculate similarity scores for each job
    const recommendations: AIJobRecommendation[] = jobs.map((job, index) => {
      const jobEmbedding = embeddings[index + 1];
      const similarity = cosineSimilarity(profileEmbedding, jobEmbedding);
      
      // Convert similarity (-1 to 1) to percentage (0 to 100)
      const matchScore = Math.round((similarity + 1) * 50);
      
      // Generate match reason based on profile and job
      const matchReason = generateMatchReason(profile, job, matchScore);
      
      return {
        job,
        matchScore: Math.min(100, Math.max(0, matchScore)),
        matchReason
      };
    });
    
    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    // Cache the results
    cacheRecommendations(profileHash, jobsHash, recommendations);
    
    return recommendations;
  } catch (error) {
    console.error('AI recommendation error:', error);
    // Fallback to basic matching if AI fails
    return getFallbackRecommendations(profile, jobs);
  }
}

// Generate a human-readable match reason
function generateMatchReason(profile: UserProfile, job: Job, score: number): string {
  const reasons: string[] = [];
  
  // Check skill matches
  if (profile.skills && job.requirements) {
    const matchingSkills = profile.skills.filter(skill =>
      job.requirements.some(req =>
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
    
    if (matchingSkills.length > 0) {
      reasons.push(`Your skills (${matchingSkills.slice(0, 3).join(', ')}) match this role`);
    }
  }
  
  // Check experience level hints
  if (profile.experience && job.description) {
    const expKeywords = ['senior', 'junior', 'mid', 'lead', 'principal', 'entry'];
    const profileExp = profile.experience.toLowerCase();
    const jobDesc = job.description.toLowerCase();
    
    for (const keyword of expKeywords) {
      if (profileExp.includes(keyword) && jobDesc.includes(keyword)) {
        reasons.push(`Experience level matches`);
        break;
      }
    }
  }
  
  // Generic reason based on score
  if (reasons.length === 0) {
    if (score >= 80) {
      reasons.push('Excellent profile-job alignment detected by AI');
    } else if (score >= 60) {
      reasons.push('Good compatibility based on your background');
    } else if (score >= 40) {
      reasons.push('Moderate match - could be a growth opportunity');
    } else {
      reasons.push('Explore this role for career diversification');
    }
  }
  
  return reasons.join('. ');
}

// Fallback recommendations if AI API fails
function getFallbackRecommendations(profile: UserProfile, jobs: Job[]): AIJobRecommendation[] {
  return jobs.map(job => {
    let matchScore = 30; // Base score
    const reasons: string[] = [];
    
    // Skill-based matching
    if (profile.skills && job.requirements) {
      const skillMatches = profile.skills.filter(skill =>
        job.requirements.some(req =>
          req.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(req.toLowerCase())
        )
      ).length;
      
      const skillScore = job.requirements.length > 0 
        ? (skillMatches / job.requirements.length) * 50 
        : 0;
      matchScore += skillScore;
      
      if (skillMatches > 0) {
        reasons.push(`${skillMatches} skill${skillMatches > 1 ? 's' : ''} match`);
      }
    }
    
    // Location preference (if mentioned in bio or profile)
    if (profile.location && job.location) {
      if (job.location.toLowerCase().includes(profile.location.toLowerCase()) ||
          profile.location.toLowerCase().includes(job.location.toLowerCase())) {
        matchScore += 10;
        reasons.push('Location matches');
      }
    }
    
    // Remote preference
    if (job.type === 'remote') {
      matchScore += 5;
    }
    
    return {
      job,
      matchScore: Math.min(100, Math.max(0, Math.round(matchScore))),
      matchReason: reasons.length > 0 ? reasons.join('. ') : 'Potential opportunity'
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// Quick check if AI service is available
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: ['test'],
          options: { wait_for_model: true }
        }),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

// Interface for applicant matching (employer view)
export interface ApplicantMatchResult {
  applicationId: number;
  matchScore: number;
  matchReason: string;
  matchingSkills: string[];
}

// Create a seeker profile summary from application data
function createApplicantSummary(seeker: {
  skills?: string[];
  experience?: string | null;
  education?: string | null;
  bio?: string | null;
}): string {
  const parts: string[] = [];
  
  if (seeker.skills && seeker.skills.length > 0) {
    parts.push(`Skills: ${seeker.skills.join(', ')}`);
  }
  
  if (seeker.experience) {
    parts.push(`Experience: ${seeker.experience}`);
  }
  
  if (seeker.education) {
    parts.push(`Education: ${seeker.education}`);
  }
  
  if (seeker.bio) {
    parts.push(`About: ${seeker.bio}`);
  }
  
  return parts.join('. ') || 'No profile information available';
}

// Create a job requirements summary for matching
function createJobRequirementsSummary(job: {
  title: string;
  description?: string;
  requirements?: string[];
  type?: string;
  location?: string;
}): string {
  const parts: string[] = [];
  
  parts.push(`Job Title: ${job.title}`);
  
  if (job.description) {
    parts.push(`Description: ${job.description}`);
  }
  
  if (job.requirements && job.requirements.length > 0) {
    parts.push(`Requirements: ${job.requirements.join(', ')}`);
  }
  
  if (job.type) {
    parts.push(`Type: ${job.type}`);
  }
  
  if (job.location) {
    parts.push(`Location: ${job.location}`);
  }
  
  return parts.join('. ');
}

// Calculate match scores for multiple applicants against a job
export async function getApplicantMatchScores(
  applications: Array<{
    id: number;
    seeker_details: {
      skills?: string[];
      experience?: string | null;
      education?: string | null;
      bio?: string | null;
    };
    job_details: {
      title: string;
      description?: string;
      requirements?: string[];
      type?: string;
      location?: string;
    };
  }>
): Promise<Map<number, ApplicantMatchResult>> {
  const results = new Map<number, ApplicantMatchResult>();
  
  if (!applications || applications.length === 0) {
    return results;
  }

  // Generate hash for cache lookup based on relevant application data
  const applicationsData = applications.map(app => ({
    id: app.id,
    seeker: {
      skills: app.seeker_details.skills,
      experience: app.seeker_details.experience,
      education: app.seeker_details.education,
      bio: app.seeker_details.bio
    },
    job: {
      title: app.job_details.title,
      requirements: app.job_details.requirements
    }
  }));
  const applicationsHash = generateHash(applicationsData);

  // Check cache first
  const cached = getCachedApplicantScores(applicationsHash);
  if (cached) {
    console.log('Using cached applicant scores');
    return cached;
  }

  try {
    // Group applications by job to batch process
    const jobGroups = new Map<string, typeof applications>();
    
    for (const app of applications) {
      const jobKey = JSON.stringify(app.job_details);
      if (!jobGroups.has(jobKey)) {
        jobGroups.set(jobKey, []);
      }
      jobGroups.get(jobKey)!.push(app);
    }

    // Process each job group
    for (const [jobKey, groupApps] of jobGroups) {
      const jobDetails = JSON.parse(jobKey);
      const jobSummary = createJobRequirementsSummary(jobDetails);
      
      // Create applicant summaries
      const applicantSummaries = groupApps.map(app => 
        createApplicantSummary(app.seeker_details)
      );
      
      // Get all embeddings in one API call
      const allTexts = [jobSummary, ...applicantSummaries];
      const embeddings = await getEmbeddings(allTexts);
      
      // Job embedding is the first one
      const jobEmbedding = embeddings[0];
      
      // Calculate match scores for each applicant
      groupApps.forEach((app, index) => {
        const applicantEmbedding = embeddings[index + 1];
        const similarity = cosineSimilarity(jobEmbedding, applicantEmbedding);
        
        // Convert similarity (-1 to 1) to percentage (0 to 100)
        const matchScore = Math.round((similarity + 1) * 50);
        
        // Find matching skills
        const matchingSkills = findMatchingSkills(
          app.seeker_details.skills || [],
          app.job_details.requirements || []
        );
        
        // Generate match reason
        const matchReason = generateApplicantMatchReason(
          app.seeker_details,
          app.job_details,
          matchScore,
          matchingSkills
        );
        
        results.set(app.id, {
          applicationId: app.id,
          matchScore: Math.min(100, Math.max(0, matchScore)),
          matchReason,
          matchingSkills
        });
      });
    }
    
    // Cache the results
    cacheApplicantScores(applicationsHash, results);
    
    return results;
  } catch (error) {
    console.error('AI applicant matching error:', error);
    // Fallback to basic matching
    return getFallbackApplicantScores(applications);
  }
}

// Find skills that match between seeker and job requirements
function findMatchingSkills(seekerSkills: string[], jobRequirements: string[]): string[] {
  return seekerSkills.filter(skill =>
    jobRequirements.some(req =>
      req.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(req.toLowerCase())
    )
  );
}

// Generate match reason for applicant
function generateApplicantMatchReason(
  seeker: { skills?: string[]; experience?: string | null; education?: string | null },
  job: { requirements?: string[]; title: string },
  score: number,
  matchingSkills: string[]
): string {
  const reasons: string[] = [];
  
  if (matchingSkills.length > 0) {
    reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
  }
  
  if (seeker.experience && job.requirements) {
    const expKeywords = ['senior', 'junior', 'mid', 'lead', 'principal', 'entry', 'manager'];
    const seekerExp = seeker.experience.toLowerCase();
    const jobReqs = job.requirements.join(' ').toLowerCase();
    
    for (const keyword of expKeywords) {
      if (seekerExp.includes(keyword) && jobReqs.includes(keyword)) {
        reasons.push('Experience level aligns');
        break;
      }
    }
  }
  
  if (reasons.length === 0) {
    if (score >= 80) {
      reasons.push('Excellent candidate match');
    } else if (score >= 60) {
      reasons.push('Good profile alignment');
    } else if (score >= 40) {
      reasons.push('Potential fit with some gaps');
    } else {
      reasons.push('May require additional training');
    }
  }
  
  return reasons.join('. ');
}

// Fallback scoring if AI fails
function getFallbackApplicantScores(
  applications: Array<{
    id: number;
    seeker_details: { skills?: string[] };
    job_details: { requirements?: string[] };
  }>
): Map<number, ApplicantMatchResult> {
  const results = new Map<number, ApplicantMatchResult>();
  
  for (const app of applications) {
    const seekerSkills = app.seeker_details.skills || [];
    const jobRequirements = app.job_details.requirements || [];
    
    const matchingSkills = findMatchingSkills(seekerSkills, jobRequirements);
    
    let matchScore = 30; // Base score
    
    if (jobRequirements.length > 0) {
      matchScore += (matchingSkills.length / jobRequirements.length) * 50;
    }
    
    if (seekerSkills.length > 5) {
      matchScore += 10; // Bonus for well-documented skills
    }
    
    results.set(app.id, {
      applicationId: app.id,
      matchScore: Math.min(100, Math.max(0, Math.round(matchScore))),
      matchReason: matchingSkills.length > 0 
        ? `${matchingSkills.length} skill${matchingSkills.length > 1 ? 's' : ''} match requirements`
        : 'Profile under review',
      matchingSkills
    });
  }
  
  return results;
}

// ============================================
// TALENT POOL MATCHING (for employers)
// ============================================

const TALENT_POOL_CACHE_KEY = 'ai_talent_pool_cache';

export interface TalentPoolMatchResult {
  seekerId: number;
  matchScore: number;
  matchReason: string;
  matchingSkills: string[];
  bestMatchingJob?: {
    id: number | string;
    title: string;
  };
}

interface CachedTalentPoolScores {
  seekersHash: string;
  jobsHash: string;
  scores: { [key: number]: TalentPoolMatchResult };
  timestamp: number;
}

// Get cached talent pool scores
function getCachedTalentPoolScores(seekersHash: string, jobsHash: string): Map<number, TalentPoolMatchResult> | null {
  try {
    const cached = localStorage.getItem(TALENT_POOL_CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedTalentPoolScores = JSON.parse(cached);
    
    if (data.seekersHash === seekersHash && data.jobsHash === jobsHash) {
      return new Map(Object.entries(data.scores).map(([k, v]) => [parseInt(k), v]));
    }
    
    return null;
  } catch {
    return null;
  }
}

// Save talent pool scores to cache
function cacheTalentPoolScores(seekersHash: string, jobsHash: string, scores: Map<number, TalentPoolMatchResult>): void {
  try {
    const scoresObj: { [key: number]: TalentPoolMatchResult } = {};
    scores.forEach((value, key) => {
      scoresObj[key] = value;
    });
    
    const data: CachedTalentPoolScores = {
      seekersHash,
      jobsHash,
      scores: scoresObj,
      timestamp: Date.now()
    };
    localStorage.setItem(TALENT_POOL_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to cache talent pool scores:', err);
  }
}

// Clear talent pool cache
export function clearTalentPoolCache(): void {
  try {
    localStorage.removeItem(TALENT_POOL_CACHE_KEY);
  } catch {
    // Ignore errors
  }
}

// Calculate match scores for talent pool candidates against employer's jobs
export async function getTalentPoolMatchScores(
  seekers: Array<{
    id: number;
    skills?: string[];
    experience?: string | null;
    education?: string | null;
    bio?: string | null;
  }>,
  employerJobs: Array<{
    id: number | string;
    title: string;
    description?: string;
    requirements?: string[];
    type?: string;
    location?: string;
  }>
): Promise<Map<number, TalentPoolMatchResult>> {
  const results = new Map<number, TalentPoolMatchResult>();
  
  if (!seekers || seekers.length === 0 || !employerJobs || employerJobs.length === 0) {
    // Return basic scores if no jobs to match against
    seekers.forEach(seeker => {
      results.set(seeker.id, {
        seekerId: seeker.id,
        matchScore: 50,
        matchReason: 'Add jobs to see AI match scores',
        matchingSkills: []
      });
    });
    return results;
  }

  // Generate hashes for cache
  const seekersData = seekers.map(s => ({
    id: s.id,
    skills: s.skills,
    experience: s.experience,
    education: s.education
  }));
  const seekersHash = generateHash(seekersData);
  
  const jobsData = employerJobs.map(j => ({
    id: j.id,
    title: j.title,
    requirements: j.requirements
  }));
  const jobsHash = generateHash(jobsData);

  // Check cache first
  const cached = getCachedTalentPoolScores(seekersHash, jobsHash);
  if (cached) {
    console.log('Using cached talent pool scores');
    return cached;
  }

  try {
    // Create job summaries
    const jobSummaries = employerJobs.map(job => createJobRequirementsSummary(job));
    
    // Create seeker summaries
    const seekerSummaries = seekers.map(seeker => createApplicantSummary(seeker));
    
    // Get all embeddings - jobs first, then seekers
    const allTexts = [...jobSummaries, ...seekerSummaries];
    const embeddings = await getEmbeddings(allTexts);
    
    const jobEmbeddings = embeddings.slice(0, employerJobs.length);
    const seekerEmbeddings = embeddings.slice(employerJobs.length);
    
    // For each seeker, find the best matching job
    seekers.forEach((seeker, seekerIndex) => {
      const seekerEmbedding = seekerEmbeddings[seekerIndex];
      
      let bestScore = 0;
      let bestJobIndex = 0;
      
      // Compare against each job
      jobEmbeddings.forEach((jobEmbedding, jobIndex) => {
        const similarity = cosineSimilarity(seekerEmbedding, jobEmbedding);
        const score = Math.round((similarity + 1) * 50);
        
        if (score > bestScore) {
          bestScore = score;
          bestJobIndex = jobIndex;
        }
      });
      
      const bestJob = employerJobs[bestJobIndex];
      
      // Find matching skills for best job
      const matchingSkills = findMatchingSkills(
        seeker.skills || [],
        bestJob.requirements || []
      );
      
      // Generate match reason
      const matchReason = generateTalentPoolMatchReason(bestJob, bestScore, matchingSkills);
      
      results.set(seeker.id, {
        seekerId: seeker.id,
        matchScore: Math.min(100, Math.max(0, bestScore)),
        matchReason,
        matchingSkills,
        bestMatchingJob: {
          id: bestJob.id,
          title: bestJob.title
        }
      });
    });
    
    // Cache results
    cacheTalentPoolScores(seekersHash, jobsHash, results);
    
    return results;
  } catch (error) {
    console.error('AI talent pool matching error:', error);
    // Fallback to basic matching
    return getFallbackTalentPoolScores(seekers, employerJobs);
  }
}

// Generate match reason for talent pool
function generateTalentPoolMatchReason(
  job: { title: string; requirements?: string[] },
  score: number,
  matchingSkills: string[]
): string {
  const reasons: string[] = [];
  
  if (matchingSkills.length > 0) {
    reasons.push(`${matchingSkills.length} skill${matchingSkills.length > 1 ? 's' : ''} match for ${job.title}`);
  } else if (score >= 70) {
    reasons.push(`Strong fit for ${job.title}`);
  } else if (score >= 50) {
    reasons.push(`Potential fit for ${job.title}`);
  } else {
    reasons.push(`Consider for ${job.title}`);
  }
  
  return reasons.join('. ');
}

// Fallback scoring for talent pool
function getFallbackTalentPoolScores(
  seekers: Array<{ id: number; skills?: string[] }>,
  jobs: Array<{ id: number | string; title: string; requirements?: string[] }>
): Map<number, TalentPoolMatchResult> {
  const results = new Map<number, TalentPoolMatchResult>();
  
  seekers.forEach(seeker => {
    let bestScore = 30;
    let bestJob = jobs[0];
    let bestMatchingSkills: string[] = [];
    
    jobs.forEach(job => {
      const matchingSkills = findMatchingSkills(seeker.skills || [], job.requirements || []);
      const score = job.requirements && job.requirements.length > 0
        ? 30 + (matchingSkills.length / job.requirements.length) * 50
        : 30;
      
      if (score > bestScore) {
        bestScore = score;
        bestJob = job;
        bestMatchingSkills = matchingSkills;
      }
    });
    
    results.set(seeker.id, {
      seekerId: seeker.id,
      matchScore: Math.min(100, Math.max(0, Math.round(bestScore))),
      matchReason: bestMatchingSkills.length > 0 
        ? `${bestMatchingSkills.length} skills match ${bestJob.title}`
        : `Potential for ${bestJob.title}`,
      matchingSkills: bestMatchingSkills,
      bestMatchingJob: { id: bestJob.id, title: bestJob.title }
    });
  });
  
  return results;
}

