import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Heart, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { EditPersonalInfoModal } from '@/components/profile/EditPersonalInfoModal';
import { EditSkillsModal } from '@/components/profile/EditSkillsModal';
import { EditLanguagesModal } from '@/components/profile/EditLanguagesModal';
import { EditTechnologiesModal } from '@/components/profile/EditTechnologiesModal';
import { EditExperienceSummaryModal } from '@/components/profile/EditExperienceSummaryModal';
import { EditWorkExperienceModal } from '@/components/profile/EditWorkExperienceModal';
import { EditEducationModal } from '@/components/profile/EditEducationModal';
import { EditAvailabilityModal } from '@/components/profile/EditAvailabilityModal';
import { ContactProfessionalModal } from '@/components/ContactProfessionalModal';
import { CVGenerationModal } from '@/components/profile/CVGenerationModal';
import { InfoCard } from '@/components/profile/InfoCard';
import { DATA_SEPARATORS } from '@/lib/data-separators';
import { useFavorites } from '@/hooks/use-favorites';
import { useProfileImage } from '@/hooks/use-profile-image';
import { isCompanyUser } from '@/lib/auth-utils';
import { formatDistance, calculateCachedDistance } from '@/lib/distance-utils';
import { ImageCropModal } from '@/components/profile/ImageCropModal';
import { ProfilePictureBadges } from '@/components/profile/ProfilePictureBadges';

// Helper function to extract first name (last part of full name in Hungarian convention)
const getFirstName = (fullName: string): string => {
  const nameParts = fullName.trim().split(' ');
  return nameParts[nameParts.length - 1]; // Last part is the keresztnév
};

// Helper function to extract surname (first part of full name in Hungarian convention)
const getSurname = (fullName: string): string => {
  const nameParts = fullName.trim().split(' ');
  return nameParts[0]; // First part is the vezetéknév
};

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  age?: number;
  role: string;
  professional_profile?: {
    daily_wage_net?: number | string; // Can be number for owner/admin or string for guests
    work_experience?: string;
    education?: string;
    skills?: string[];
    languages?: string[];
    technologies?: string[];
    city?: string;
    available?: boolean;
    availablefrom?: string;
    range?: number | null; // Distance range for company users
  };
}

interface ExperienceItem {
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface EducationItem {
  school: string;
  degree: string;
  duration: string;
}

interface WorkExperience {
  position: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
}

const skillLevels = ['junior', 'medior', 'senior', 'expert'];
const languageLevels = ['beginner', 'intermediate', 'advanced', 'native'];

// Function to parse work experience from database
const parseWorkExperience = (workExperienceText: string): { summary: string; experiences: ExperienceItem[] } => {
  if (!workExperienceText) {
    return { summary: "", experiences: [] };
  }

  // Use a unique separator that won't appear in normal text
  const sections = workExperienceText.split(DATA_SEPARATORS.WORK_EXPERIENCE);
  const summary = sections[0] || "";
  const experiences: ExperienceItem[] = [];
  
  // Regex to parse: "Position at Company (startDate - endDate): description"
  const experienceRegex = /^(.+?)\s+at\s+(.+?)\s+\((.+?)\):\s+(.+)$/s;

  // Parse individual experiences (skip the first section which is the summary)
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    if (section.trim()) {
      const match = experienceRegex.exec(section);
      if (match) {
        const [, position, company, duration, description] = match;
        experiences.push({
          position: position.trim(),
          company: company.trim(),
          duration: duration.trim(),
          description: description.trim()
        });
      }
    }
  }

  return { summary, experiences };
};

