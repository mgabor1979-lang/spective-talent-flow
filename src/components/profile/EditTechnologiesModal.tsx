import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditTechnologiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  technologies: string[];
  userId: string;
  onUpdate: () => void;
}

export const EditTechnologiesModal = ({ isOpen, onClose, technologies, userId, onUpdate }: EditTechnologiesModalProps) => {
  const [technologiesList, setTechnologiesList] = useState<string[]>(technologies);
  const [newTechnology, setNewTechnology] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addTechnology = () => {
    if (newTechnology.trim()) {
      setTechnologiesList([...technologiesList, newTechnology.trim()]);
      setNewTechnology('');
    }
  };

  const removeTechnology = (index: number) => {
    setTechnologiesList(technologiesList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({ technologies: technologiesList })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Technologies updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating technologies:', error);
      toast({
        title: "Error",
        description: "Failed to update technologies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Technologies & Tools</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Technologies</Label>
            <div className="flex flex-wrap gap-2">
              {technologiesList.map((tech, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTechnology(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newTechnology">Add New Technology</Label>
              <Input
                id="newTechnology"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter technology or tool name"
              />
            </div>
            <div className="flex items-end">
              <Button size="icon" onClick={addTechnology}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};