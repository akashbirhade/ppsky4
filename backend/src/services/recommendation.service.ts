import prisma from '@config/prisma';

interface CompatibilityFactors {
  ageScore: number;
  religionScore: number;
  casteScore: number;
  locationScore: number;
  educationScore: number;
  incomeScore: number;
  total: number;
}

// Education level ranking for compatibility scoring
const EDUCATION_RANK: Record<string, number> = {
  'Below 10th': 1,
  '10th Pass': 2,
  '12th Pass': 3,
  'Diploma': 4,
  'Graduate': 5,
  'Post Graduate': 6,
  'Doctorate': 7,
  'Professional Degree': 6,
};

function getEducationRank(edu: string): number {
  return EDUCATION_RANK[edu] ?? 5;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateCompatibility(
  profile: any,
  target: any,
  preferences: any,
  targetPreferences: any
): CompatibilityFactors {
  // Age score (20 pts): How well target age matches my preferences
  let ageScore = 0;
  const targetAge = target.age;
  if (targetAge >= preferences.minAge && targetAge <= preferences.maxAge) {
    ageScore = 20;
  } else {
    const diff = Math.min(
      Math.abs(targetAge - preferences.minAge),
      Math.abs(targetAge - preferences.maxAge)
    );
    ageScore = Math.max(0, 20 - diff * 2);
  }

  // Religion score (25 pts): Both parties' religion preferences
  let religionScore = 0;
  const myReligionPref = preferences.religion ?? [];
  const theirReligionPref = targetPreferences?.religion ?? [];
  if (myReligionPref.length === 0 || myReligionPref.includes(target.religion)) {
    religionScore += 12.5;
  }
  if (theirReligionPref.length === 0 || theirReligionPref.includes(profile.religion)) {
    religionScore += 12.5;
  }

  // Caste score (20 pts)
  let casteScore = 0;
  const myCastePref = preferences.caste ?? [];
  const theirCastePref = targetPreferences?.caste ?? [];
  if (myCastePref.length === 0 || myCastePref.includes(target.caste)) {
    casteScore += 10;
  }
  if (theirCastePref.length === 0 || theirCastePref.includes(profile.caste)) {
    casteScore += 10;
  }

  // Location score (15 pts): closer is better
  const distance = haversine(
    Number(profile.latitude), Number(profile.longitude),
    Number(target.latitude), Number(target.longitude)
  );
  let locationScore = 0;
  if (distance <= 10) locationScore = 15;
  else if (distance <= 25) locationScore = 12;
  else if (distance <= 50) locationScore = 10;
  else if (distance <= 100) locationScore = 7;
  else if (distance <= 200) locationScore = 4;
  else if (distance <= 500) locationScore = 2;

  // Education score (10 pts): similar education levels
  const myEduRank = getEducationRank(profile.education);
  const theirEduRank = getEducationRank(target.education);
  const eduDiff = Math.abs(myEduRank - theirEduRank);
  const educationScore = Math.max(0, 10 - eduDiff * 2.5);

  // Income score (10 pts): within preferred range
  let incomeScore = 0;
  const targetIncome = target.annualIncome;
  const minIncome = preferences.minIncome ?? 0;
  const maxIncome = preferences.maxIncome ?? Infinity;
  if (targetIncome >= minIncome && targetIncome <= maxIncome) {
    incomeScore = 10;
  } else if (targetIncome > 0) {
    incomeScore = 3; // Has income but outside range
  }

  const total = ageScore + religionScore + casteScore + locationScore + educationScore + incomeScore;

  return { ageScore, religionScore, casteScore, locationScore, educationScore, incomeScore, total };
}

export class RecommendationService {
  async getRecommended(userId: string, gender: 'MALE' | 'FEMALE', page: number, limit: number) {
    const myData = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { include: { preferences: true } } },
    });

    if (!myData) return { profiles: [], total: 0, page, pages: 0 };

    const myPreferences = myData.user.preferences;
    const opposite = gender === 'MALE' ? 'FEMALE' : 'MALE';

    // Fetch a pool of candidate profiles
    const candidates = await prisma.profile.findMany({
      where: {
        user: {
          gender: opposite,
          accountStatus: 'ACTIVE',
          id: { not: userId },
          deletedAt: null,
          blockedBy: { none: { blockerId: userId } },
          blockedUsers: { none: { blockedId: userId } },
        },
      },
      include: {
        user: {
          include: {
            preferences: true,
            subscription: { select: { plan: true, isActive: true } },
            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
          },
        },
      },
      take: 500, // Score a large pool
    });

    // Score every candidate
    const scored = candidates
      .map((candidate) => ({
        ...candidate,
        compatibilityScore: calculateCompatibility(
          myData,
          candidate,
          myPreferences ?? {},
          candidate.user.preferences ?? {}
        ).total,
      }))
      .sort((a, b) => {
        // Premium users get a boost of 5 points in ranking
        const aBoost = a.user.subscription?.isActive && a.user.subscription.plan !== 'FREE' ? 5 : 0;
        const bBoost = b.user.subscription?.isActive && b.user.subscription.plan !== 'FREE' ? 5 : 0;
        return b.compatibilityScore + bBoost - (a.compatibilityScore + aBoost);
      });

    const total = scored.length;
    const paginated = scored.slice((page - 1) * limit, page * limit);

    return {
      profiles: paginated.map(({ user: { preferences: _prefs, ...user }, ...p }) => ({
        ...p,
        user,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getCompatibilityScore(userId: string, targetUserId: string): Promise<CompatibilityFactors> {
    const [myProfile, targetProfile] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        include: { user: { include: { preferences: true } } },
      }),
      prisma.profile.findUnique({
        where: { userId: targetUserId },
        include: { user: { include: { preferences: true } } },
      }),
    ]);

    if (!myProfile || !targetProfile) {
      return { ageScore: 0, religionScore: 0, casteScore: 0, locationScore: 0, educationScore: 0, incomeScore: 0, total: 0 };
    }

    return calculateCompatibility(
      myProfile,
      targetProfile,
      myProfile.user.preferences ?? {},
      targetProfile.user.preferences ?? {}
    );
  }
}