// Function to parse education from database
const parseEducation = (educationText: string): EducationItem[] => {
  if (!educationText) {
    return [];
  }

  // Use a unique separator that won't appear in normal text
  const sections = educationText.split(DATA_SEPARATORS.EDUCATION);
  const educations: EducationItem[] = [];

  for (const section of sections) {
    if (section.trim()) {
      // Try to parse format: "Degree at School (startYear - endYear)"
      const match = section.match(/^(.+?)\s+at\s+(.+?)\s+\((.+?)\)$/);
      if (match) {
        const [, degree, school, duration] = match;
        educations.push({
          degree: degree.trim(),
          school: school.trim(),
          duration: duration.trim()
        });
      }
    }
  }

  // Sort educations by start year (descending - most recent first)
  return educations.sort((a, b) => {
    const getStartYear = (duration: string) => {
      const startYearMatch = duration.match(/^(\d{4})/);
      return startYearMatch ? parseInt(startYearMatch[1]) : 0;
    };
    
    const startYearA = getStartYear(a.duration);
    const startYearB = getStartYear(b.duration);
    
    return startYearB - startYearA; // Descending order (most recent first)
  });
};

const getCountryFlag = (language: string) => {
  const flags: { [key: string]: string } = {
    'English': '🇺🇸',
    'German': '🇩🇪',
    'French': '🇫🇷',
    'Spanish': '🇪🇸',
    'Italian': '🇮🇹',
    'Hungarian': '🇭🇺',
    'Portuguese': '🇵🇹',
    'Dutch': '🇳🇱',
    'Polish': '🇵🇱',
    'Czech': '🇨🇿'
  };
  return flags[language] || '🌍';
};

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatPhone = (phone: string, isOwner: boolean, isAdmin: boolean): string => {
  if (isOwner || isAdmin) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 3);
};

const formatEmail = (email: string, isOwner: boolean, isAdmin: boolean): string => {
  if (isOwner || isAdmin) return email;
  const [name, domain] = email.split('@');
  const hiddenName = name.slice(0, 2) + '*'.repeat(name.length - 2);
  const hiddenDomain = domain.split('.')[0].slice(0, 2) + '*'.repeat(domain.split('.')[0].length - 2) + '.' + domain.split('.')[1];
  return hiddenName + '@' + hiddenDomain;
};

const getSkillLevel = (skill: string): number => {
  // Mock skill levels - in real app this would come from database
  const levels: { [key: string]: number } = {
    'Project Management': 90,
    'Strategic Planning': 85,
    'Team Leadership': 95,
    'Digital Transformation': 80,
    'Process Optimization': 88,
    'Change Management': 92
  };
  return levels[skill] || 70;
};

const getLanguageLevel = (language: string): string => {
  // Mock language levels - in real app this would come from database  
  const levels: { [key: string]: string } = {
    'English': 'native',
    'German': 'advanced',
    'Hungarian': 'native',
    'French': 'intermediate',
    'Spanish': 'beginner'
  };
  return levels[language] || 'intermediate';
};

// Helper function to get availability status text
const getAvailabilityText = (available?: boolean, availableFrom?: string): string => {
  if (available === true) {
    return 'Available now';
  }
  if (available === false && availableFrom) {
    return `Available from ${new Date(availableFrom).toLocaleDateString()}`;
  }
  if (available === false) {
    return 'Currently unavailable';
  }
  return 'Availability unknown';
};

