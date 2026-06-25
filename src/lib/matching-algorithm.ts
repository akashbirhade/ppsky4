import { UserProfile } from './database'

/**
 * Smart Matching Algorithm
 * Scores potential matches based on:
 * 1. Preference match (religion, age, education, city) - 40%
 * 2. Compatibility factors (language, lifestyle, family) - 30%
 * 3. Profile quality & activity - 15%
 * 4. Reciprocal interest potential - 15%
 */

export interface MatchScore {
  userId: string
  score: number // 0-100
  breakdown: {
    preferenceMatch: number
    compatibility: number
    profileQuality: number
    reciprocal: number
  }
  highlights: string[] // e.g., "Same religion", "Lives nearby"
}

export function calculateMatchScore(
  user: UserProfile,
  candidate: UserProfile
): MatchScore {
  const breakdown = {
    preferenceMatch: calculatePreferenceScore(user, candidate),
    compatibility: calculateCompatibilityScore(user, candidate),
    profileQuality: calculateProfileQuality(candidate),
    reciprocal: calculateReciprocalScore(user, candidate),
  }

  const score = Math.round(
    breakdown.preferenceMatch * 0.40 +
    breakdown.compatibility * 0.30 +
    breakdown.profileQuality * 0.15 +
    breakdown.reciprocal * 0.15
  )

  const highlights = generateHighlights(user, candidate)

  return {
    userId: candidate.id,
    score: Math.min(100, Math.max(0, score)),
    breakdown,
    highlights,
  }
}

function calculatePreferenceScore(user: UserProfile, candidate: UserProfile): number {
  let score = 0
  let maxPoints = 0
  const prefs = user.partnerPreferences

  if (!prefs) return 50 // No preferences set = neutral score

  // Age match (25 points)
  maxPoints += 25
  if (candidate.age >= prefs.ageMin && candidate.age <= prefs.ageMax) {
    score += 25
  } else {
    const diff = Math.min(
      Math.abs(candidate.age - prefs.ageMin),
      Math.abs(candidate.age - prefs.ageMax)
    )
    score += Math.max(0, 25 - diff * 5) // Lose 5 points per year outside range
  }

  // Religion match (25 points)
  maxPoints += 25
  if (prefs.religion === 'Any' || prefs.religion.toLowerCase().includes(candidate.religion?.toLowerCase())) {
    score += 25
  }

  // Education match (20 points)
  maxPoints += 20
  if (prefs.education === 'Any' || candidate.education) {
    const eduLevel = getEducationLevel(candidate.education)
    const prefLevel = getEducationLevel(prefs.education)
    if (prefs.education === 'Any') {
      score += 20
    } else if (eduLevel >= prefLevel) {
      score += 20
    } else {
      score += 10 // Partial credit
    }
  }

  // Location match (20 points)
  maxPoints += 20
  if (prefs.city === 'Any') {
    score += 20
  } else {
    const prefCities = prefs.city.toLowerCase().split(/[,\/]/).map(c => c.trim())
    if (prefCities.some(c => candidate.city?.toLowerCase().includes(c))) {
      score += 20
    } else if (candidate.state?.toLowerCase() === user.state?.toLowerCase()) {
      score += 10 // Same state, partial credit
    }
  }

  // Height match (10 points)
  maxPoints += 10
  if (prefs.heightMin && prefs.heightMax && candidate.height) {
    const candHeight = parseHeight(candidate.height)
    const minHeight = parseHeight(prefs.heightMin)
    const maxHeight = parseHeight(prefs.heightMax)
    if (candHeight >= minHeight && candHeight <= maxHeight) {
      score += 10
    } else {
      score += 5
    }
  } else {
    score += 10 // No height preference = full points
  }

  return maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 50
}

function calculateCompatibilityScore(user: UserProfile, candidate: UserProfile): number {
  let score = 0

  // Same mother tongue (25 points)
  if (user.motherTongue && candidate.motherTongue &&
    user.motherTongue.toLowerCase() === candidate.motherTongue.toLowerCase()) {
    score += 25
  }

  // Same city (20 points) or same state (10 points)
  if (user.city && candidate.city && user.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += 20
  } else if (user.state && candidate.state && user.state.toLowerCase() === candidate.state.toLowerCase()) {
    score += 10
  }

  // Diet compatibility (15 points)
  if (user.diet && candidate.diet) {
    if (user.diet === candidate.diet) {
      score += 15
    } else if (user.diet === 'Vegetarian' && candidate.diet === 'Eggetarian') {
      score += 8
    }
  } else {
    score += 10 // Unknown = partial
  }

  // Shared hobbies (20 points)
  if (user.hobbies?.length && candidate.hobbies?.length) {
    const shared = user.hobbies.filter(h =>
      candidate.hobbies.some(ch => ch.toLowerCase() === h.toLowerCase())
    )
    score += Math.min(20, shared.length * 5)
  }

  // Family type compatibility (10 points)
  if (user.familyDetails?.familyType && candidate.familyDetails?.familyType) {
    if (user.familyDetails.familyType === candidate.familyDetails.familyType) {
      score += 10
    } else {
      score += 5
    }
  } else {
    score += 5
  }

  // Marital status compatibility (10 points)
  if (user.maritalStatus === candidate.maritalStatus) {
    score += 10
  } else if (user.maritalStatus === 'Never Married' && candidate.maritalStatus === 'Never Married') {
    score += 10
  } else {
    score += 5
  }

  return score
}

