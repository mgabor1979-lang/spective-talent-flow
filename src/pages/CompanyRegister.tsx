import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { CompanyRegistration } from '@/components/registration/CompanyRegistration';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CompanyRegistrationData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  companySize: string;
  description: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  address: string;
}

export const CompanyRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: CompanyRegistrationData) => {
    try {
      setLoading(true);

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.contactPerson,
            role: 'company'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update profile with additional information (role is already set by trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: data.phone,
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        throw profileError;
      }

      // Create company profile using the security definer function
      const { error: companyProfileError } = await supabase
        .rpc('create_company_profile' as any, {
          p_user_id: authData.user.id,
          p_company_name: data.companyName,
          p_contact_person: data.contactPerson,
          p_industry: data.industry,
          p_company_size: data.companySize,
          p_website: data.website || null,
          p_description: data.description,
          p_address: data.address
        });

      if (companyProfileError) {
        throw companyProfileError;
      }

      // Note: User role and profile role are automatically set by the improved handle_new_user() trigger
      // No need to manually update roles here since the trigger now checks user metadata for role

      // Note: registration_requests entry is automatically created by the handle_new_user() trigger
      // No need to explicitly create it here to avoid duplicates

      console.log('Company registration completed for:', data.companyName);

      toast({
        title: "Registration Successful!",
        description: "Your company registration has been submitted for admin approval. Please check your email to verify your account.",
      });

      await supabase.auth.signOut(); // Sign out after registration
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Company Registration</CardTitle>
              <CardDescription className="text-center">
                Register your company to access our talent network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyRegistration onSubmit={handleSubmit} loading={loading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
