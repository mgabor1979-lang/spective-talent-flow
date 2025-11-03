import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/use-email';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (const cookie of ca) {
    let c = cookie;
    while (c.startsWith(' ')) c = c.substring(1);
    if (c.startsWith(nameEQ)) return c.substring(nameEQ.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  registration_status?: string;
  profile_status?: string;
  is_searchable?: boolean;
  profile_image?: string | null;
}

type UserAction = 'approve' | 'reject' | 'ban' | 'delete' | 'reset-password';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(getCookie('userManagement_searchTerm') || '');
  const [statusFilter, setStatusFilter] = useState(getCookie('userManagement_statusFilter') || 'all');
  const [searchableFilter, setSearchableFilter] = useState(getCookie('userManagement_searchableFilter') || 'all');
  const [roleFilter, setRoleFilter] = useState(getCookie('userManagement_roleFilter') || 'all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<UserAction | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { sendProfessionalApprovalEmail, sendProfessionalRejectionEmail } = useEmail();

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  // Filter change handlers that persist to cookies
  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCookie('userManagement_searchTerm', value, 7);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCookie('userManagement_statusFilter', value, 7);
  };

  const handleSearchableFilterChange = (value: string) => {
    setSearchableFilter(value);
    setCookie('userManagement_searchableFilter', value, 7);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCookie('userManagement_roleFilter', value, 7);
  };

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, searchableFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      // Get professional and admin profiles (exclude company users - they are managed in the Companies tab)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['professional', 'admin']);

      if (profilesError) throw profilesError;

      // Get registration requests
      const { data: registrationRequests, error: regError } = await supabase
        .from('registration_requests')
        .select('*');

      if (regError) throw regError;

      // Get professional profiles
      const { data: professionalProfiles, error: profError } = await supabase
        .from('professional_profiles')
        .select('*');

      if (profError) throw profError;

      // Get profile images
      const { data: profileImages, error: imagesError } = await supabase
        .from('profileimages')
        .select('*');

      if (imagesError) throw imagesError;

      const formattedUsers = profiles?.map(profile => {
        const registrationRequest = registrationRequests?.find(req => req.user_id === profile.user_id);
        const professionalProfile = professionalProfiles?.find(prof => prof.user_id === profile.user_id);
        const profileImage = profileImages?.find(img => img.uid === profile.user_id);

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at,
          registration_status: registrationRequest?.status || 'none',
          profile_status: professionalProfile?.profile_status || 'none',
          is_searchable: professionalProfile?.is_searchable || false,
          profile_image: profileImage?.src || null,
          phone: profile.phone
        };
      }) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.registration_status === statusFilter);
    }

    // Searchable filter
    if (searchableFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (searchableFilter === 'searchable') {
          return user.is_searchable === true;
        } else if (searchableFilter === 'not-searchable') {
          return user.is_searchable === false;
        }
        return true;
      });
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      switch (actionType) {
        case 'approve':
          await approveUser(selectedUser);
          break;
        case 'reject':
          await rejectUser(selectedUser);
          break;
        case 'ban':
          await banUser(selectedUser);
          break;
        case 'delete':
          await deleteUser(selectedUser);
          break;
        case 'reset-password':
          await resetUserPassword(selectedUser);
          break;
      }

      toast({
        title: "Success",
        description: `User ${actionType === 'reset-password' ? 'password reset email sent' : actionType + 'd'} successfully`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} user`,
        variant: "destructive",
      });
    } finally {
      setShowDialog(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const approveUser = async (user: User) => {
    // Update registration request
    await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('user_id', user.user_id);

    // Update professional profile if exists
    await supabase
      .from('professional_profiles')
      .update({ profile_status: 'approved' })
      .eq('user_id', user.user_id);

    // Send approval email
    try {
      const loginUrl = `${window.location.origin}/`;
      const emailResult = await sendProfessionalApprovalEmail(
        user.full_name,
        user.email,
        loginUrl
      );

      if (!emailResult.success) {
        console.error('Failed to send approval email:', emailResult.error);
        // Don't throw error - approval succeeded even if email failed
        toast({
          title: "User Approved",
          description: "User approved successfully, but notification email failed to send.",
          variant: "default",
        });
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't throw error - approval succeeded even if email failed
    }
  };

  const rejectUser = async (user: User) => {
    await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('user_id', user.user_id);

    // Send rejection email
    try {
      const emailResult = await sendProfessionalRejectionEmail(
        user.full_name,
        user.email,
        undefined, // No specific reason provided
        'support@spective-talent-flow.com'
      );

      if (!emailResult.success) {
        console.error('Failed to send rejection email:', emailResult.error);
        // Don't throw error - rejection succeeded even if email failed
        toast({
          title: "User Rejected",
          description: "User rejected successfully, but notification email failed to send.",
          variant: "default",
        });
      }
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't throw error - rejection succeeded even if email failed
    }
  };

  const banUser = async (user: User) => {
    await supabase
      .from('professional_profiles')
      .update({ profile_status: 'rejected' })
      .eq('user_id', user.user_id);

    // Send rejection email for banned user
    try {
      const emailResult = await sendProfessionalRejectionEmail(
        user.full_name,
        user.email,
        'Your account has been suspended due to policy violations.',
        'support@spective-talent-flow.com'
      );

      if (!emailResult.success) {
        console.error('Failed to send ban email:', emailResult.error);
        // Don't throw error - ban succeeded even if email failed
      }
    } catch (emailError) {
      console.error('Error sending ban email:', emailError);
      // Don't throw error - ban succeeded even if email failed
    }
  };

  const deleteUser = async (user: User) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const result = await fetch(`${import.meta.env.VITE_API_URL_ || ''}/api/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.user_id }),
      });
      console.log(result);
      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const resetUserPassword = async (user: User) => {
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`
    });
  };

  const openActionDialog = (user: User, action: UserAction) => {
    setSelectedUser(user);
    setActionType(action);
    setShowDialog(true);
  };

  const handleQuickStatusChange = async (user: User, newStatus: 'pending' | 'approve' | 'reject') => {
    // Prevent admin from rejecting their own account
    if (user.user_id === currentUserId && newStatus === 'reject') {
      toast({
        title: "Action Not Allowed",
        description: "You cannot reject your own account",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (newStatus) {
        case 'pending':
          // Set registration status back to pending
          await supabase
            .from('registration_requests')
            .update({
              status: 'pending',
              approved_at: null,
              approved_by: null
            })
            .eq('user_id', user.user_id);
          break;
        case 'approve':
          await approveUser(user);
          break;
        case 'reject':
          await rejectUser(user);
          break;
      }

      toast({
        title: "Success",
        description: `User status changed to ${newStatus === 'approve' ? 'approved' : newStatus}`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Error changing user status:`, error);
      toast({
        title: "Error",
        description: `Failed to change user status`,
        variant: "destructive",
      });
    }
  };

  const handleSearchableToggle = async (user: User, isSearchable: boolean) => {
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({ is_searchable: isSearchable })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Professional profile ${isSearchable ? 'enabled' : 'disabled'} for public search`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating searchable status:', error);
      toast({
        title: "Error",
        description: "Failed to update searchable status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (registration_status: string, profile_status: string, user: User) => {
    const getStatusInfo = () => {
      if (registration_status === 'approved' && profile_status === 'approved') {
        return { text: 'Active', className: 'bg-green-100 text-green-800' };
      }
      if (registration_status === 'pending') {
        return { text: 'Pending', className: 'bg-orange-100 text-orange-800' };
      }
      if (registration_status === 'rejected' || profile_status === 'rejected') {
        return { text: 'Rejected', className: 'bg-red-100 text-red-800' };
      }
      return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
    };

    const statusInfo = getStatusInfo();

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="cursor-pointer">
            <Badge className={`${statusInfo.className} hover:opacity-80 transition-opacity`}>
              {statusInfo.text}
            </Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            <p className="text-sm font-medium mb-2">Change Status</p>

            <Button
              size="sm"
              variant="ghost"
              className={`w-full justify-start hover:bg-orange-50 ${registration_status === 'pending' ? 'bg-orange-50 text-orange-800' : 'text-orange-600'
                }`}
              onClick={() => handleQuickStatusChange(user, 'pending')}
              disabled={registration_status === 'pending'}
            >
              <div className="h-4 w-4 mr-2 rounded-full bg-orange-500"></div>
              Pending
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`w-full justify-start hover:bg-green-50 ${registration_status === 'approved' && profile_status === 'approved'
                ? 'bg-green-50 text-green-800'
                : 'text-green-600'
                }`}
              onClick={() => handleQuickStatusChange(user, 'approve')}
              disabled={registration_status === 'approved' && profile_status === 'approved'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`w-full justify-start hover:bg-red-50 ${registration_status === 'rejected' || profile_status === 'rejected'
                ? 'bg-red-50 text-red-800'
                : 'text-red-600'
                } ${user.user_id === currentUserId ? 'opacity-50' : ''}`}
              onClick={() => handleQuickStatusChange(user, 'reject')}
              disabled={
                registration_status === 'rejected' ||
                profile_status === 'rejected' ||
                user.user_id === currentUserId
              }
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejected {user.user_id === currentUserId && '(Cannot reject yourself)'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage professional users and administrators. Company users are managed in the Companies tab.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={searchableFilter}
                onChange={(e) => handleSearchableFilterChange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Searchable</option>
                <option value="searchable">Searchable</option>
                <option value="not-searchable">Not Searchable</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="professional">Professional</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact info</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Searchable</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile_image || undefined} />
                            <AvatarFallback>
                              {user.full_name.split(' ')
                                .filter(np =>
                                  np.trim().length > 0
                                  && np.trim().toLowerCase() !== 'dr.'
                                  && !np.trim().includes('['))
                                .map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.email && (
                            <a
                              href={`mailto:${user.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.email}
                            </a>
                          )}
                          {user.phone && (
                            <a
                              href={`tel:${user.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.phone}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        {getStatusBadge(user.registration_status || '', user.profile_status || '', user)}
                      </TableCell>
                      <TableCell>
                        {user.profile_status === 'approved' ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.is_searchable || false}
                              onCheckedChange={(checked) => handleSearchableToggle(user, checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {user.is_searchable ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {user.profile_status === 'pending' ? 'Profile pending' : 'Not approved'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/profile/${user.user_id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Profile</p>
                            </TooltipContent>
                          </Tooltip>

                          {user.registration_status === 'pending' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openActionDialog(user, 'approve')}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve Registration</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openActionDialog(user, 'reject')}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reject Registration</p>
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openActionDialog(user, 'reset-password')}
                              >
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reset Password</p>
                            </TooltipContent>
                          </Tooltip>

                          {user.profile_status !== 'rejected' && user.user_id !== currentUserId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openActionDialog(user, 'ban')}
                                >
                                  <Ban className="h-4 w-4 text-orange-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ban User</p>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {user.user_id !== currentUserId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openActionDialog(user, 'delete')}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete User</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm {actionType === 'reset-password' ? 'Password Reset' : actionType?.charAt(0).toUpperCase() + actionType?.slice(1)}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === 'delete' &&
                  "This action cannot be undone. This will permanently delete the user account and all associated data."
                }
                {actionType === 'ban' &&
                  "This will ban the user from the platform. They will not be able to access their account."
                }
                {actionType === 'approve' &&
                  "This will approve the user's registration and allow them to access the platform."
                }
                {actionType === 'reject' &&
                  "This will reject the user's registration. They will not be able to access the platform."
                }
                {actionType === 'reset-password' &&
                  "This will send a password reset email to the user."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUserAction}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};