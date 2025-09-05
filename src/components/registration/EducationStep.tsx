import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface Education {
  id: string;
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
}

interface EducationFormData {
  educations: Array<{
    school?: string;
    degree?: string;
    startYear?: string;
    endYear?: string;
    isCurrent?: boolean;
  }>;
}

export interface EducationStepProps {
  data: EducationFormData;
  onNext: (data: EducationFormData) => void;
  onPrevious: () => void;
  defaultValues?: Partial<EducationFormData>;
}

export const EducationStep = ({ data, onNext, onPrevious, defaultValues }: EducationStepProps) => {
  // Sort educations by start year (descending - most recent first) - only used when submitting
  const sortEducationsByStartYear = (eduList: Education[]) => {
    return [...eduList].sort((a, b) => {
      const yearA = parseInt(a.startYear) || 0;
      const yearB = parseInt(b.startYear) || 0;
      return yearB - yearA; // Descending order (most recent first)
    });
  };

  const [educations, setEducations] = useState<Education[]>(
    data.educations?.map((edu, index) => ({ 
      id: `edu-${index}`, 
      school: edu.school || '',
      degree: edu.degree || '',
      startYear: edu.startYear || '',
      endYear: edu.endYear || '',
      isCurrent: edu.isCurrent || false
    })) || [{
      id: 'edu-0',
      school: '',
      degree: '',
      startYear: '',
      endYear: '',
      isCurrent: false
    }]
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const addEducation = () => {
    const newId = `edu-${Date.now()}`;
    setEducations([...educations, {
      id: newId,
      school: '',
      degree: '',
      startYear: '',
      endYear: '',
      isCurrent: false
    }]);
  };

  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Omit<Education, 'id'>, value: string | boolean) => {
    const updated = educations.map((edu, i) => {
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
    setEducations(updated);
    
    // Clear any previous errors when user starts typing
    if (showValidation) {
      setErrors([]);
    }
  };

  const validateAndSubmit = () => {
    setShowValidation(true);
    const newErrors: string[] = [];
    
    // Check if we have at least one education with all required fields
    const hasValidEducation = educations.some(edu => 
      edu.school.trim() && edu.degree.trim() && edu.startYear
    );
    
    if (!hasValidEducation) {
      newErrors.push('Please fill in at least one complete education entry (School, Degree, and Start Year are required)');
    }

    // Validate end year vs start year for each education
    educations.forEach((edu, index) => {
      if (edu.endYear && edu.startYear && !edu.isCurrent) {
        const startYear = parseInt(edu.startYear);
        const endYear = parseInt(edu.endYear);
        if (endYear <= startYear) {
          newErrors.push(`Education #${index + 1}: End year must be greater than start year`);
        }
      }
    });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      // Filter and prepare valid educations for submission, then sort by start year
      const validEducations = educations
        .filter(edu => edu.school.trim() && edu.degree.trim() && edu.startYear)
        .map(({ id, ...edu }) => ({
          school: edu.school.trim(),
          degree: edu.degree.trim(),
          startYear: edu.startYear,
          endYear: edu.isCurrent ? undefined : edu.endYear,
          isCurrent: edu.isCurrent
        }))
        .sort((a, b) => {
          const yearA = parseInt(a.startYear) || 0;
          const yearB = parseInt(b.startYear) || 0;
          return yearB - yearA; // Descending order (most recent first)
        });
      
      onNext({ educations: validEducations });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i + 10);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Education</h2>
        <p className="text-muted-foreground">Add your educational background</p>
      </div>

      <form className="space-y-6">
        <div className="space-y-6">
          {educations.map((edu, index) => (
            <Card key={edu.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  Education #{index + 1}
                  <Button
                    type="button"
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
                    <>
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
                      {edu.endYear && edu.startYear && parseInt(edu.endYear) <= parseInt(edu.startYear) && (
                        <p className="text-sm text-destructive">End year must be greater than start year</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Education
        </Button>

        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error) => (
              <p key={error} className="text-destructive text-sm">{error}</p>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={validateAndSubmit}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};