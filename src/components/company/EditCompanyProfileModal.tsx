import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CompanyProfile {
  company_name: string;
  contact_person: string;
  website: string;
  industry: string;
  company_size: string;
  address: string;
  description: string;
}

interface EditCompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const EditCompanyProfileModal = ({ isOpen, onClose, userId }: EditCompanyProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Company profile data
  const [profileData, setProfileData] = useState<CompanyProfile>({
    company_name: '',
    contact_person: '',
    website: '',
    industry: '',
    company_size: '',
    address: '',
    description: '',
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
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
    "Government",
    "Non-profit",
    "Agriculture",
    "Automotive",
    "Aerospace",
    "Telecommunications",
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

  useEffect(() => {
    if (isOpen && userId) {
      fetchCompanyProfile();
    }
  }, [isOpen, userId]);

  const fetchCompanyProfile = async () => {
    setFetchingData(true);
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load company profile data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfileData({
          company_name: data.company_name || '',
          contact_person: data.contact_person || '',
          website: data.website || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          address: (data as any).address || '', // Use type assertion since address might not be in the type yet
          description: data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      toast({
        title: "Error",
        description: "Failed to load company profile data",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!profileData.contact_person || !profileData.industry || !profileData.company_size || !profileData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update company_profiles table
      const { error: companyError } = await supabase
        .from('company_profiles')
        .update({
          contact_person: profileData.contact_person,
          website: profileData.website,
          industry: profileData.industry,
          company_size: profileData.company_size,
          address: profileData.address,
          description: profileData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (companyError) {
        toast({
          title: "Error",
          description: "Failed to update company profile",
          variant: "destructive",
        });
        return;
      }

      // Also update the full_name in profiles table to match contact_person
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.contact_person,
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile full_name:', profileError);
        // Don't fail the entire operation if profile update fails, just log it
        toast({
          title: "Warning",
          description: "Company profile updated, but there was an issue updating the user profile name",
          variant: "destructive",
        });
      }

      // Also update the auth user's display name
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.contact_person,
          display_name: profileData.contact_person
        }
      });

      if (authUpdateError) {
        console.error('Error updating auth user display name:', authUpdateError);
        // This is not critical, so we'll just log it
      }

      if (!profileError && !authUpdateError) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8 || !/\d/.test(passwordData.newPassword) || !/[A-Z]/.test(passwordData.newPassword)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters with 1 number and 1 capital letter",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update password directly - Supabase will handle current password verification
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) {
        toast({
          title: "Error",
          description: updateError.message || "Failed to update password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });

      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab('profile');
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company Profile</DialogTitle>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading profile data...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Company Information</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={profileData.company_name}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500">Company name cannot be changed</p>
              </div>

              {/* Two column layout for the rest of the fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    placeholder="Enter contact person name"
                    value={profileData.contact_person}
                    onChange={(e) => setProfileData(prev => ({ ...prev, contact_person: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="Enter company website"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={profileData.industry}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, industry: value }))}
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
                  <Label htmlFor="company_size">Company Size *</Label>
                  <Select
                    value={profileData.company_size}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, company_size: value }))}
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
              </div>

              {/* Full width fields */}
              <div className="space-y-2">
                <Label htmlFor="address">Company Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter company address"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your company"
                  value={profileData.description}
                  onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with 1 number and 1 capital letter
              </p>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {activeTab === 'profile' ? (
            <Button onClick={handleProfileSubmit} disabled={loading || fetchingData}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Profile
            </Button>
          ) : (
            <Button onClick={handlePasswordSubmit} disabled={loading || fetchingData}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
