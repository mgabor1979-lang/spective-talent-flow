import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { toast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react';
import { BasicInfoStep } from '@/components/registration/BasicInfoStep';
import { ProfessionalWizard, ProfessionalWizardData } from '@/components/registration/ProfessionalWizard';
import { DATA_SEPARATORS } from '@/lib/data-separators';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'professional' | 'partner'>('professional');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'basic' | 'professional' | 'complete'>('basic');
  const [registrationData, setRegistrationData] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if this is the professional wizard step
    const step = searchParams.get('step');
    console.log('URL step parameter:', step);
    
    if (step === 'professional') {
      setRegistrationStep('professional');
      setIsLogin(false);
      console.log('Set to professional step');
    } else {
      // Determine if this should be login or signup based on the current path
      const path = location.pathname;
      if (path === '/signup' || path === '/register') {
        setIsLogin(false);
        setRegistrationStep('basic');
      } else {
        setIsLogin(true);
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        // Don't redirect if user is completing professional profile
        const step = searchParams.get('step');
        if (step === 'professional' && session?.user) {
          console.log('User completing professional profile, staying on page');
          return;
        }
        
        // For SIGNED_IN events, let the handleSubmit function handle status checks and redirection
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, handleSubmit will handle status validation');
          return;
        }
        
        // For SIGNED_OUT events, ensure we're on the login page
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      
      // Check if user is accessing professional wizard
      const step = searchParams.get('step');
      if (step === 'professional' && session?.user) {
        console.log('User has session and trying to access professional wizard');
        
        // Check if user already has a professional profile
        const { data: professionalProfile } = await supabase
          .from('professional_profiles')
          .select('work_experience')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (professionalProfile?.work_experience) {
          console.log('User already has professional profile, redirecting to profile');
          navigate('/profile');
          return;
        }
        
        console.log('User needs to complete professional profile, staying on wizard');
        return;
      }
      
      // Check if user status allows login for existing sessions
      if (session?.user) {
        const statusResult = await checkUserStatus(session.user.id);
        if (!statusResult.canLogin) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied", 
            description: statusResult.message,
            variant: "destructive",
          });
          return;
        }
        console.log('Redirecting authenticated user from initial session check');
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  const checkUserStatus = async (userId: string) => {
    try {
      // Check registration request status
      const { data: registrationData } = await supabase
        .from('registration_requests')
        .select('status')
        .eq('user_id', userId)
        .single();

      // Check user role to determine which profile to check
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isCompanyUser = roleData?.some(r => r.role === 'company');

      if (isCompanyUser) {
        // Check company profile status
        const { data: companyProfileData } = await supabase
          .from('company_profiles')
          .select('profile_status')
          .eq('user_id', userId)
          .single();

        const companyStatus = companyProfileData?.profile_status;
        const registrationStatus = registrationData?.status;

        // Company users need approved status to login
        if (registrationStatus === 'rejected' || companyStatus === 'rejected') {
          setSession(null);
          await supabase.auth.signOut();
          return { 
            canLogin: false, 
            message: "Your company account has been rejected. Please contact support if you believe this is an error." 
          };
        }

        if (registrationStatus === 'pending' || companyStatus === 'pending') {
          setSession(null);
          await supabase.auth.signOut();
          return { 
            canLogin: false, 
            message: "Your company account is pending approval. You will be notified when it's approved." 
          };
        }

        if (companyStatus !== 'approved') {
          setSession(null);
          await supabase.auth.signOut();

          return { 
            canLogin: false, 
            message: "Your company account needs to be approved before you can login." 
          };
        }

        return { canLogin: true, message: null };
      } else {
        // Check professional profile status for non-company users
        const { data: profileData } = await supabase
          .from('professional_profiles')
          .select('profile_status')
          .eq('user_id', userId)
          .single();

        // User is rejected if either registration is rejected or profile is rejected
        const isRejected = (
          registrationData?.status === 'rejected' || 
          profileData?.profile_status === 'rejected'
        );

        if (isRejected) {
          // Clear session state immediately
          setSession(null);
          await supabase.auth.signOut();
          return { 
            canLogin: false, 
            message: "Your account has been rejected. Please contact support if you believe this is an error." 
          };
        }

        return { canLogin: true, message: null };
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // If we can't check status, allow access (fail open)
      setSession(null);
      await supabase.auth.signOut();
      return { canLogin: true, message: null };
    }
  };

  const handleBasicRegistration = async (data: any) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth?step=professional`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
            phone: data.phone,
            birth_date: data.birthDate.toISOString().split('T')[0],
          }
        }
      });
      
      if (error) throw error;
      
      // Update profile with additional information
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
            phone: data.phone,
            birth_date: data.birthDate.toISOString().split('T')[0],
          })
          .eq('user_id', authData.user.id);
          
        if (profileError) console.error('Profile update error:', profileError);
      }
      
      setRegistrationData(data);
      setRegistrationStep('professional');
      
      toast({
        title: "Account created successfully!",
        description: "Please complete your professional profile to continue.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalWizard = async (data: ProfessionalWizardData) => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      // Convert work experiences to string for storage using unique separator
      const workExperienceText = data.workExperienceSummary + DATA_SEPARATORS.WORK_EXPERIENCE + 
        data.workExperiences.map(exp => {
          const startDate = `${exp.startMonth} ${exp.startYear}`;
          const endDate = exp.isCurrentJob ? 'Present' : `${exp.endMonth} ${exp.endYear}`;
          const duration = `${startDate} - ${endDate}`;
          return `${exp.position} at ${exp.company} (${duration}): ${exp.description}`;
        }).join(DATA_SEPARATORS.WORK_EXPERIENCE);

      // Convert education to string for storage using unique separator
      const educationText = data.educations.map(edu => {
        const endYear = edu.isCurrent ? 'Present' : edu.endYear;
        const duration = `${edu.startYear} - ${endYear}`;
        return `${edu.degree} at ${edu.school} (${duration})`;
      }).join(DATA_SEPARATORS.EDUCATION);

      // Convert languages to simple string array for storage
      const languageStrings = data.languages.map(lang => `${lang.language} (${lang.level})`);
      
      // Convert skills to simple string array for storage
      const skillStrings = data.skills.map(skill => `${skill.skill} (${skill.level})`);

      const { error } = await supabase
        .from('professional_profiles')
        .update({
          daily_wage_net: data.dailyWageNet,
          work_experience: workExperienceText,
          education: educationText,
          skills: skillStrings,
          languages: languageStrings,
          technologies: data.technologies,
          city: registrationData?.city,
          terms_accepted: data.acceptTerms,
        })
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      setRegistrationStep('complete');
      
      toast({
        title: "Profile completed!",
        description: "Your profile has been submitted for review. You'll be notified once it's approved.",
      });
      
      // Redirect to profile after a brief delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Profile submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('Attempting signup with:', { email, redirectUrl });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    console.log('Signup result:', { data, error });
    return { error };
  };

  const handleSignIn = async (email: string, password: string) => {
    console.log('Attempting signin with:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Signin result:', { data, error });
    
    // Check if user status allows login immediately after successful login
    if (!error && data.user) {
      const statusResult = await checkUserStatus(data.user.id);
      if (!statusResult.canLogin) {
        console.log('User status check failed, signing out immediately');
        // Clear session state immediately
        setSession(null);
        await supabase.auth.signOut();
        console.log('Sign out completed');
        return { 
          error: { 
            message: statusResult.message
          } 
        };
      }

      // Check user role and validate against selected user type
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const userRole = profileData?.role;

      // Validate user type selection against actual user role
      if (userType === 'partner' && userRole !== 'company') {
        await supabase.auth.signOut();
        return { 
          error: { 
            message: "This account is not a company account. Please select 'Professional' to login." 
          } 
        };
      }

      if (userType === 'professional' && userRole === 'company') {
        await supabase.auth.signOut();
        return { 
          error: { 
            message: "This is a company account. Please select 'Partner' to login." 
          } 
        };
      }
    }
    
    return { data, error };
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      let result;
      
      if (isLogin) {
        result = await handleSignIn(email, password);
      } else {
        result = await handleSignUp(email, password);
      }

      if (result.error) {
        if (result.error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Account Exists",
            description: "An account with this email already exists. Please try logging in instead.",
          });
          setIsLogin(true);
        } else if (result.error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
          });
        } else {
          toast({
            variant: "destructive",
            title: isLogin ? "Login Failed" : "Registration Failed",
            description: result.error.message,
          });
        }
      } else {
        if (!isLogin) {
          toast({
            title: "Account Created",
            description: "Please check your email to confirm your account before logging in.",
          });
          setIsLogin(true);
        } else {
          // Check user role and redirect accordingly
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', result.data?.user?.id)
            .single();

          // If company user, enforce approved company profile before allowing login
          if (profileData?.role === 'company') {
            const { data: companyProfile } = await supabase
              .from('company_profiles')
              .select('profile_status')
              .eq('user_id', result.data?.user?.id)
              .maybeSingle();

            const status = companyProfile?.profile_status;
            if (status !== 'approved') {
              // Sign the user out immediately and show an explanatory message
              await supabase.auth.signOut();
              toast({
                variant: 'destructive',
                title: 'Access denied',
                description: status === 'rejected'
                  ? 'Your company account was rejected. Contact support if you believe this is an error.'
                  : 'Your company account is pending approval. You will be able to login once it is approved.'
              });
              setLoading(false);
              return; // Stop further success handling
            }
          }

          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });

          // Redirect based on user role
          if (profileData?.role === 'company') {
            navigate('/company-dashboard');
          } else {
            navigate('/');
          }
        }
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show completion message
  if (registrationStep === 'complete') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-bold">Registration Complete!</h2>
              <p className="text-muted-foreground">
                Your profile has been submitted for review. You'll receive an email notification once it's approved.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show professional wizard for step 2
  if (!isLogin && registrationStep === 'professional') {
    // Check if user is authenticated
    if (!session?.user) {
      return (
        <Layout>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center space-y-4">
                <h2 className="text-2xl font-bold">Authentication Required</h2>
                <p className="text-muted-foreground">
                  Please sign in to complete your professional profile.
                </p>
                <Button onClick={() => {
                  setIsLogin(true);
                  setRegistrationStep('basic');
                }} className="w-full">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl w-full">
            <CardContent className="pt-6">
              <ProfessionalWizard 
                onComplete={handleProfessionalWizard} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show basic registration form
  if (!isLogin && registrationStep === 'basic') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <BasicInfoStep 
                onNext={handleBasicRegistration} 
                loading={loading}
              />
              <div className="text-center mt-6">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(true)}
                  className="text-sm"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show login form
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to sign in
              </CardDescription>
              
              {/* User Type Switcher */}
              <div className="flex justify-center mt-6 mb-6">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUserType('professional')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      userType === 'professional'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('partner')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      userType === 'partner'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Partner
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    if (userType === 'partner') {
                      navigate('/company-register');
                    } else {
                      setIsLogin(false);
                      setRegistrationStep('basic');
                    }
                  }}
                  className="text-sm"
                >
                  {userType === 'partner' 
                    ? "Don't have a company account? Register here"
                    : "Don't have an account? Sign up"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
