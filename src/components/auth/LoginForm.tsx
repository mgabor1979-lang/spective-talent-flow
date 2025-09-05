import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message,
          });
        }
        return;
      }

      if (!data.user) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Authentication failed. Please try again.",
        });
        return;
      }

      // Check user approval status
      const statusResult = await checkUserApprovalStatus(data.user.id);
      
      if (!statusResult.canLogin) {
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: statusResult.message,
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      // Redirect based on user role
      if (statusResult.userRole === 'company') {
        navigate('/company-dashboard');
      } else if (statusResult.userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserApprovalStatus = async (userId: string) => {
    try {
      // Get user profile and role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        return { 
          canLogin: false, 
          message: "User profile not found. Please contact support.",
          userRole: null 
        };
      }

      // Check if user has completed email verification
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email_confirmed_at) {
        return { 
          canLogin: false, 
          message: "Please verify your email address before logging in. Check your inbox for a verification link.",
          userRole: profileData.role 
        };
      }

      // Check approval status from registration requests
      const { data: registrationData } = await supabase
        .from('registration_requests')
        .select('status')
        .eq('user_id', userId)
        .single();

      const registrationStatus = registrationData?.status;

      if (registrationStatus === 'rejected') {
        return { 
          canLogin: false, 
          message: "Your account has been rejected. Please contact support if you believe this is an error.",
          userRole: profileData.role 
        };
      }

      if (registrationStatus === 'pending' || !registrationStatus) {
        return { 
          canLogin: false, 
          message: "Your account is pending admin approval. You will be notified by email when it's approved.",
          userRole: profileData.role 
        };
      }

      if (registrationStatus !== 'approved') {
        return { 
          canLogin: false, 
          message: "Your account needs to be approved before you can login. Please wait for admin approval.",
          userRole: profileData.role 
        };
      }

      // For approved users, check role-specific profile status if needed
      if (profileData.role === 'company') {
        const { data: companyProfile } = await supabase
          .from('company_profiles')
          .select('profile_status')
          .eq('user_id', userId)
          .single();

        if (companyProfile?.profile_status === 'rejected') {
          return { 
            canLogin: false, 
            message: "Your company profile has been rejected. Please contact support if you believe this is an error.",
            userRole: profileData.role 
          };
        }

        if (companyProfile?.profile_status !== 'approved') {
          return { 
            canLogin: false, 
            message: "Your company profile is pending approval. You will be notified when it's approved.",
            userRole: profileData.role 
          };
        }
      }

      return { 
        canLogin: true, 
        message: null,
        userRole: profileData.role 
      };

    } catch (error) {
      console.error('Error checking user approval status:', error);
      return { 
        canLogin: false, 
        message: "Unable to verify account status. Please try again later.",
        userRole: null 
      };
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Button
              variant="link"
              onClick={() => navigate('/signup')}
              className="p-0 text-blue-600 font-medium"
            >
              Sign up here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
