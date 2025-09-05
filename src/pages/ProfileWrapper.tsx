import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isCompanyUser } from '@/lib/auth-utils';
import { Profile } from './Profile';

export const ProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // If there's no userId in the URL (accessing /profile), check if user is company
        if (!userId) {
          const isCompany = await isCompanyUser(user.id);
          if (isCompany) {
            // Company users cannot access their own profile page
            navigate('/company-dashboard');
            return;
          }
        }

        // If there's a userId in the URL (/profile/:userId), allow access for all authenticated users
        // This allows companies to view professional profiles and professionals to view other profiles
        setAuthorized(true);
      } catch (error) {
        console.error('Authorization check failed:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [navigate, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <Profile />;
};
