import { ObjectId } from 'mongoose';
import { AIAnalysis, LawyerProfile, MatchedLawyer, VectorSearchQuery } from '../types';
import { defaultAIConfig } from './config';
import { cosineSimilarity } from './embeddings';
import { vectorSearch } from './vector-search';

interface MatchingCriteria {
  analysis: AIAnalysis;
  categories: string[];
  urgency: string;
  jurisdiction?: string;
  location?: {
    postcode?: string;
    city?: string;
    radius?: number;
  };
  language?: string;
}

interface LawyerCandidate {
  id: ObjectId;
  profile: LawyerProfile;
  embedding?: number[];
}

/**
 * Match lawyers based on query analysis and criteria
 */
export async function matchLawyers(
  criteria: MatchingCriteria
): Promise<MatchedLawyer[]> {
  console.log('Matching lawyers with criteria:', criteria);

  try {
    // Step 1: Vector search if embeddings are available
    let candidates: LawyerCandidate[] = [];
    
    if (criteria.analysis.embeddings) {
      const vectorResults = await vectorSearch({
        embedding: criteria.analysis.embeddings,
        filter: {
          specialisms: criteria.analysis.suggestedSpecialisms,
          location: criteria.location,
          availability: true,
          languages: criteria.language ? [criteria.language] : undefined,
        },
        limit: 20, // Get more candidates for scoring
      });

      candidates = vectorResults.map(result => ({
        id: result.lawyerId,
        profile: result.profile,
        embedding: criteria.analysis.embeddings,
      }));
    } else {
      // Fallback to traditional search
      candidates = await traditionalSearch(criteria);
    }

    // Step 2: Score each candidate
    const scoredCandidates = candidates.map(candidate => {
      const score = calculateMatchScore(candidate, criteria);
      const reason = generateMatchReason(candidate, criteria, score);

      return {
        lawyerId: candidate.id,
        score,
        reason,
        matchedAt: new Date(),
        responded: false,
      } as MatchedLawyer;
    });

    // Step 3: Filter and sort by score
    const matches = scoredCandidates
      .filter(match => match.score >= defaultAIConfig.matching.minMatchScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, defaultAIConfig.matching.maxMatches);

    return matches;
  } catch (error) {
    console.error('Error matching lawyers:', error);
    return [];
  }
}

/**
 * Calculate match score for a lawyer candidate
 */
function calculateMatchScore(
  candidate: LawyerCandidate,
  criteria: MatchingCriteria
): number {
  const weights = defaultAIConfig.matching.weights;
  let totalScore = 0;

  // 1. Specialism match
  const specialismScore = calculateSpecialismMatch(
    candidate.profile.specialisms,
    criteria.analysis.suggestedSpecialisms
  );
  totalScore += specialismScore * weights.specialismMatch;

  // 2. Location proximity
  const locationScore = calculateLocationScore(
    candidate.profile.location,
    criteria.location
  );
  totalScore += locationScore * weights.locationProximity;

  // 3. Availability
  const availabilityScore = calculateAvailabilityScore(
    candidate.profile.availability,
    criteria.urgency
  );
  totalScore += availabilityScore * weights.availability;

  // 4. Rating
  const ratingScore = candidate.profile.rating
    ? candidate.profile.rating.average / 5
    : 0.5; // Default to middle if no rating
  totalScore += ratingScore * weights.rating;

  // 5. Experience
  const experienceScore = calculateExperienceScore(
    candidate.profile.qualifiedSince,
    candidate.profile.caseCount
  );
  totalScore += experienceScore * weights.experience;

  // 6. Language match
  const languageScore = calculateLanguageMatch(
    candidate.profile.languages,
    criteria.language
  );
  totalScore += languageScore * weights.languageMatch;

  return Math.min(totalScore, 1); // Cap at 1.0
}

/**
 * Calculate specialism match score
 */
function calculateSpecialismMatch(
  lawyerSpecialisms: string[],
  requiredSpecialisms: string[]
): number {
  if (requiredSpecialisms.length === 0) return 0.5;

  const matchCount = requiredSpecialisms.filter(spec =>
    lawyerSpecialisms.includes(spec)
  ).length;

  return matchCount / requiredSpecialisms.length;
}

/**
 * Calculate location score based on proximity
 */