export const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [needsProfessionalProfile, setNeedsProfessionalProfile] = useState(false);
  const [companyAddress, setCompanyAddress] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  
  // Initialize favorites hook for company users
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites(
    isCompany ? currentUser?.id : undefined
  );
  
  // Profile image management
  const { 
    profileImage, 
    uploading: imageUploading, 
    deleting: imageDeleting,
    uploadProfileImage,
    deleteProfileImage,
    refreshProfileImage
  } = useProfileImage();
  
  // Modal states
  const [editPersonalInfoOpen, setEditPersonalInfoOpen] = useState(false);
  const [editAvailabilityOpen, setEditAvailabilityOpen] = useState(false);
  const [editSkillsOpen, setEditSkillsOpen] = useState(false);
  const [editLanguagesOpen, setEditLanguagesOpen] = useState(false);
  const [editTechnologiesOpen, setEditTechnologiesOpen] = useState(false);
  const [editExperienceSummaryOpen, setEditExperienceSummaryOpen] = useState(false);
  const [editWorkExperienceOpen, setEditWorkExperienceOpen] = useState(false);
  const [editEducationOpen, setEditEducationOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [cvGenerationOpen, setCvGenerationOpen] = useState(false);
  const [imageCropModalOpen, setImageCropModalOpen] = useState(false);

  // Memoized parsed data to prevent unnecessary re-renders and maintain stable references
  const parsedData = useMemo(() => {
    if (!profileData?.professional_profile) {
      return {
        skills: [],
        languages: [],
        technologies: [],
        experienceSummary: '',
        workExperiences: [],
        educations: []
      };
    }
    
    const { summary: experienceSummary, experiences: workExperiences } = 
      parseWorkExperience(profileData.professional_profile.work_experience || "");
    
    return {
      skills: profileData.professional_profile.skills || [],
      languages: profileData.professional_profile.languages || [],
      technologies: profileData.professional_profile.technologies || [],
      experienceSummary,
      workExperiences,
      educations: parseEducation(profileData.professional_profile.education || "")
    };
  }, [
    profileData?.professional_profile?.skills,
    profileData?.professional_profile?.languages,
    profileData?.professional_profile?.technologies,
    profileData?.professional_profile?.work_experience,
    profileData?.professional_profile?.education
  ]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);

        // Check if current user is admin and company user
        if (session?.user) {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);
          setIsAdmin(roles?.some(r => r.role === 'admin') || false);
          
          // Check if user is a company user
          const companyUser = await isCompanyUser(session.user.id);
          setIsCompany(companyUser);
          
          // If company user, fetch company address for distance calculation
          if (companyUser) {
            
            const { data: companyProfile, error: companyError } = await supabase
              .from('company_profiles')
              .select('address')
              .eq('user_id', session.user.id)
              .single();
            
            if (companyProfile?.address) {
              setCompanyAddress(companyProfile.address);
            } else {
              console.log('No company address found');
            }
            
          }
        }

        // If no userId in params, show current user's profile
        const targetUserId = userId || session?.user?.id;
        
        if (!targetUserId) {
          setLoading(false);
          return;
        }

        // Check if this is the current user viewing their own profile
        const isCurrentUser = targetUserId === session?.user?.id;

        if (isCurrentUser) {
          // For own profile, use direct table queries for full access
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

          if (profileError) {
            console.error('Profile query error:', profileError);
            setLoading(false);
            return;
          }

          // Get professional profile data
          const { data: professionalProfile, error: professionalProfileError } = await supabase
            .from('professional_profiles')
            .select('*')
            .eq('user_id', targetUserId)
            .maybeSingle();

          if (professionalProfileError) {
            console.error('Professional profile query error:', professionalProfileError);
          }

          // Check if professional user needs to complete their profile
          if ((profile.role === 'professional' || profile.role === 'user') && !professionalProfile?.work_experience) {
            console.log('Professional user needs to complete profile, redirecting to wizard');
            navigate('/auth?step=professional');
            return;
          }

          // Calculate age if birth_date exists
          const age = profile.birth_date ? 
            Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 
            undefined;

          setProfileData({
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            birth_date: profile.birth_date,
            age: age,
            role: profile.role,
            professional_profile: professionalProfile ? {
              daily_wage_net: professionalProfile.daily_wage_net,
              work_experience: professionalProfile.work_experience,
              education: professionalProfile.education || null,
              skills: professionalProfile.skills || [],
              languages: professionalProfile.languages || [],
              technologies: professionalProfile.technologies || [],
              city: professionalProfile.city || "", // Temporary test data
              available: professionalProfile.available,
              availablefrom: professionalProfile.availablefrom,
            } : undefined
          });
        } else {
          // For viewing other profiles, use the public function with proper data masking
          const { data: publicProfile, error: publicProfileError } = await supabase
            .rpc('get_profile_for_public', { _user_id: targetUserId });

          if (publicProfileError || !publicProfile || publicProfile.length === 0) {
            setLoading(false);
            return;
          }

          const profile = publicProfile[0];
          setProfileData({
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.masked_full_name,
            email: profile.masked_email || '',
            phone: profile.masked_phone,
            birth_date: profile.birth_date,
            age: profile.age,
            role: profile.role,
            professional_profile: {
              daily_wage_net: profile.masked_daily_wage,
              work_experience: profile.work_experience,
              education: profile.education || null,
              skills: profile.skills || [],
              languages: profile.languages || [],
              technologies: profile.technologies || [],
              city: profile.city || "", // Temporary test data for public profiles too
              available: profile.available,
              availablefrom: profile.availablefrom,
              range: profile.range,
            }
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Load profile image when profileData is available
  useEffect(() => {
    if (profileData?.user_id) {
      refreshProfileImage(profileData.user_id);
    }
  }, [profileData?.user_id, refreshProfileImage]);

  // Calculate distance when company address and professional city are available
  useEffect(() => {
    const calculateDistance = async () => {
      const isCurrentUserOwner = currentUser?.id === profileData?.user_id;
      
      if (!isCompany || !companyAddress || !profileData?.professional_profile?.city || isCurrentUserOwner) {
        setDistance(null);
        return;
      }

      setDistanceLoading(true);
      try {
        // Use cached distance calculation
        const dist = await calculateCachedDistance(companyAddress, profileData.professional_profile.city);
        setDistance(dist);
      } catch (error) {
        console.error('Error calculating distance:', error);
        setDistance(null);
      } finally {
        setDistanceLoading(false);
      }
    };

    calculateDistance();
  }, [isCompany, companyAddress, profileData?.professional_profile?.city, currentUser?.id, profileData?.user_id]);

  const handleProfileUpdate = () => {
    // Reload profile data after updates using the same logic as initial load
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const targetUserId = userId || session?.user?.id;
        
        if (!targetUserId) return;

        // Load profile data from direct table queries
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (profileError) {
          console.error('Profile query error:', profileError);
          return;
        }

        if (profile) {
          // Check if this is the current user viewing their own profile
          const isCurrentUser = targetUserId === session?.user?.id;
          
          // Get professional profile data
          const { data: professionalProfile } = await supabase
            .from('professional_profiles')
            .select('*')
            .eq('user_id', targetUserId)
            .maybeSingle();

          // Calculate age if birth_date exists
          const age = profile.birth_date ? 
            Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 
            undefined;

          // Mask data based on user permissions
          const isGuest = !session?.user;
          
          setProfileData({
            id: profile.id,
            user_id: profile.user_id,
            full_name: isGuest ? 
              // For guests: return only last part of name (keresztnév)
              profile.full_name.split(' ').pop() || profile.full_name :
              profile.full_name,
            email: isCurrentUser ? profile.email : 
              isGuest ? '' : 
              profile.email.substring(0, 3) + '***@' + profile.email.split('@')[1],
            phone: isCurrentUser ? profile.phone : undefined,
            birth_date: isGuest ? undefined : profile.birth_date,
            age: isGuest ? undefined : age,
            role: profile.role,
            professional_profile: professionalProfile ? {
              daily_wage_net: isCurrentUser ? professionalProfile.daily_wage_net : 'Contact for details',
              work_experience: professionalProfile.work_experience,
              education: professionalProfile.education || null,
              skills: professionalProfile.skills || [],
              languages: professionalProfile.languages || [],
              technologies: professionalProfile.technologies || [],
              range: professionalProfile.range || null,
              available: professionalProfile.available || null,
              availablefrom: professionalProfile.availablefrom || null
            } : undefined
          });
        }
      } catch (error) {
        console.error('Error reloading profile:', error);
      }
    };
    
    loadProfile();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
            <p className="text-muted-foreground">The requested profile could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If the current user needs to complete their professional profile, redirect them
  if (needsProfessionalProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-4xl">👋</div>
              <h2 className="text-2xl font-bold">Welcome! Complete Your Profile</h2>
              <p className="text-muted-foreground">
                You're approved! Please complete your professional profile to get started.
              </p>
              <Button onClick={() => navigate('/auth?step=professional')} className="w-full">
                Complete Professional Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isOwner = currentUser?.id === profileData.user_id;
  const shouldShowCTA = !isAdmin && !isOwner;
  const canSeeFullName = isAdmin || isOwner;
  const canEditProfilePicture = isOwner || isAdmin;

  // Profile image handlers
  const handleUploadImage = () => {
    setImageCropModalOpen(true);
  };

  const handleSaveImage = async (croppedImage: Blob) => {
    if (profileData?.user_id) {
      await uploadProfileImage(croppedImage, profileData.user_id);
    }
  };

  const handleDeleteImage = async () => {
    if (profileData?.user_id) {
      await deleteProfileImage(profileData.user_id);
    }
  };
  
  // Use age from backend if available, otherwise calculate from birth_date
  const age = profileData.age || (profileData.birth_date ? calculateAge(profileData.birth_date) : null);

  // Extract parsed data
  const { skills, languages, technologies, experienceSummary, workExperiences, educations } = parsedData;

  // Name display logic
  const displayName = canSeeFullName 
    ? profileData.full_name 
    : getFirstName(profileData.full_name); // Show only first name for non-owners/non-admins
  
  const displayNameForAvatar = canSeeFullName 
    ? profileData.full_name.split(' ').map(n => n[0]).join('')
    : getSurname(profileData.full_name).charAt(0); // Show only surname initial for avatar

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-white/50">
                  <AvatarImage src={profileImage?.src || "/images/maleavatar.png"} />
                  <AvatarFallback className="text-2xl font-bold">
                    {displayNameForAvatar}
                  </AvatarFallback>
                </Avatar>
                {canEditProfilePicture && (
                  <ProfilePictureBadges
                    hasImage={!!profileImage}
                    onUpload={handleUploadImage}
                    onDelete={handleDeleteImage}
                    disabled={imageUploading || imageDeleting}
                  />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {profileData.full_name}
                  {Boolean(age) && <span className="text-xl text-muted-foreground ml-2">({age} years old)</span>}
                </h1>
                <p className="text-xl text-muted-foreground capitalize">{profileData.role}</p>
              </div>
            </div>
            
            {/* Availability and Add to Favorites Buttons - Only show for logged-in company users viewing others' profiles */}
            {currentUser && isCompany && !isOwner && profileData.role === 'professional' && (
              <div className="flex items-center space-x-4">
                {/* Availability Status Button */}
                {profileData.professional_profile && (
                    <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border text-sm font-medium ${
                      profileData.professional_profile.available
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-100'
                      : 'border-red-300 text-red-700 bg-red-100'
                    }`}
                    >
                    {profileData.professional_profile.available ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span>
                      {getAvailabilityText(
                      profileData.professional_profile.available,
                      profileData.professional_profile.availablefrom
                      )}
                    </span>
                    </div>
                )}
                
                {/* Add to Favorites Button */}
                <Button
                  onClick={() => toggleFavorite(profileData.user_id)}
                  disabled={favoritesLoading}
                  variant={isFavorite(profileData.user_id) ? "default" : "outline"}
                  size="lg"
                  className={`flex items-center space-x-2 ${
                    isFavorite(profileData.user_id) 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Heart 
                    className={`h-5 w-5 ${
                      isFavorite(profileData.user_id) ? 'fill-current' : ''
                    }`} 
                  />
                  <span>
                    {isFavorite(profileData.user_id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </span>
                </Button>
              </div>
            )}

            {/* Generate CV Button - Only show for admins */}
            {currentUser && isAdmin && !isOwner && profileData.role === 'professional' && (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setCvGenerationOpen(true)}
                  size="lg"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileText className="h-5 w-5" />
                  <span>Generate CV</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-10 gap-8">
            {/* Left Column - 30% */}
            <div className="lg:col-span-3 space-y-6">
              {/* Info Card */}
              <InfoCard
                profileData={profileData}
                isOwner={isOwner}
                isAdmin={isAdmin}
                isCompany={isCompany}
                distance={distance}
                distanceLoading={distanceLoading}
                companyAddress={companyAddress}
                onEditPersonalInfo={() => setEditPersonalInfoOpen(true)}
                onEditAvailability={() => setEditAvailabilityOpen(true)}
              />

              {/* Skills Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Skills & Expertise</span>
                     {(isOwner || isAdmin) && (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setEditSkillsOpen(true)}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skills.length > 0 ? skills.map((skill, index) => {
                    // Parse skill format "skillname (level)" or just use as is
                    const skillMatch = typeof skill === 'string' ? skill.match(/^(.+?)\s*\((.+?)\)$/) : null;
                    const skillName = skillMatch ? skillMatch[1] : skill;
                    const skillLevel = skillMatch ? skillMatch[2] : 'intermediate';
                    const level = ['junior', 'medior', 'senior', 'expert'].includes(skillLevel.toLowerCase()) 
                      ? skillLevel.toLowerCase() : 'medior';
                    const levelPercentage = { junior: 25, medior: 50, senior: 75, expert: 90 }[level] || 50;
                    
                    return (
                      <div key={index + '-' + skillName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{skillName}</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {level}
                          </Badge>
                        </div>
                        <Progress value={levelPercentage} className="h-2" />
                      </div>
                    );
                  }) : (
                    <p className="text-muted-foreground text-sm">No skills added yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Languages Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Languages</span>
                     {(isOwner || isAdmin) && (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setEditLanguagesOpen(true)}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {languages.length > 0 ? languages.map((language, index) => {
                    // Parse language format "languagename (level)" or just use as is
                    const langMatch = typeof language === 'string' ? language.match(/^(.+?)\s*\((.+?)\)$/) : null;
                    const langName = langMatch ? langMatch[1] : language;
                    const langLevel = langMatch ? langMatch[2] : 'intermediate';
                    
                    return (
                      <div key={index + '-' + langName} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          
                          <span className="text-sm font-medium">{langName}</span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {langLevel}
                        </Badge>
                      </div>
                    );
                  }) : (
                    <p className="text-muted-foreground text-sm">No languages added yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Technologies Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Technologies & Tools</span>
                     {(isOwner || isAdmin) && (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setEditTechnologiesOpen(true)}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {technologies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {technologies.map((tech, index) => (
                        <Badge key={index + '-' + tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No technologies added yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 70% */}
            <div className="lg:col-span-7 space-y-6">
              {/* CTA Section - Only show if not admin and not owner */}
              {shouldShowCTA && (
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                      Interested in Working with {canSeeFullName ? profileData.full_name.split(' ')[0] : getFirstName(profileData.full_name)}?
                    </h3>
                    <p className="text-emerald-700 mb-6 max-w-2xl mx-auto">
                      This professional has the expertise and experience to drive your next transformation project. 
                      Contact us to discuss how they can help achieve your business goals.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setContactModalOpen(true)}
                    >
                      Contact Us About This Professional
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Professional Experience Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Professional Experience Summary</span>
                     {(isOwner || isAdmin) && (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setEditExperienceSummaryOpen(true)}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {experienceSummary || 
                    "No professional experience summary provided yet."}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Work Experience</span>
                     {(isOwner || isAdmin) && (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setEditWorkExperienceOpen(true)}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workExperiences.length > 0 ? workExperiences.map((exp, index) => (
                    <div key={index + '-' + exp.position + '-' + exp.company} className="border-l-2 border-primary/20 pl-6 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-2 top-2"></div>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                        <h4 className="font-semibold text-lg">{exp.position}</h4>
                        <Badge variant="outline" className="md:ml-4 mt-1 md:mt-0 w-fit">
                          {exp.duration}
                        </Badge>
                      </div>
                      <p className="text-primary font-medium mb-2">{exp.company}</p>
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{exp.description}</div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground">No detailed work experience added yet.</p>
                  )}
                 </CardContent>
               </Card>

               {/* Education Section */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <span>Education</span>
                      {(isOwner || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditEducationOpen(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   {educations.length > 0 ? educations.map((edu, index) => (
                     <div key={index + '-' + edu.degree + '-' + edu.school} className="border-l-2 border-primary/20 pl-6 relative">
                       <div className="absolute w-3 h-3 bg-primary rounded-full -left-2 top-2"></div>
                       <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                         <h4 className="font-semibold text-lg">{edu.degree}</h4>
                         <Badge variant="outline" className="md:ml-4 mt-1 md:mt-0 w-fit">
                           {edu.duration}
                         </Badge>
                       </div>
                       <p className="text-primary font-medium">{edu.school}</p>
                     </div>
                   )) : (
                     <p className="text-muted-foreground">No education added yet.</p>
                   )}
                 </CardContent>
               </Card>
             </div>
           </div>
         </div>
       </section>

      {/* Edit Modals */}
      {profileData && (
        <>
          <EditPersonalInfoModal
            isOpen={editPersonalInfoOpen}
            onClose={() => setEditPersonalInfoOpen(false)}
            profileData={{
              ...profileData,
              professional_profile: {
                daily_wage_net: typeof profileData.professional_profile?.daily_wage_net === 'string' ? 0 : profileData.professional_profile?.daily_wage_net,
                city: profileData.professional_profile?.city
              }
            }}
            onUpdate={handleProfileUpdate}
          />
          <EditAvailabilityModal
            isOpen={editAvailabilityOpen}
            onClose={() => setEditAvailabilityOpen(false)}
            userId={profileData.user_id}
            currentAvailable={profileData.professional_profile?.available}
            currentAvailableFrom={profileData.professional_profile?.availablefrom}
            onUpdate={handleProfileUpdate}
          />
          <EditSkillsModal
            isOpen={editSkillsOpen}
            onClose={() => setEditSkillsOpen(false)}
            skills={skills}
            userId={profileData.user_id}
            onUpdate={handleProfileUpdate}
          />
          <EditLanguagesModal
            isOpen={editLanguagesOpen}
            onClose={() => setEditLanguagesOpen(false)}
            languages={languages}
            userId={profileData.user_id}
            onUpdate={handleProfileUpdate}
          />
          <EditTechnologiesModal
            isOpen={editTechnologiesOpen}
            onClose={() => setEditTechnologiesOpen(false)}
            technologies={technologies}
            userId={profileData.user_id}
            onUpdate={handleProfileUpdate}
          />
          <EditExperienceSummaryModal
            isOpen={editExperienceSummaryOpen}
            onClose={() => setEditExperienceSummaryOpen(false)}
            currentSummary={experienceSummary}
            userId={profileData.user_id}
            onUpdate={handleProfileUpdate}
          />
          <EditWorkExperienceModal
            isOpen={editWorkExperienceOpen}
            onClose={() => setEditWorkExperienceOpen(false)}
            workExperiences={workExperiences}
            currentSummary={experienceSummary}
            userId={profileData.user_id}
            onUpdate={handleProfileUpdate}
          />
          <EditEducationModal
            isOpen={editEducationOpen}
            onClose={() => setEditEducationOpen(false)}
            educations={educations.map(edu => {
              const [startYear, endYear] = edu.duration.includes(' - ') 
                ? edu.duration.split(' - ') 
                : [edu.duration, ''];
              return {
                school: edu.school,
                degree: edu.degree,
                startYear,
                endYear: endYear === 'Present' ? '' : endYear,
                isCurrent: endYear === 'Present'
              };
            })}
            userId={profileData.user_id}
            onUpdate={handleProfileUpdate}
          />
        </>
      )}
      
      {/* Contact Modal */}
      <ContactProfessionalModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        professionalId={profileData.user_id}
        professionalName={canSeeFullName ? profileData.full_name.split(' ')[0] : getFirstName(profileData.full_name)}
      />

      {/* CV Generation Modal */}
      {isAdmin && (
        <CVGenerationModal
          isOpen={cvGenerationOpen}
          onClose={() => setCvGenerationOpen(false)}
          profileData={profileData}
          parsedData={parsedData}
        />
      )}

      {/* Image Crop Modal */}
      {canEditProfilePicture && (
        <ImageCropModal
          open={imageCropModalOpen}
          onClose={() => setImageCropModalOpen(false)}
          onSave={handleSaveImage}
        />
      )}
    </Layout>
  );
};