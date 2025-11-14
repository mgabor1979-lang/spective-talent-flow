import { User, MapPin, Euro, Phone, Mail, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistance } from '@/lib/distance-utils';

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
    daily_wage_net?: number | string;
    work_experience?: string;
    education?: string;
    skills?: string[];
    languages?: string[];
    technologies?: string[];
    city?: string;
    available?: boolean;
    availablefrom?: string;
    range?: number | null;
  };
}

interface InfoCardProps {
  profileData: ProfileData;
  isOwner: boolean;
  isAdmin: boolean;
  isCompany: boolean;
  distance: number | null;
  distanceLoading: boolean;
  companyAddress: string | null;
  onEditPersonalInfo: () => void;
  onEditAvailability: () => void;
}

export const InfoCard = ({
  profileData,
  isOwner,
  isAdmin,
  isCompany,
  distance,
  distanceLoading,
  companyAddress,
  onEditPersonalInfo,
  onEditAvailability,
}: InfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </div>
          {(isOwner || isAdmin) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditPersonalInfo}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {profileData.phone && profileData.phone !== '******' && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profileData.email}</span>
          </div>

          {profileData.professional_profile?.daily_wage_net && profileData.professional_profile.daily_wage_net !== '****' && (
            <div className="flex items-center space-x-3">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{Number.parseFloat(profileData.professional_profile.daily_wage_net as string)} / day</span>
            </div>
          )}

          {!isCompany && profileData.professional_profile?.city && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.professional_profile.city}</span>
            </div>
          )}

          {/* Distance display for company users only */}
          {isCompany && !isOwner && distance !== null && (
            <div className="flex items-center space-x-3 bg-emerald-50 rounded-md">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">
                {formatDistance(distance)} away
              </span>
            </div>
          )}

          {/* Distance loading indicator */}
          {isCompany && !isOwner && distanceLoading && distance === null && (
            <div className="flex items-center space-x-3 bg-gray-50 rounded-md">
              <MapPin className="h-4 w-4 text-muted-foreground animate-pulse" />
              <span className="text-sm text-muted-foreground">
                🔄 Calculating distance...
              </span>
            </div>
          )}

          {/* Availability Status */}
          {profileData.role === 'professional' && profileData.professional_profile && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {profileData.professional_profile.available ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {profileData.professional_profile.available ? 'Available Now' : 'Currently Unavailable'}
                    </p>
                    {!profileData.professional_profile.available && profileData.professional_profile.availablefrom && (
                      <p className="text-xs text-muted-foreground">
                        Available from {new Date(profileData.professional_profile.availablefrom).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {(isOwner || isAdmin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEditAvailability}
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
