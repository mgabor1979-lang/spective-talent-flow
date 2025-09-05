import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'professional' | 'user' | 'company';

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

export const isCompanyUser = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'company';
};

export const isProfessionalUser = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'professional' || role === 'user';
};

export const isAdminUser = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

export const isApprovedCompanyUser = async (userId: string): Promise<{ isCompany: boolean, isApproved: boolean, status: string }> => {
  try {
    // Check if user is a company user
    const isCompany = await isCompanyUser(userId);
    
    if (!isCompany) {
      return { isCompany: false, isApproved: false, status: 'not_company' };
    }

    // Check company profile status
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('profile_status')
      .eq('user_id', userId)
      .single();

    const status = companyProfile?.profile_status || 'pending';
    const isApproved = status === 'approved';

    return { isCompany: true, isApproved, status };
  } catch (error) {
    console.error('Error checking company approval status:', error);
    return { isCompany: false, isApproved: false, status: 'error' };
  }
};
