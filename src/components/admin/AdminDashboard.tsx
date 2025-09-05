import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEmailServiceStatus } from '@/hooks/use-email-service-status';
import { 
  Users, 
  UserCheck, 
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalProfessionals: number;
  activeProfessionals: number;
  pendingRegistrations: number;
  totalContacts: number;
  newRegistrationsThisWeek: number;
  approvedThisWeek: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProfessionals: 0,
    activeProfessionals: 0,
    pendingRegistrations: 0,
    totalContacts: 0,
    newRegistrationsThisWeek: 0,
    approvedThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const { status: emailStatus, loading: emailLoading } = useEmailServiceStatus();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get total professionals
        const { count: totalProfessionals } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'professional');

        // Get active professionals (approved and searchable)
        const { count: activeProfessionals } = await supabase
          .from('professional_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('profile_status', 'approved')
          .eq('is_searchable', true);

        // Get pending registrations
        const { count: pendingRegistrations } = await supabase
          .from('registration_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Get total contacts (will fallback gracefully if table doesn't exist)
        let totalContacts = 0;
        try {
          const { count } = await supabase
            .from('contact_requests')
            .select('*', { count: 'exact', head: true });
          totalContacts = count || 0;
        } catch (contactError) {
          console.warn('Contact requests table not accessible:', contactError);
          // Keep default count of 0
        }

        // Get new registrations this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count: newRegistrationsThisWeek } = await supabase
          .from('registration_requests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString());

        // Get approved this week
        const { count: approvedThisWeek } = await supabase
          .from('registration_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('approved_at', oneWeekAgo.toISOString());

        setStats({
          totalProfessionals: totalProfessionals || 0,
          activeProfessionals: activeProfessionals || 0,
          pendingRegistrations: pendingRegistrations || 0,
          totalContacts: totalContacts,
          newRegistrationsThisWeek: newRegistrationsThisWeek || 0,
          approvedThisWeek: approvedThisWeek || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    const loadingCards = ['total-professionals', 'active-professionals', 'pending-registrations', 'contact-requests', 'new-this-week', 'approved-this-week'];
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loadingCards.map((cardId) => (
          <Card key={cardId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Professionals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Professionals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfessionals}</div>
            <p className="text-xs text-muted-foreground">
              Registered professionals
            </p>
          </CardContent>
        </Card>

        {/* Active Professionals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Professionals</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeProfessionals}</div>
            <p className="text-xs text-muted-foreground">
              Approved & searchable
            </p>
          </CardContent>
        </Card>

        {/* Pending Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        {/* Total Contact Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Companies interested
            </p>
          </CardContent>
        </Card>

        {/* New This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.newRegistrationsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>

        {/* Approved This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approvedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Recently approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Service Status</span>
              {(() => {
                if (emailLoading) {
                  return (
                    <Badge variant="secondary" className="animate-pulse">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  );
                }
                
                if (emailStatus.isOperational) {
                  return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational ({emailStatus.usageStats.daily}/{emailStatus.usageStats.dailyLimit} daily)
                    </Badge>
                  );
                }
                
                return (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {emailStatus.error || 'Service Error'}
                  </Badge>
                );
              })()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Actions</span>
              <Badge variant={stats.pendingRegistrations > 0 ? "destructive" : "secondary"}>
                {stats.pendingRegistrations} registrations awaiting review
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Rate</span>
              <Badge variant="secondary">
                {stats.totalProfessionals > 0 
                  ? Math.round((stats.activeProfessionals / stats.totalProfessionals) * 100)
                  : 0}% of professionals active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};