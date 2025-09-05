import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: string[];
  userId: string;
  onUpdate: () => void;
}

const skillLevels = ['junior', 'medior', 'senior', 'expert'];

export const EditSkillsModal = ({ isOpen, onClose, skills, userId, onUpdate }: EditSkillsModalProps) => {
  const [skillsList, setSkillsList] = useState<string[]>(skills);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('medior');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addSkill = () => {
    if (newSkill.trim()) {
      const skillWithLevel = `${newSkill.trim()} (${newSkillLevel})`;
      setSkillsList([...skillsList, skillWithLevel]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({ skills: skillsList })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Skills updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating skills:', error);
      toast({
        title: "Error",
        description: "Failed to update skills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Skills & Expertise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Skills</Label>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newSkill">Add New Skill</Label>
              <Input
                id="newSkill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
              />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button size="icon" onClick={addSkill}>
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