import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { ContactManagement } from '@/components/admin/ContactManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SiteSettings } from '@/components/admin/SiteSettings';
import { DocumentManagement } from '@/components/admin/DocumentManagement';

import {
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Building2,
  Shield,
  FileText
} from 'lucide-react';

export const Admin = () => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Valid tab values
  const validTabs = ['dashboard', 'users', 'documents', 'companies', 'contacts', 'settings'];

  // Get current tab from URL, default to 'dashboard'
  const urlTab = searchParams.get('tab');
  const currentTab = urlTab && validTabs.includes(urlTab) ? urlTab : 'dashboard';

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    if (validTabs.includes(value)) {
      setSearchParams({ tab: value });
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);

        if (!session?.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if current user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        const hasAdminRole = roles?.some(r => r.role === 'admin') || false;
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <Badge variant="secondary" className="ml-2">Administrator</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage users, content, settings and monitor system performance
          </p>
        </div>

        {/* Admin Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value='documents' className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Companies</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManagement />
          </TabsContent>
          
          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};