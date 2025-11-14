import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Eye, Settings, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { isApprovedCompanyUser } from '@/lib/auth-utils';
import { useFavorites } from '@/hooks/use-favorites';
import { EditCompanyProfileModal } from '@/components/company/EditCompanyProfileModal';
import { formatDistance, batchCalculateDistances } from '@/lib/distance-utils';

// Helper function to get availability text and color
const getAvailabilityStatus = (available?: boolean, available_from?: string) => {
  if (available === undefined) return null;

  if (available) {
    return {
      text: 'Available',
      color: 'text-emerald-600',
      icon: CheckCircle,
      bgColor: 'bg-emerald-50'
    };
  } else {
    const fromDate = available_from ? new Date(available_from) : null;
    const fromText = fromDate ? ` from ${fromDate.toLocaleDateString()}` : '';
    return {
      text: `Not available${fromText}`,
      color: 'text-red-600',
      icon: XCircle,
      bgColor: 'bg-red-50'
    };
  }
};

interface FavoriteProfessional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  daily_wage_net?: number;
  skills?: string[];
  technologies?: string[];
  languages?: string[];
  work_experience?: string;
  is_favorite?: boolean;
  distance?: number | null;
  available?: boolean;
  available_from?: string;
  profile_image?: string | null;
}

interface ProfessionalCardProps {
  professional: FavoriteProfessional;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onCardClick: (id: string) => void;
}

const ProfessionalCard = ({ professional, isFavorite, onToggleFavorite, onCardClick }: ProfessionalCardProps) => {
  const availabilityStatus = getAvailabilityStatus(professional.available, professional.available_from);
  const surname = professional.full_name.split(' ').at(-1) || professional.full_name;

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick(professional.id)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={professional.profile_image || undefined} />
              <AvatarFallback className="bg-spective-accent text-white">
                {surname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start gap-0 flex-col px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{professional.full_name}</h3>
                  {professional.distance !== null && professional.distance !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{formatDistance(professional.distance)}</span>
                    </div>
                  )}
                </div>
                {availabilityStatus && (
                  <div className={`inline-flex items-center gap-1 py-1 rounded-full text-xs font-medium ${availabilityStatus.bgColor} ${availabilityStatus.color}`}>
                    <availabilityStatus.icon className="h-3 w-3" />
                    <span>{availabilityStatus.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking favorite button
            onToggleFavorite(professional.id);
          }}
          className={isFavorite ? 'text-red-500' : 'text-gray-400'}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {professional.skills && professional.skills.length > 0 ? (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {professional.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {professional.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{professional.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      ) : null}

      {professional.technologies && professional.technologies.length > 0 ? (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Technologies:</p>
          <div className="flex flex-wrap gap-1">
            {professional.technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {professional.technologies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{professional.technologies.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      ) : null}

      <div className="text-sm text-gray-600">
        <p>
          <Eye className="inline h-4 w-4 mr-1" />
          Full profile and documents managed by Spective Kft.
        </p>
      </div>
    </Card>
  );
};

export const CompanyDashboard = () => {
  const [professionals, setProfessionals] = useState<FavoriteProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companyAddress, setCompanyAddress] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use the favorites hook for proper database integration
  const { favorites: favoriteIds, toggleFavorite } = useFavorites(currentUser?.id);

  const handleProfessionalClick = (professionalId: string) => {
    navigate(`/profile/${professionalId}`);
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the company dashboard.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const companyStatus = await isApprovedCompanyUser(user.id);

      if (!companyStatus.isCompany) {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to company users.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!companyStatus.isApproved) {
        const statusMessages = {
          'pending': 'Your company account is pending approval. You will be notified when it\'s approved.',
          'rejected': 'Your company account has been rejected. Please contact support if you believe this is an error.',
          'error': 'There was an error checking your account status. Please try again later.'
        };

        toast({
          title: "Access Denied",
          description: statusMessages[companyStatus.status as keyof typeof statusMessages] || statusMessages.error,
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCurrentUser(user);
      setAuthorized(true);
    } catch (error) {
      console.error('Authorization check failed:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchProfessionals();
      fetchCompanyAddress();
    }
  }, [authorized]);

  const fetchCompanyAddress = async () => {
    if (!currentUser?.id) return;

    try {
      // Try to fetch address, but handle gracefully if column doesn't exist yet
      const { data: companyProfile, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (!error && companyProfile && (companyProfile as any).address) {
        const address = (companyProfile as any).address;
        setCompanyAddress(address);
      }
    } catch (error) {
      console.error('Error fetching company address:', error);
    }
  };

  const fetchProfessionals = async () => {
    try {
      // Use the secure database function that handles data masking
      const { data, error } = await supabase.rpc('get_professionals_for_public');

      if (error) {
        setProfessionals([]);
        return;
      }
      console.log(data);
      // Transform the data from the database function to match our interface
      const transformedProfessionals = (data || []).map((item: any) => ({
        id: item.user_id, // Use user_id as the id for favorites matching
        full_name: item.masked_full_name,
        email: 'contact@company.com', // Privacy protected
        phone: 'Contact admin for details', // Privacy protected
        city: item.city || item.professional_city || item.location, // Try different possible field names
        daily_wage_net: null, // Not exposed in public list
        skills: item.skills || [],
        technologies: item.technologies || [],
        languages: item.languages || [],
        work_experience: item.work_experience,
        available: item.available,
        available_from: item.availableFrom || item.available_from,
        profile_image: item.profile_image_src || null,
      }));

      setProfessionals(transformedProfessionals);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load professionals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistancesForProfessionals = async (professionalsData: FavoriteProfessional[]) => {
    if (!companyAddress) {
      return;
    }

    try {
      console.log('Calculating distances using batch method for company dashboard...');
      const professionalCities = professionalsData.map(p => p.city).filter(Boolean);
      const distances = await batchCalculateDistances(companyAddress, professionalCities);

      const professionalsWithDistance = professionalsData.map((professional, originalIndex) => {
        if (!professional.city) {
          return { ...professional, distance: null };
        }
        const cityIndex = professionalCities.indexOf(professional.city);
        const distance = cityIndex >= 0 ? distances[cityIndex] : null;
        return { ...professional, distance };
      });

      setProfessionals(professionalsWithDistance);
    } catch (error) {
      console.error('Error calculating distances:', error);
    }
  };

  // Calculate distances when company address is available
  useEffect(() => {
    if (companyAddress && professionals.length > 0) {
      // Only calculate if distances haven't been calculated yet
      const hasDistances = professionals.some(p => p.distance !== undefined);
      if (!hasDistances) {
        calculateDistancesForProfessionals(professionals);
      }
    }
  }, [companyAddress, professionals]);

  // Create favorites list from professionals that are marked as favorites
  const favorites = professionals.filter(professional =>
    favoriteIds.includes(professional.id)
  );

  if (loading || !authorized) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            {!authorized ? "Checking authorization..." : "Loading..."}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
            <p className="text-gray-600">Manage your favorite professionals</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your Favorite Professionals</h2>
            <p className="text-gray-600 text-sm">
              Professionals you've marked as favorites. Contact our admin team to get in touch.
            </p>
          </div>

          {favorites.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No favorites yet. Contact our admin team to add professionals to your favorites.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(professional => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onCardClick={handleProfessionalClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        <EditCompanyProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={currentUser?.id || ''}
        />
      </div>
    </Layout>
  );
};
