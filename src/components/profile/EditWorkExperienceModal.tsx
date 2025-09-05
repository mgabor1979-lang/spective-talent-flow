import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DATA_SEPARATORS } from '@/lib/data-separators';

interface WorkExperience {
  id?: string; // Optional ID for React keys
  position: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  description: string;
}

interface ExperienceItem {
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface EditWorkExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workExperiences: ExperienceItem[];
  currentSummary: string;
  userId: string;
  onUpdate: () => void;
}

export const EditWorkExperienceModal = ({ 
  isOpen, 
  onClose, 
  workExperiences, 
  currentSummary,
  userId, 
  onUpdate 
}: EditWorkExperienceModalProps) => {
  // Parse existing experiences to the new format
  const parseExistingExperiences = (experiences: ExperienceItem[]): WorkExperience[] => {
    const durationRegex = /^(.+?)\s*-\s*(.+?)$/;
    
    return experiences.map((exp, index) => {
      // Try to parse the duration format "startDate - endDate"
      const durationMatch = exp.duration ? durationRegex.exec(exp.duration) : null;
      if (durationMatch) {
        const [, start, end] = durationMatch;
        const startParts = start.trim().split(' ');
        const endParts = end.trim().split(' ');
        
        return {
          id: `parsed-${index}-${Date.now()}`, // Stable ID
          position: exp.position || '',
          company: exp.company || '',
          startMonth: startParts[0] || '',
          startYear: startParts[1] || '',
          endMonth: endParts[0] === 'Present' ? '' : endParts[0] || '',
          endYear: endParts[0] === 'Present' ? '' : endParts[1] || '',
          isCurrent: end.trim() === 'Present',
          description: exp.description || ''
        };
      }
      
      // If no duration found, return empty experience
      return {
        id: `empty-${index}-${Date.now()}`, // Stable ID
        position: exp.position || '',
        company: exp.company || '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        isCurrent: false,
        description: exp.description || ''
      };
    });
  };

  const [experiences, setExperiences] = useState<WorkExperience[]>(() => {
    const parsed = parseExistingExperiences(workExperiences);
    // If no experiences exist, start with one empty experience
    if (parsed.length === 0) {
      return [{
        id: Date.now().toString(), // Add unique ID
        position: '',
        company: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        isCurrent: false,
        description: ''
      }];
    }
    // Add unique IDs to existing experiences
    return parsed.map((exp, index) => ({
      ...exp,
      id: `existing-${index}-${Date.now()}`
    }));
  });
  
  // Reset experiences when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      const parsed = parseExistingExperiences(workExperiences);
      
      if (parsed.length === 0) {
        setExperiences([{
          id: `modal-${Date.now()}`, // Add unique ID
          position: '',
          company: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          isCurrent: false,
          description: ''
        }]);
      } else {
        // Add unique IDs to existing experiences
        setExperiences(parsed.map((exp, index) => ({
          ...exp,
          id: `modal-${index}-${Date.now()}`
        })));
      }
    }
  }, [isOpen]); // Only depend on isOpen
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addNewExperience = () => {
    setExperiences([...experiences, {
      id: `new-${Date.now()}-${Math.random()}`, // Unique ID for new experience
      position: '',
      company: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isCurrent: false,
      description: ''
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updated = experiences.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperiences(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Get current authenticated user to ensure we're only updating their data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Ensure we're only updating the current user's profile
      const targetUserId = user.id;
      
      // Convert experiences back to the database format
      const experienceTexts = experiences
        .filter(exp => {
          // Must have position, company, start month and year
          const hasBasicInfo = exp.position && exp.company && exp.startMonth && exp.startYear;
          // If it's a current job, we don't need end date
          // If it's not current, we need end month and year
          const hasEndInfo = exp.isCurrent || (exp.endMonth && exp.endYear);
          return hasBasicInfo && hasEndInfo;
        })
        .map(exp => {
          const startDate = `${exp.startMonth} ${exp.startYear}`;
          const endDate = exp.isCurrent ? 'Present' : `${exp.endMonth} ${exp.endYear}`;
          const duration = `${startDate} - ${endDate}`;
          // Ensure description is never empty - use a space if empty
          const description = exp.description.trim() || ' ';
          return `${exp.position} at ${exp.company} (${duration}): ${description}`;
        });
      
      // Combine summary with experiences using unique separator
      const workExperienceText = [currentSummary, ...experienceTexts].join(DATA_SEPARATORS.WORK_EXPERIENCE);

      const { error } = await supabase
        .from('professional_profiles')
        .update({ work_experience: workExperienceText })
        .eq('user_id', targetUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work experience updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating work experience:', error);
      toast({
        title: "Error",
        description: "Failed to update work experience",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Experience</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {experiences.map((exp, index) => (
            <Card key={exp.id || `fallback-${index}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  Experience #{index + 1}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExperience(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      placeholder="e.g., Senior Developer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="e.g., Tech Corp"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={exp.startMonth}
                        onValueChange={(value) => updateExperience(index, 'startMonth', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={exp.startYear}
                        onValueChange={(value) => updateExperience(index, 'startYear', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={exp.isCurrent}
                        onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor={`current-${index}`} className="text-sm">
                        I currently work here
                      </label>
                    </div>
                    {!exp.isCurrent && (
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={exp.endMonth}
                          onValueChange={(value) => updateExperience(index, 'endMonth', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={exp.endYear}
                          onValueChange={(value) => updateExperience(index, 'endYear', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="Describe your role, responsibilities, and achievements..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outline"
            onClick={addNewExperience}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Experience
          </Button>
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