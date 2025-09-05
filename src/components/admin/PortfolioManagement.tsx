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
  Briefcase
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioFormData {
  title: string;
  description: string;
  is_active: boolean;
}

// Sortable Portfolio Item Component
interface SortablePortfolioItemProps {
  item: PortfolioItem;
  onToggleActive: (item: PortfolioItem) => void;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
}

function SortablePortfolioItem({
  item,
  onToggleActive,
  onEdit,
  onDelete,
}: SortablePortfolioItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold line-clamp-1">{item.title}</h3>
              <Badge variant={item.is_active ? "default" : "secondary"} className="flex-shrink-0">
                {item.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
        <Switch
          checked={item.is_active}
          onCheckedChange={() => onToggleActive(item)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const PortfolioManagement = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
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
    fetchItems();
  }, []);

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update local state immediately for better UX
        setItems(newItems);

        try {
          // Update sort_order in database for all affected items
          const updates = newItems.map((item, index) => ({
            id: item.id,
            sort_order: index + 1
          }));

          // Update each item's sort_order in the database
          for (const update of updates) {
            await supabase
              .from('portfolio_items' as any)
              .update({ sort_order: update.sort_order })
              .eq('id', update.id);
          }

          toast({
            title: "Success",
            description: "Portfolio items reordered successfully",
          });
        } catch (error) {
          console.error('Error reordering portfolio items:', error);
          // Revert to original order on error
          fetchItems(); // Refetch from database to restore original order
          toast({
            title: "Error",
            description: "Failed to reorder portfolio items",
            variant: "destructive",
          });
        }
      }
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error && error.code !== '42P01') {
        throw error;
      }

      setItems((data as unknown as PortfolioItem[]) || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const maxSortOrder = Math.max(...items.map(i => i.sort_order), 0);
      
      const { data, error } = await supabase
        .from('portfolio_items' as any)
        .insert([{
          ...formData,
          sort_order: maxSortOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;

      setItems([...items, data as unknown as PortfolioItem]);
      setIsDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "Portfolio item created successfully",
      });
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to create portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_items' as any)
        .update(formData)
        .eq('id', editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setItems(items.map(i => i.id === editingItem.id ? data as unknown as PortfolioItem : i));
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('portfolio_items' as any)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      setItems(items.filter(i => i.id !== itemToDelete.id));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (item: PortfolioItem) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items' as any)
        .update({ is_active: !item.is_active })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      setItems(items.map(i => i.id === item.id ? data as unknown as PortfolioItem : i));
      
      toast({
        title: "Success",
        description: `Portfolio item ${(data as unknown as PortfolioItem).is_active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      is_active: true
    });
  };

  const openEditDialog = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      is_active: item.is_active
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (item: PortfolioItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Items</CardTitle>
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
              <CardTitle>Portfolio Items</CardTitle>
              <p className="mt-3 text-sm text-muted-foreground">
                Manage the portfolio items displayed on your homepage
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Portfolio Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Update the portfolio item details' : 'Create a new portfolio item for your homepage'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item-title">Title</Label>
                    <Input
                      id="item-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Portfolio item title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="item-description">Description</Label>
                    <Textarea
                      id="item-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Portfolio item description"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="item-active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="item-active">Active</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingItem ? handleUpdateItem : handleCreateItem}
                    disabled={!formData.title}
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No portfolio items found</p>
              <p className="text-sm text-muted-foreground">Add your first portfolio item to get started</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {items.map((item) => (
                    <SortablePortfolioItem
                      key={item.id}
                      item={item}
                      onToggleActive={handleToggleActive}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
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
            <DialogTitle>Delete Portfolio Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this portfolio item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
