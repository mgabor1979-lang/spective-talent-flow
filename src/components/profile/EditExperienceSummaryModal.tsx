import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DATA_SEPARATORS } from '@/lib/data-separators';

interface EditExperienceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSummary: string;
  userId: string;
  onUpdate: () => void;
}

export const EditExperienceSummaryModal = ({ isOpen, onClose, currentSummary, userId, onUpdate }: EditExperienceSummaryModalProps) => {
  const [summary, setSummary] = useState(currentSummary);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get the current work experience to preserve it
      const { data: currentProfile } = await supabase
        .from('professional_profiles')
        .select('work_experience')
        .eq('user_id', userId)
        .single();

      // Parse current work experience to extract detailed experiences
      const currentWorkExp = currentProfile?.work_experience || '';
      const sections = currentWorkExp.split(DATA_SEPARATORS.WORK_EXPERIENCE);
      const detailedExperiences = sections.slice(1); // Skip the first section (summary)
      
      // Combine new summary with existing detailed experiences
      const updatedWorkExperience = [summary, ...detailedExperiences].join(DATA_SEPARATORS.WORK_EXPERIENCE);

      const { error } = await supabase
        .from('professional_profiles')
        .update({ work_experience: updatedWorkExperience })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Experience summary updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating experience summary:', error);
      toast({
        title: "Error",
        description: "Failed to update experience summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Professional Experience Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Experience Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe your overall professional experience, key achievements, and expertise..."
              className="min-h-[120px]"
            />
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