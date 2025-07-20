import { ILawyerProfile } from '../types';

export const transformLawyerProfileForFrontend = (profile: any) => {
  // Extract user data from populated userId field
  const user = profile.userId || {};
  
  return {
    id: user._id || profile._id,
    email: user.email || '',
    name: user.name || '',
    role: 'lawyer',
    avatar: user.profilePicture || '',
    bio: profile.bio || '',
    isVerified: profile.verified || false,
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: profile.updatedAt || new Date().toISOString(),
    lawyerProfile: {
      id: profile._id,
      barNumber: profile.barNumber,
      specializations: profile.specialisms || profile.practiceAreas || [],
      yearsOfExperience: profile.yearsOfExperience || 0,
      languages: profile.languages || [],
      location: {
        city: profile.location?.city || '',
        state: profile.licenseState || profile.location?.state || '',
        country: profile.location?.country || ''
      },
      availability: {
        days: profile.availability?.days || [],
        hours: profile.availability?.hours?.map((h: any) => `${h.start}-${h.end}`).join(', ') || ''
      },
      consultationTypes: profile.consultationTypes || profile.consultationMethods || ['chat'],
      verificationStatus: profile.verified ? 'verified' : 'pending',
      verificationDocuments: profile.verificationDocuments || [],
      rating: profile.rating?.average || 0,
      totalConsultations: profile.completedConsultations || 0
    }
  };
};