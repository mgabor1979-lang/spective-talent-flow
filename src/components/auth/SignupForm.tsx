import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useTermsConditions } from '@/hooks/use-terms-conditions';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CitySelector } from '@/components/ui/city-selector';
import { PasswordStrengthMeter } from '@/components/registration/PasswordStrengthMeter';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProfessionalSignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthDate: Date | undefined;
  city: string;
  acceptTerms: boolean;
}

interface CompanySignupData {
  companyName: string;
  contactPerson: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  address: string;
  description: string;
  acceptTerms: boolean;
}

export const SignupForm = () => {
  const [userType, setUserType] = useState<'professional' | 'company'>('professional');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { termsUrl } = useTermsConditions();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => {
    // Initialize calendar to show a reasonable birth year (current year - 25)
    const defaultYear = new Date().getFullYear() - 25;
    return new Date(defaultYear, 0, 1);
  });
  const navigate = useNavigate();

  // Professional form state
  const [professionalData, setProfessionalData] = useState<ProfessionalSignupData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: undefined,
    city: '',
    acceptTerms: false,
  });

  // Company form state
  const [companyData, setCompanyData] = useState<CompanySignupData>({
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    address: '',
    description: '',
    acceptTerms: false,
  });

  const industries = [
    "Technology",
    "Healthcare", 
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Construction",
    "Transportation",
    "Energy",
    "Media & Entertainment",
    "Food & Beverage",
    "Real Estate",
    "Consulting",
    "Other"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees", 
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
  ];

  const validateForm = () => {
    if (userType === 'professional') {
      const { fullName, email, password, confirmPassword, phone, city, acceptTerms, birthDate } = professionalData;
      
      if (!fullName || !email || !password || !confirmPassword || !phone || !city || !birthDate) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields.",
        });
        return false;
      }
      
      // Validate age (must be 18 or older)
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
      
      if (actualAge < 18) {
        toast({
          variant: "destructive",
          title: "Age Requirement",
          description: "You must be at least 18 years old to register.",
        });
        return false;
      }
      
      if (password !== confirmPassword) {
        toast({
          variant: "destructive", 
          title: "Password Mismatch",
          description: "Passwords do not match.",
        });
        return false;
      }
      
      if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
        toast({
          variant: "destructive",
          title: "Weak Password",
          description: "Password must be at least 8 characters with 1 number and 1 capital letter.",
        });
        return false;
      }
      
      if (!acceptTerms) {
        toast({
          variant: "destructive",
          title: "Terms Required",
          description: "You must accept the privacy policy.",
        });
        return false;
      }
      
    } else {
      const { companyName, contactPerson, email, password, confirmPassword, phone, industry, companySize, address, acceptTerms } = companyData;
      
      if (!companyName || !contactPerson || !email || !password || !confirmPassword || !phone || !industry || !companySize || !address) {
        toast({
          variant: "destructive",
          title: "Missing Information", 
          description: "Please fill in all required fields.",
        });
        return false;
      }
      
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Password Mismatch",
          description: "Passwords do not match.",
        });
        return false;
      }
      
      if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
        toast({
          variant: "destructive",
          title: "Weak Password",
          description: "Password must be at least 8 characters with 1 number and 1 capital letter.",
        });
        return false;
      }
      
      if (!acceptTerms) {
        toast({
          variant: "destructive",
          title: "Terms Required",
          description: "You must accept the privacy policy.",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const data = userType === 'professional' ? professionalData : companyData;
      const role = userType === 'professional' ? 'professional' : 'company';
      
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: userType === 'professional' ? professionalData.fullName : companyData.contactPerson,
            role: role
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Account Exists",
            description: "An account with this email already exists. Please try logging in instead.",
          });
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: data.email,
          full_name: userType === 'professional' ? professionalData.fullName : companyData.contactPerson,
          phone: data.phone,
          role: role as any,
          ...(userType === 'professional' && professionalData.birthDate && { 
            birth_date: professionalData.birthDate.toISOString().split('T')[0]
          })
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }


      // Create specific profile based on user type
      if (userType === 'professional') {
        const { error: professionalProfileError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: authData.user.id,
            city: professionalData.city,
            profile_status: 'pending'
          });

        if (professionalProfileError) {
          console.error('Professional profile creation error:', professionalProfileError);
        }
      } else {
        // Create company profile
        const { error: companyProfileError } = await supabase
          .rpc('create_company_profile' as any, {
            p_user_id: authData.user.id,
            p_company_name: companyData.companyName,
            p_contact_person: companyData.contactPerson,
            p_industry: companyData.industry,
            p_company_size: companyData.companySize,
            p_website: companyData.website,
            p_description: companyData.description,
            p_address: companyData.address
          });

        if (companyProfileError) {
          console.error('Company profile creation error:', companyProfileError);
        }
      }

      // Sign out user immediately after registration
      await supabase.auth.signOut();

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account. After verification, your account will be reviewed by our admin team.",
      });

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

  const currentPassword = userType === 'professional' ? professionalData.password : companyData.password;

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join our platform and get started today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={userType} onValueChange={(value) => setUserType(value as 'professional' | 'company')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="professional" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={professionalData.fullName}
                  onChange={(e) => setProfessionalData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={professionalData.email}
                  onChange={(e) => setProfessionalData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={professionalData.phone}
                  onChange={(e) => setProfessionalData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Birth Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !professionalData.birthDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {professionalData.birthDate ? format(professionalData.birthDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="flex gap-2">
                        <Select
                          value={calendarDate.getMonth().toString()}
                          onValueChange={(month) => {
                            const newDate = new Date(calendarDate);
                            newDate.setMonth(parseInt(month));
                            setCalendarDate(newDate);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: 0, label: "January" },
                              { value: 1, label: "February" },
                              { value: 2, label: "March" },
                              { value: 3, label: "April" },
                              { value: 4, label: "May" },
                              { value: 5, label: "June" },
                              { value: 6, label: "July" },
                              { value: 7, label: "August" },
                              { value: 8, label: "September" },
                              { value: 9, label: "October" },
                              { value: 10, label: "November" },
                              { value: 11, label: "December" },
                            ].map((month) => (
                              <SelectItem key={month.value} value={month.value.toString()}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={calendarDate.getFullYear().toString()}
                          onValueChange={(year) => {
                            const newDate = new Date(calendarDate);
                            newDate.setFullYear(parseInt(year));
                            setCalendarDate(newDate);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: new Date().getFullYear() - 18 - 1900 + 1 }, (_, i) => new Date().getFullYear() - 18 - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={professionalData.birthDate}
                      onSelect={(date) => date && setProfessionalData(prev => ({ ...prev, birthDate: date }))}
                      month={calendarDate}
                      onMonthChange={setCalendarDate}
                      disabled={(date) => {
                        const eighteenYearsAgo = new Date();
                        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
                        return date > eighteenYearsAgo || date < new Date("1900-01-01");
                      }}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>City *</Label>
                <CitySelector
                  value={professionalData.city}
                  onChange={(value) => setProfessionalData(prev => ({ ...prev, city: value }))}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="company" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  placeholder="Enter contact person name"
                  value={companyData.contactPerson}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email Address *</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  placeholder="Enter company email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone Number *</Label>
                <Input
                  id="companyPhone"
                  placeholder="Enter company phone"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="Enter company website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={companyData.industry}
                  onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size *</Label>
                <Select
                  value={companyData.companySize}
                  onValueChange={(value) => setCompanyData(prev => ({ ...prev, companySize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address *</Label>
                <Input
                  id="companyAddress"
                  placeholder="Enter company address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your company"
                  value={companyData.description}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </TabsContent>
            
            {/* Common fields for both types */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={currentPassword}
                  onChange={(e) => {
                    if (userType === 'professional') {
                      setProfessionalData(prev => ({ ...prev, password: e.target.value }));
                    } else {
                      setCompanyData(prev => ({ ...prev, password: e.target.value }));
                    }
                  }}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <PasswordStrengthMeter password={currentPassword} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={userType === 'professional' ? professionalData.confirmPassword : companyData.confirmPassword}
                  onChange={(e) => {
                    if (userType === 'professional') {
                      setProfessionalData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    } else {
                      setCompanyData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    }
                  }}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={userType === 'professional' ? professionalData.acceptTerms : companyData.acceptTerms}
                onCheckedChange={(checked) => {
                  if (userType === 'professional') {
                    setProfessionalData(prev => ({ ...prev, acceptTerms: checked as boolean }));
                  } else {
                    setCompanyData(prev => ({ ...prev, acceptTerms: checked as boolean }));
                  }
                }}
                className="mt-1"
              />
              <div className="text-sm">
                I accept the{" "}
                {termsUrl ? (
                  <a 
                    href={termsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline underline-offset-4 hover:text-blue-800 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    privacy policy
                  </a>
                ) : (
                  <span className="text-blue-600 underline underline-offset-4">
                    privacy policy
                  </span>
                )}
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Tabs>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              className="p-0 text-blue-600 font-medium"
            >
              Sign in here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