function calculateProfileQuality(candidate: UserProfile): number {
  let score = 0

  // Has photos (30 points)
  if (candidate.photos?.length > 0) {
    score += Math.min(30, candidate.photos.length * 10)
  }

  // Profile completeness (30 points)
  const fields = [
    candidate.religion, candidate.caste, candidate.motherTongue,
    candidate.height, candidate.education, candidate.occupation,
    candidate.income, candidate.city, candidate.about
  ]
  const filled = fields.filter(Boolean).length
  score += Math.round((filled / fields.length) * 30)

  // Has bio/about (15 points)
  if (candidate.about && candidate.about.length > 50) {
    score += 15
  } else if (candidate.about) {
    score += 8
  }

  // Verified account (15 points)
  if (candidate.verified) {
    score += 15
  }

  // Recently active (10 points)
  if (candidate.lastActive) {
    const lastActive = new Date(candidate.lastActive)
    const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 1) score += 10
    else if (daysSince < 7) score += 7
    else if (daysSince < 30) score += 3
  }

  return score
}

function calculateReciprocalScore(user: UserProfile, candidate: UserProfile): number {
  // Check if the candidate's preferences match the user
  // This indicates the candidate would likely be interested back
  if (!candidate.partnerPreferences) return 50

  let score = 0
  const prefs = candidate.partnerPreferences

  // User's age matches candidate's preference
  if (user.age >= prefs.ageMin && user.age <= prefs.ageMax) {
    score += 30
  }

  // User's religion matches
  if (prefs.religion === 'Any' || prefs.religion.toLowerCase().includes(user.religion?.toLowerCase())) {
    score += 25
  }

  // User's education matches
  if (prefs.education === 'Any' || user.education) {
    score += 20
  }

  // User's city matches
  if (prefs.city === 'Any') {
    score += 25
  } else {
    const prefCities = prefs.city.toLowerCase().split(/[,\/]/).map(c => c.trim())
    if (prefCities.some(c => user.city?.toLowerCase().includes(c))) {
      score += 25
    }
  }

  return score
}

function generateHighlights(user: UserProfile, candidate: UserProfile): string[] {
  const highlights: string[] = []

  if (user.religion && candidate.religion && user.religion === candidate.religion) {
    highlights.push(`Same religion (${candidate.religion})`)
  }

  if (user.motherTongue && candidate.motherTongue &&
    user.motherTongue === candidate.motherTongue) {
    highlights.push(`Same mother tongue (${candidate.motherTongue})`)
  }

  if (user.city && candidate.city && user.city.toLowerCase() === candidate.city.toLowerCase()) {
    highlights.push(`Lives in ${candidate.city}`)
  } else if (user.state && candidate.state && user.state.toLowerCase() === candidate.state.toLowerCase()) {
    highlights.push(`From ${candidate.state}`)
  }

  if (candidate.verified) {
    highlights.push('Verified profile')
  }

  if (user.hobbies?.length && candidate.hobbies?.length) {
    const shared = user.hobbies.filter(h =>
      candidate.hobbies.some(ch => ch.toLowerCase() === h.toLowerCase())
    )
    if (shared.length > 0) {
      highlights.push(`Shared interests: ${shared.slice(0, 3).join(', ')}`)
    }
  }

  if (candidate.education) {
    highlights.push(candidate.education)
  }

  return highlights.slice(0, 5)
}

// Utility functions
function getEducationLevel(edu: string): number {
  if (!edu) return 0
  const lower = edu.toLowerCase()
  if (lower.includes('phd') || lower.includes('doctorate')) return 6
  if (lower.includes('md') || lower.includes('ms')) return 5
  if (lower.includes('mba') || lower.includes('m.tech') || lower.includes('master')) return 4
  if (lower.includes('b.tech') || lower.includes('b.e') || lower.includes('mbbs') || lower.includes('ca')) return 3
  if (lower.includes('bachelor') || lower.includes('b.sc') || lower.includes('b.com') || lower.includes('graduate')) return 2
  if (lower.includes('diploma') || lower.includes('12th') || lower.includes('hsc')) return 1
  return 2 // Default to bachelor level
}

function parseHeight(height: string): number {
  // Convert height like "5'10\"" to inches
  const match = height.match(/(\d+)'(\d+)/)
  if (match) {
    return parseInt(match[1]) * 12 + parseInt(match[2])
  }
  // Try cm
  const cmMatch = height.match(/(\d+)\s*cm/i)
  if (cmMatch) {
    return Math.round(parseInt(cmMatch[1]) / 2.54)
  }
  return 66 // default 5'6"
}

/**
 * Get top matches for a user, sorted by score
 */
export function getTopMatches(
  user: UserProfile,
  candidates: UserProfile[],
  limit: number = 10
): MatchScore[] {
  // Filter out same gender (for heterosexual matching), self, and incomplete profiles
  const validCandidates = candidates.filter(c =>
    c.id !== user.id &&
    c.gender !== user.gender &&
    c.profileComplete !== false
  )

  const scores = validCandidates.map(c => calculateMatchScore(user, c))

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score)

  return scores.slice(0, limit)
}

/**
 * Get daily recommended matches (top 5, refreshed daily)
 */
export function getDailyMatches(
  user: UserProfile,
  candidates: UserProfile[]
): MatchScore[] {
  // Use date as seed for consistent daily results
  const today = new Date().toISOString().split('T')[0]
  const seed = hashString(`${user.id}-${today}`)

  const topMatches = getTopMatches(user, candidates, 20)

  // Pick 5 from top 20 using daily seed for variety
  const daily: MatchScore[] = []
  const shuffled = [...topMatches]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, 5)
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
