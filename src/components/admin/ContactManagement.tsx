import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Trash2
} from 'lucide-react';

class PartialProfessional {
  user_id: string;
  full_name: string;

  constructor(user_id: string, full_name: string) {
    this.user_id = user_id;
    this.full_name = full_name;
  }

  public get profile_url() {
    return `/profile/${this.user_id}`;
  }
}

type ContactStatus = 'new' | 'contacted' | 'closed';

interface ContactRequest {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  message: string;
  duration?: string;
  location?: string;
  subject?: string;
  professional_id?: string;
  professional?: PartialProfessional | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export const ContactManagement = () => {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      // Try to fetch contacts from the database
      const { data: contacts, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code === '42P01') {
        // Table doesn't exist, show empty state
        setContacts([]);
      } else if (error) {
        throw error;
      } else {

        const { data: professionals } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', contacts?.map(c => c.professional_id) || []);

        // Format the data properly
        const formattedContacts: ContactRequest[] = contacts?.map(contact => {
          const professionalData = professionals?.find(p => p.user_id === contact.professional_id);
          let professional: PartialProfessional | null = null;

          if (professionalData) {
            professional = new PartialProfessional(professionalData.user_id, professionalData.full_name);
          } else if (contact.professional_id) {
            professional = new PartialProfessional(contact.professional_id, 'Unknown Professional');
          }

          return {
            id: contact.id,
            company_name: contact.company_name,
            contact_person: contact.contact_person,
            email: contact.email,
            phone: contact.phone,
            message: contact.message,
            duration: contact.duration,
            subject: contact.subject,
            location: contact.location,
            professional_id: contact.professional_id,
            professional: professional,
            status: contact.status as ContactStatus,
            created_at: contact.created_at,
            updated_at: contact.updated_at,
          };
        }) || [];
        console.log(formattedContacts);
        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const updateContactStatus = async (contactId: string, newStatus: ContactStatus) => {
    try {
      // Try to update the contact status in the database
      const { error } = await supabase
        .from('contact_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId);

      if (error && error.code !== '42P01') throw error;

      // Update local state
      setContacts(prev => prev.map(contact =>
        contact.id === contactId
          ? { ...contact, status: newStatus, updated_at: new Date().toISOString() }
          : contact
      ));

      toast({
        title: "Success",
        description: `Contact status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      // Try to delete the contact from the database
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', contactId);

      if (error && error.code !== '42P01') throw error;

      // Update local state
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      // Close dialogs if the deleted contact was selected
      if (selectedContact?.id === contactId) {
        setShowContactDialog(false);
        setSelectedContact(null);
      }

      toast({
        title: "Success",
        description: "Contact request deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact request",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setContactToDelete(null);
    }
  };

  const handleDeleteClick = (contact: ContactRequest) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'contacted':
        return <Badge className="bg-orange-100 text-orange-800">Contacted</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`loading-skeleton-row-${i}`} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Contact Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, contact person, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Contacts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Professional</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {contacts.length === 0 ? 'No contact requests yet' : 'No contacts match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{contact.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contact.contact_person}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><a href={contact.professional?.profile_url || '#'} target="_blank">{contact.professional?.full_name || 'General Inquiry'}</a></TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowContactDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(contact)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {contact.status === 'new' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateContactStatus(contact.id, 'contacted')}
                            >
                              Mark Contacted
                            </Button>
                          )}
                          {contact.status === 'contacted' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateContactStatus(contact.id, 'closed')}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Request Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Company Information</h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedContact.company_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Contact:</span>
                      <span>{selectedContact.contact_person}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Contact Details</h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                          {selectedContact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>


              <div>
                <h4 className="font-semibold">Subject</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedContact.subject}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Message</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedContact.message}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Duration</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedContact.duration}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Location</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedContact.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Status: </span>
                  {getStatusBadge(selectedContact.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Received: {new Date(selectedContact.created_at).toLocaleString()}
                </div>
              </div>

              {selectedContact.professional && (
                <div>
                  <h4 className="font-semibold">Interested in Professional</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <span>{selectedContact.professional.full_name}</span>
                    {selectedContact.professional_id && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={selectedContact.professional?.profile_url || '#'} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Profile
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(selectedContact)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this contact request?</p>
            {contactToDelete && (
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{contactToDelete.company_name}</p>
                <p className="text-sm text-muted-foreground">{contactToDelete.contact_person} - {contactToDelete.email}</p>
              </div>
            )}
            <p className="text-sm text-destructive">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => contactToDelete && deleteContact(contactToDelete.id)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};