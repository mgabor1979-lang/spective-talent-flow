import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useEmail } from '@/hooks/use-email';
import { 
  Building2, 
  Users, 
  Globe, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  ExternalLink,
  FileText,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentManagement } from './DocumentManagement';

interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  description: string | null;
  contact_person: string | null;
  profile_status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
  } | null;
}

export const CompanyManagement = () => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const { sendCompanyApprovalEmail, sendCompanyRejectionEmail } = useEmail();

  const fetchCompanies = async () => {
    try {
      setError(null);
      
      // First, let's try fetching company profiles and user emails separately
      const { data: companyData, error: companyError } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyError) {
        console.error('Error fetching companies:', companyError);
        if (companyError.code === 'PGRST301') {
          setError('Permission denied. Please ensure you have admin privileges and try refreshing the page.');
        } else {
          setError(`Failed to load companies: ${companyError.message}`);
        }
        return;
      }

      // If we have company data, fetch the corresponding profile emails
      if (companyData && companyData.length > 0) {
        const userIds = companyData.map(company => company.user_id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        if (profileError) {
          console.error('Error fetching profile emails:', profileError);
          // Still use company data without emails if profile fetch fails
          setCompanies(companyData as CompanyProfile[]);
          return;
        }

        // Merge the data
        const companiesWithEmails = companyData.map(company => ({
          ...company,
          profiles: profileData?.find(profile => profile.user_id === company.user_id) || null
        }));

        setCompanies(companiesWithEmails as CompanyProfile[]);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('An unexpected error occurred while loading companies.');
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (companyId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const updateData: any = {
        profile_status: newStatus,
      };

      if (newStatus === 'approved') {
        // Set approval metadata when approving
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;
      } else if (newStatus === 'rejected') {
        // Clear approval metadata when rejecting
        updateData.approved_at = null;
        updateData.approved_by = null;
      }

      // Get company details before updating for email notification
      const { data: companyDetails, error: getCompanyError } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', companyId)
        .single();

      if (getCompanyError) throw getCompanyError;

      // Get user email separately
      const { data: userProfile, error: getUserError } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', companyDetails.user_id)
        .single();

      if (getUserError) {
        console.error('Error fetching user email:', getUserError);
      }

      const { data: updatedCompanyUserId, error } = await supabase
        .from('company_profiles')
        .update(updateData)
        .eq('id', companyId)
        .select('user_id').maybeSingle();

      if (error) throw error;

      if(!updatedCompanyUserId) {
        throw new Error('Company not found for update registration approval.');
      }

      const { error: regreq_error } = await supabase
        .from('registration_requests')
        .update({
          status: newStatus,
        })
        .eq('user_id', updatedCompanyUserId.user_id);

      if (regreq_error) throw regreq_error;

      // Send email notification
      await sendCompanyStatusEmail(companyDetails, userProfile?.email, newStatus);

      // Refresh the data
      fetchCompanies();
    } catch (error) {
      toast.error('Error updating company status. Contact administrator.');
      console.error('Error updating company status:', error);
    }
  };

  const sendCompanyStatusEmail = async (companyDetails: any, userEmail: string | undefined, status: 'approved' | 'rejected') => {
    try {
      if (!userEmail) {
        console.error('No email found for company user');
        toast.warning(`Company ${status} successfully, but no email address found for notification.`);
        return;
      }

      const companyName = companyDetails.company_name;
      const contactPerson = companyDetails.contact_person || 'Company Representative';

      if (status === 'approved') {
        const loginUrl = `${window.location.origin}/company-dashboard`;
        const emailResult = await sendCompanyApprovalEmail(
          companyName,
          contactPerson,
          userEmail,
          loginUrl
        );
        
        if (!emailResult.success) {
          console.error('Failed to send approval email:', emailResult.error);
          toast.warning('Company approved successfully, but notification email failed to send.');
        } else {
          toast.success('Company approved and notification email sent successfully!');
        }
      } else if (status === 'rejected') {
        const emailResult = await sendCompanyRejectionEmail(
          companyName,
          contactPerson,
          userEmail,
          undefined, // No specific reason provided
          'support@spective-talent-flow.com'
        );
        
        if (!emailResult.success) {
          console.error('Failed to send rejection email:', emailResult.error);
          toast.warning('Company rejected successfully, but notification email failed to send.');
        } else {
          toast.success('Company rejected and notification email sent successfully!');
        }
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      toast.warning(`Company ${status} successfully, but notification email failed to send.`);
    }
  };

  const deleteCompanyUser = async (company: CompanyProfile) => {
    try {
      // Get current user's session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      // Confirm deletion
      const confirmed = window.confirm(
        `Are you sure you want to delete the user account for "${company.company_name}"?\n\n` +
        `This will permanently delete:\n` +
        `- User account: ${company.profiles?.email}\n` +
        `- Company profile: ${company.company_name}\n` +
        `- All associated data\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) return;

      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: company.user_id }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success(`Company user "${company.company_name}" deleted successfully`);
      
      // Refresh the companies list
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company user:', error);
      toast.error(`Failed to delete company user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || company.profile_status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get unique industries for filter
  const uniqueIndustries = [...new Set(companies.map(c => c.industry).filter(Boolean))];

  const skeletonItems = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5', 'skeleton-6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skeletonItems.map((key) => (
            <Card key={key}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-700">Error Loading Companies</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchCompanies} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="companies" className="space-y-6">
      <TabsList>
        <TabsTrigger value="companies" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Companies
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="companies" className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.profile_status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {companies.filter(c => c.profile_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.profile_status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search companies, contact person, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span className="truncate">{company.company_name}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {company.contact_person}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company.profiles?.email}
                  </p>
                </div>
                <Badge className={`${getStatusColor(company.profile_status)} flex items-center space-x-1`}>
                  {getStatusIcon(company.profile_status)}
                  <span className="capitalize">{company.profile_status}</span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {company.industry && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{company.industry}</span>
                  </div>
                )}
                
                {company.company_size && (
                  <div className="text-sm text-muted-foreground">
                    Company Size: {company.company_size}
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate">{company.website}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Registered {new Date(company.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {company.description && (
                <div className="text-sm text-muted-foreground">
                  <p className="line-clamp-3">{company.description}</p>
                </div>
              )}

              {/* Action buttons based on status */}
              {company.profile_status === 'pending' && (
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => updateCompanyStatus(company.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => updateCompanyStatus(company.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-50"
                    onClick={() => deleteCompanyUser(company)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}

              {company.profile_status === 'approved' && (
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => updateCompanyStatus(company.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-50"
                    onClick={() => deleteCompanyUser(company)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}

              {company.profile_status === 'rejected' && (
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => updateCompanyStatus(company.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Re-approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-50"
                    onClick={() => deleteCompanyUser(company)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Companies Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || industryFilter !== 'all'
                ? 'No companies match your current filters.'
                : 'No companies have registered yet.'}
            </p>
            {!searchTerm && statusFilter === 'all' && industryFilter === 'all' && (
              <div className="text-sm text-muted-foreground max-w-md mx-auto">
                <p className="mb-2">
                  Companies can register through the company registration page. 
                  Once they register, they will appear here for admin approval.
                </p>
                <p>
                  If you expect to see companies but don't, please check:
                </p>
                <ul className="text-left mt-2 space-y-1">
                  <li>• You are logged in as an admin user</li>
                  <li>• Companies have completed the registration process</li>
                  <li>• Database migrations have been applied</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="documents">
        <DocumentManagement />
      </TabsContent>
    </Tabs>
  );
};
