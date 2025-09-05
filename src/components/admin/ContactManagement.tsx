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
  ExternalLink
} from 'lucide-react';

interface ContactRequest {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  message: string;
  professional_id?: string;
  professional_name?: string;
  status: 'new' | 'contacted' | 'closed';
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
        // Format the data properly
        const formattedContacts = contacts?.map(contact => ({
          id: contact.id,
          company_name: contact.company_name,
          contact_person: contact.contact_person,
          email: contact.email,
          phone: contact.phone,
          message: contact.message,
          professional_id: contact.professional_id,
          professional_name: 'Unknown', // We'll fetch this separately if needed
          status: contact.status as 'new' | 'contacted' | 'closed',
          created_at: contact.created_at,
          updated_at: contact.updated_at,
        })) || [];
        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // For now, let's use mock data
      const mockContacts: ContactRequest[] = [
        {
          id: '1',
          company_name: 'Tech Solutions Inc.',
          contact_person: 'John Smith',
          email: 'john.smith@techsolutions.com',
          phone: '+1-555-123-4567',
          message: 'We are looking for a senior developer for our digital transformation project.',
          professional_id: 'prof-1',
          professional_name: 'Jane Developer',
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setContacts(mockContacts);
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

  const updateContactStatus = async (contactId: string, newStatus: 'new' | 'contacted' | 'closed') => {
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
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
                      <TableCell>{contact.professional_name || 'General Inquiry'}</TableCell>
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
                <h4 className="font-semibold">Message</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedContact.message}</p>
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

              {selectedContact.professional_name && (
                <div>
                  <h4 className="font-semibold">Interested in Professional</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <span>{selectedContact.professional_name}</span>
                    {selectedContact.professional_id && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/profile/${selectedContact.professional_id}`} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Profile
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};