function calculateLocationScore(
  lawyerLocation: LawyerProfile['location'],
  queryLocation?: MatchingCriteria['location']
): number {
  if (!queryLocation) return 0.5; // No preference

  // Simple implementation - in production, use proper geolocation
  if (queryLocation.city && lawyerLocation.city === queryLocation.city) {
    return 1.0;
  }

  if (queryLocation.postcode && lawyerLocation.postcode.startsWith(queryLocation.postcode.substring(0, 3))) {
    return 0.8;
  }

  return 0.3; // Different location
}

/**
 * Calculate availability score based on urgency
 */
function calculateAvailabilityScore(
  availability: LawyerProfile['availability'],
  urgency: string
): number {
  if (!availability.autoAccept && urgency === 'critical') {
    return 0.3; // Lower score for manual acceptance on urgent queries
  }

  const activeSlots = availability.schedule.filter(slot => slot.isActive).length;
  const totalSlots = availability.schedule.length || 1;

  return activeSlots / totalSlots;
}

/**
 * Calculate experience score
 */
function calculateExperienceScore(
  qualifiedSince: number,
  caseCount: number
): number {
  const currentYear = new Date().getFullYear();
  const yearsExperience = currentYear - qualifiedSince;

  // Normalize years (cap at 20 years)
  const yearScore = Math.min(yearsExperience / 20, 1) * 0.5;

  // Normalize case count (cap at 500 cases)
  const caseScore = Math.min(caseCount / 500, 1) * 0.5;

  return yearScore + caseScore;
}

/**
 * Calculate language match score
 */
function calculateLanguageMatch(
  lawyerLanguages: string[],
  requiredLanguage?: string
): number {
  if (!requiredLanguage) return 1.0; // No language requirement

  return lawyerLanguages.includes(requiredLanguage) ? 1.0 : 0.0;
}

/**
 * Generate human-readable match reason
 */
function generateMatchReason(
  candidate: LawyerCandidate,
  criteria: MatchingCriteria,
  score: number
): string {
  const reasons: string[] = [];

  // Specialism match
  const matchedSpecialisms = criteria.analysis.suggestedSpecialisms.filter(spec =>
    candidate.profile.specialisms.includes(spec)
  );
  if (matchedSpecialisms.length > 0) {
    reasons.push(`Specializes in ${matchedSpecialisms.join(', ')}`);
  }

  // Experience
  const yearsExperience = new Date().getFullYear() - candidate.profile.qualifiedSince;
  if (yearsExperience > 10) {
    reasons.push(`${yearsExperience} years of experience`);
  }

  // Rating
  if (candidate.profile.rating && candidate.profile.rating.average >= 4.5) {
    reasons.push(`Highly rated (${candidate.profile.rating.average}/5)`);
  }

  // Location
  if (criteria.location && candidate.profile.location.city === criteria.location.city) {
    reasons.push(`Located in ${candidate.profile.location.city}`);
  }

  // Pro bono
  if (candidate.profile.proBonoAreas && candidate.profile.proBonoAreas.length > 0) {
    const matchedProBono = candidate.profile.proBonoAreas.filter(area =>
      criteria.categories.includes(area)
    );
    if (matchedProBono.length > 0) {
      reasons.push('Offers pro bono services in relevant areas');
    }
  }

  // High match score
  if (score >= 0.8) {
    reasons.unshift('Excellent match');
  } else if (score >= 0.6) {
    reasons.unshift('Good match');
  }

  return reasons.join('. ') || 'Matched based on query requirements';
}

/**
 * Traditional search fallback when embeddings are not available
 */
async function traditionalSearch(
  criteria: MatchingCriteria
): Promise<LawyerCandidate[]> {
  // This would query the database directly
  // Placeholder implementation
  console.log('Using traditional search for lawyer matching');
  
  // In a real implementation, this would query MongoDB
  // with filters for specialisms, location, etc.
  return [];
}

/**
 * Re-rank matches based on additional criteria
 */
export function rerankMatches(
  matches: MatchedLawyer[],
  preferences: {
    preferredLanguage?: string;
    preferredGender?: string;
    maxBudget?: number;
  }
): MatchedLawyer[] {
  // Apply additional scoring based on preferences
  return matches.map(match => {
    let bonusScore = 0;

    // Add bonus scores for preference matches
    // This would need access to full lawyer profiles

    return {
      ...match,
      score: Math.min(match.score + bonusScore, 1),
    };
  }).sort((a, b) => b.score - a.score);
}