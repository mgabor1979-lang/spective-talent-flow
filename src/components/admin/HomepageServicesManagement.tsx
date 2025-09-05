import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  ChevronDown,
  Target,
  Award,
  Users,
  Briefcase,
  Globe,
  Lightbulb,
  TrendingUp,
  Settings,
  Zap,
  Shield,
  Heart,
  Star,
  CheckCircle,
  Clock,
  Database,
  Code,
  Laptop,
  Smartphone,
  Camera,
  Music,
  FileText,
  Image,
  Video,
  Mic,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Lock,
  Unlock
} from 'lucide-react';

// Available icons for services
const availableIcons = [
  { name: 'Target', icon: Target },
  { name: 'Award', icon: Award },
  { name: 'Users', icon: Users },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Globe', icon: Globe },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Settings', icon: Settings },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Clock', icon: Clock },
  { name: 'Database', icon: Database },
  { name: 'Code', icon: Code },
  { name: 'Laptop', icon: Laptop },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Camera', icon: Camera },
  { name: 'Music', icon: Music },
  { name: 'FileText', icon: FileText },
  { name: 'Image', icon: Image },
  { name: 'Video', icon: Video },
  { name: 'Mic', icon: Mic },
  { name: 'MapPin', icon: MapPin },
  { name: 'Calendar', icon: Calendar },
  { name: 'Mail', icon: Mail },
  { name: 'Phone', icon: Phone },
  { name: 'Search', icon: Search },
  { name: 'Filter', icon: Filter },
  { name: 'Download', icon: Download },
  { name: 'Upload', icon: Upload },
  { name: 'Share', icon: Share },
  { name: 'Lock', icon: Lock },
  { name: 'Unlock', icon: Unlock }
];

interface HomepageService {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceFormData {
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
}

// Sortable Service Item Component
interface SortableServiceItemProps {
  service: HomepageService;
  onToggleActive: (service: HomepageService) => void;
  onEdit: (service: HomepageService) => void;
  onDelete: (service: HomepageService) => void;
  getIconComponent: (iconName: string) => JSX.Element;
}

function SortableServiceItem({
  service,
  onToggleActive,
  onEdit,
  onDelete,
  getIconComponent,
}: SortableServiceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border rounded-lg ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
        
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="text-primary flex-shrink-0">
            {getIconComponent(service.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold truncate">{service.title}</h3>
              <Badge variant={service.is_active ? "default" : "secondary"} className="flex-shrink-0">
                {service.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
        <Switch
          checked={service.is_active}
          onCheckedChange={() => onToggleActive(service)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(service)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const HomepageServicesManagement = () => {
  const [services, setServices] = useState<HomepageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<HomepageService | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<HomepageService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    icon: 'Target',
    title: '',
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = services.findIndex((service) => service.id === active.id);
      const newIndex = services.findIndex((service) => service.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newServices = arrayMove(services, oldIndex, newIndex);
        
        // Update local state immediately for better UX
        setServices(newServices);

        try {
          // Update sort_order in database for all affected services
          const updates = newServices.map((service, index) => ({
            id: service.id,
            sort_order: index + 1
          }));

          // Update each service's sort_order in the database
          for (const update of updates) {
            await supabase
              .from('homepage_services')
              .update({ sort_order: update.sort_order })
              .eq('id', update.id);
          }

          toast({
            title: "Success",
            description: "Services reordered successfully",
          });
        } catch (error) {
          console.error('Error reordering services:', error);
          // Revert to original order on error
          fetchServices(); // Refetch from database to restore original order
          toast({
            title: "Error",
            description: "Failed to reorder services",
            variant: "destructive",
          });
        }
      }
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error && error.code !== '42P01') {
        throw error;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      const maxSortOrder = Math.max(...services.map(s => s.sort_order), 0);
      
      const { data, error } = await supabase
        .from('homepage_services')
        .insert([{
          ...formData,
          sort_order: maxSortOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;

      setServices([...services, data]);
      setIsDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    }
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      const { data, error } = await supabase
        .from('homepage_services')
        .update(formData)
        .eq('id', editingService.id)
        .select()
        .single();

      if (error) throw error;

      setServices(services.map(s => s.id === editingService.id ? data : s));
      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
      
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      const { error } = await supabase
        .from('homepage_services')
        .delete()
        .eq('id', serviceToDelete.id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== serviceToDelete.id));
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
      
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (service: HomepageService) => {
    try {
      const { data, error } = await supabase
        .from('homepage_services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id)
        .select()
        .single();

      if (error) throw error;

      setServices(services.map(s => s.id === service.id ? data : s));
      
      toast({
        title: "Success",
        description: `Service ${data.is_active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      icon: 'Target',
      title: '',
      description: '',
      is_active: true
    });
  };

  const openEditDialog = (service: HomepageService) => {
    setEditingService(service);
    setFormData({
      icon: service.icon,
      title: service.title,
      description: service.description,
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingService(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (service: HomepageService) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    const IconComponent = iconData ? iconData.icon : Target;
    return <IconComponent className="h-8 w-8" />;
  };

  const getIconComponentClass = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Target;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Homepage Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services</CardTitle>
              <p className="mt-3 text-sm text-muted-foreground">
                Manage the services displayed on your homepage
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingService ? 'Update the service details' : 'Create a new service for your homepage'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="service-icon">Icon</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const IconComponentClass = getIconComponentClass(formData.icon);
                              return <IconComponentClass className="h-4 w-4" />;
                            })()}
                            <span>{formData.icon}</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                        {availableIcons.map((iconData) => {
                          const IconComponent = iconData.icon;
                          return (
                            <DropdownMenuItem
                              key={iconData.name}
                              onClick={() => setFormData(prev => ({ ...prev, icon: iconData.name }))}
                            >
                              <IconComponent className="h-4 w-4 mr-2" />
                              {iconData.name}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div>
                    <Label htmlFor="service-title">Title</Label>
                    <Input
                      id="service-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Service title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="service-description">Description</Label>
                    <Textarea
                      id="service-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Service description"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="service-active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="service-active">Active</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingService(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingService ? handleUpdateService : handleCreateService}
                    disabled={!formData.title || !formData.description}
                  >
                    {editingService ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No services found</p>
              <p className="text-sm text-muted-foreground">Add your first service to get started</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={services.map(service => service.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {services.map((service) => (
                    <SortableServiceItem
                      key={service.id}
                      service={service}
                      onToggleActive={handleToggleActive}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                      getIconComponent={getIconComponent}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{serviceToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setServiceToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
