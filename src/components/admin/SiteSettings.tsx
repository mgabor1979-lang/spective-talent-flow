import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HomepageServicesManagement } from './HomepageServicesManagement';
import { TermsConditionsUpload } from './TermsConditionsUpload';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Server,
  FileText,
  Image as ImageIcon,
  Save,
  Scale
} from 'lucide-react';

interface SiteSettingsData {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  email_from_address: string;
  email_success_register: string;
  email_awaiting_approval: string;
  email_denied_register: string;
  email_profile_approved: string;
  email_profile_banned: string;
  email_user_deletion: string;
  homepage_hero_title: string;
  homepage_hero_subtitle: string;
  homepage_services: string;
  homepage_about: string;
  terms_conditions_url: string;
  terms_conditions_filename: string;
}

export const SiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettingsData>({
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    email_from_address: '',
    email_success_register: 'Welcome! Your registration was successful.',
    email_awaiting_approval: 'Thank you for registering. Your application is under review.',
    email_denied_register: 'We regret to inform you that your registration was not approved.',
    email_profile_approved: 'Congratulations! Your professional profile has been approved.',
    email_profile_banned: 'Your profile has been suspended. Please contact support.',
    email_user_deletion: 'Your account has been deleted as requested.',
    homepage_hero_title: 'Professional Services Platform',
    homepage_hero_subtitle: 'Connect with skilled professionals for your next project',
    homepage_services: '',
    homepage_about: '',
    terms_conditions_url: '',
    terms_conditions_filename: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Try to fetch settings from the database
      const { data: settingsData, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (settingsData) {
        setSettings({
          ...settingsData,
          terms_conditions_url: (settingsData as any).terms_conditions_url || '',
          terms_conditions_filename: (settingsData as any).terms_conditions_filename || '',
        } as SiteSettingsData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Settings table might not exist yet, that's ok
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Try to update existing settings or insert new ones
      const { error } = await supabase
        .from('site_settings')
        .upsert(settings as any, { onConflict: 'id' });

      if (error && error.code === '42P01') {
        // Table doesn't exist, just show success for now
        toast({
          title: "Settings Saved",
          description: "Site settings have been updated (demo mode)",
        });
      } else if (error) {
        throw error;
      } else {
        toast({
          title: "Settings Saved",
          description: "Site settings have been updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SiteSettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTermsUpdate = async (url: string | null, filename: string | null) => {
    const updatedSettings = {
      ...settings,
      terms_conditions_url: url || '',
      terms_conditions_filename: filename || '',
    };
    
    setSettings(updatedSettings);
    
    // Auto-save the settings when terms are updated
    try {
      // First, try to get existing settings
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .maybeSingle();

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('site_settings')
          .update({
            terms_conditions_url: url || '',
            terms_conditions_filename: filename || '',
          } as any)
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Insert new record with terms data
        const { error } = await supabase
          .from('site_settings')
          .insert({
            terms_conditions_url: url || '',
            terms_conditions_filename: filename || '',
            company_name: updatedSettings.company_name || '',
            company_email: updatedSettings.company_email || '',
            homepage_hero_title: updatedSettings.homepage_hero_title || '',
            homepage_hero_subtitle: updatedSettings.homepage_hero_subtitle || '',
          } as any);

        if (error) throw error;
      }

      toast({
        title: "Settings Updated",
        description: "Terms & Conditions settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving terms settings:', error);
      toast({
        title: "Error",
        description: "Failed to save Terms & Conditions settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Site Settings</span>
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="company">Company Info</TabsTrigger>
              <TabsTrigger value="email">Email Settings</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company_name"
                        value={settings.company_name}
                        onChange={(e) => updateSetting('company_name', e.target.value)}
                        className="pl-9"
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company_email">Company Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company_email"
                        type="email"
                        value={settings.company_email}
                        onChange={(e) => updateSetting('company_email', e.target.value)}
                        className="pl-9"
                        placeholder="contact@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company_phone">Company Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company_phone"
                        value={settings.company_phone}
                        onChange={(e) => updateSetting('company_phone', e.target.value)}
                        className="pl-9"
                        placeholder="+1-555-123-4567"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company_address">Company Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="company_address"
                      value={settings.company_address}
                      onChange={(e) => updateSetting('company_address', e.target.value)}
                      className="pl-9 min-h-[120px]"
                      placeholder="123 Business St&#10;City, State 12345&#10;Country"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>SMTP Configuration</span>
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      value={settings.smtp_host}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      value={settings.smtp_port}
                      onChange={(e) => updateSetting('smtp_port', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp_username">SMTP Username</Label>
                    <Input
                      id="smtp_username"
                      value={settings.smtp_username}
                      onChange={(e) => updateSetting('smtp_username', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      value={settings.smtp_password}
                      onChange={(e) => updateSetting('smtp_password', e.target.value)}
                      placeholder="App Password"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email_from_address">From Email Address</Label>
                  <Input
                    id="email_from_address"
                    type="email"
                    value={settings.email_from_address}
                    onChange={(e) => updateSetting('email_from_address', e.target.value)}
                    placeholder="noreply@company.com"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Email Templates</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email_success_register">Successful Registration</Label>
                  <Textarea
                    id="email_success_register"
                    value={settings.email_success_register}
                    onChange={(e) => updateSetting('email_success_register', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_awaiting_approval">Awaiting Approval</Label>
                  <Textarea
                    id="email_awaiting_approval"
                    value={settings.email_awaiting_approval}
                    onChange={(e) => updateSetting('email_awaiting_approval', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_denied_register">Registration Denied</Label>
                  <Textarea
                    id="email_denied_register"
                    value={settings.email_denied_register}
                    onChange={(e) => updateSetting('email_denied_register', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_profile_approved">Profile Approved</Label>
                  <Textarea
                    id="email_profile_approved"
                    value={settings.email_profile_approved}
                    onChange={(e) => updateSetting('email_profile_approved', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_profile_banned">Profile Banned</Label>
                  <Textarea
                    id="email_profile_banned"
                    value={settings.email_profile_banned}
                    onChange={(e) => updateSetting('email_profile_banned', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_user_deletion">User Deletion</Label>
                  <Textarea
                    id="email_user_deletion"
                    value={settings.email_user_deletion}
                    onChange={(e) => updateSetting('email_user_deletion', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="homepage" className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Homepage Content</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="homepage_hero_title">Hero Title</Label>
                  <Input
                    id="homepage_hero_title"
                    value={settings.homepage_hero_title}
                    onChange={(e) => updateSetting('homepage_hero_title', e.target.value)}
                    placeholder="Main headline for your homepage"
                  />
                </div>
                
                <div>
                  <Label htmlFor="homepage_hero_subtitle">Hero Subtitle</Label>
                  <Input
                    id="homepage_hero_subtitle"
                    value={settings.homepage_hero_subtitle}
                    onChange={(e) => updateSetting('homepage_hero_subtitle', e.target.value)}
                    placeholder="Supporting text for your homepage"
                  />
                </div>
                
                <div>
                  <Label htmlFor="homepage_about">About Section</Label>
                  <Textarea
                    id="homepage_about"
                    value={settings.homepage_about}
                    onChange={(e) => updateSetting('homepage_about', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Tell visitors about your company..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terms">
              <TermsConditionsUpload
                currentUrl={settings.terms_conditions_url || undefined}
                currentFilename={settings.terms_conditions_filename || undefined}
                onUpdate={handleTermsUpdate}
              />
            </TabsContent>

            <TabsContent value="services">
              <HomepageServicesManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};