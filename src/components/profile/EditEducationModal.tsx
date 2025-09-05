import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DATA_SEPARATORS } from '@/lib/data-separators';

interface Education {
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
}

interface EditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  educations: Education[];
  userId: string;
  onUpdate: () => void;
}

export const EditEducationModal = ({ 
  isOpen, 
  onClose, 
  educations, 
  userId, 
  onUpdate 
}: EditEducationModalProps) => {
  // Sort educations by start year (descending - most recent first) - only used when saving
  const sortEducationsByStartYear = (eduList: Education[]) => {
    return [...eduList].sort((a, b) => {
      const yearA = parseInt(a.startYear) || 0;
      const yearB = parseInt(b.startYear) || 0;
      return yearB - yearA; // Descending order (most recent first)
    });
  };

  const [educationList, setEducationList] = useState<Education[]>(educations);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update education list when educations prop changes
  useEffect(() => {
    setEducationList(educations);
  }, [educations]);

  const addNewEducation = () => {
    setEducationList([...educationList, {
      school: '',
      degree: '',
      startYear: '',
      endYear: '',
      isCurrent: false
    }]);
  };

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | boolean) => {
    const updated = educationList.map((edu, i) => {
      if (i === index) {
        const updatedEdu = { ...edu, [field]: value };
        
        // If start year was updated, clear end year if it's now invalid
        if (field === 'startYear' && updatedEdu.endYear) {
          const startYear = parseInt(value as string);
          const endYear = parseInt(updatedEdu.endYear);
          if (endYear < startYear) {
            updatedEdu.endYear = '';
          }
        }
        
        return updatedEdu;
      }
      return edu;
    });
    
    // Don't sort during editing - only update the list
    setEducationList(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate that no education has invalid date ranges
      const hasInvalidDates = educationList.some(edu => 
        edu.startYear && edu.endYear && !edu.isCurrent && 
        parseInt(edu.endYear) < parseInt(edu.startYear)
      );

      if (hasInvalidDates) {
        toast({
          title: "Validation Error",
          description: "Please fix the invalid date ranges before saving",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Sort educations by start year before saving
      const sortedEducations = sortEducationsByStartYear(educationList);
      
      // Convert education list to database format
      const educationTexts = sortedEducations
        .filter(edu => edu.school && edu.degree && edu.startYear) // Only include complete education entries
        .map(edu => {
          const endYear = edu.isCurrent ? 'Present' : edu.endYear;
          const duration = `${edu.startYear} - ${endYear}`;
          return `${edu.degree} at ${edu.school} (${duration})`;
        });
      
      // Convert education to string for storage using unique separator
      const educationText = educationTexts.join(DATA_SEPARATORS.EDUCATION);

      const { error } = await supabase
        .from('professional_profiles')
        .update({ education: educationText })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Education updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating education:', error);
      toast({
        title: "Error",
        description: "Failed to update education",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i + 10);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Education</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {educationList.map((edu, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  Education #{index + 1}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEducation(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>School/University</Label>
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      placeholder="e.g., University of Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor of Computer Science"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Select
                      value={edu.startYear}
                      onValueChange={(value) => updateEducation(index, 'startYear', value)}
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
                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={edu.isCurrent}
                        onChange={(e) => updateEducation(index, 'isCurrent', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor={`current-${index}`} className="text-sm">
                        Currently studying
                      </label>
                    </div>
                    {!edu.isCurrent && (
                      <Select
                        value={edu.endYear}
                        onValueChange={(value) => updateEducation(index, 'endYear', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years
                            .filter(year => !edu.startYear || year >= parseInt(edu.startYear))
                            .map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {/* Validation error for invalid date range */}
                    {edu.startYear && edu.endYear && !edu.isCurrent && 
                     parseInt(edu.endYear) < parseInt(edu.startYear) && (
                      <p className="text-sm text-red-500 mt-1">
                        End year must be greater than or equal to start year
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outline"
            onClick={addNewEducation}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Education
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