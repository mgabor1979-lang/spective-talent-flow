import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Available languages - same as wizard
const AVAILABLE_LANGUAGES = [
  "English", "German", "French", "Spanish", "Italian", "Hungarian", 
  "Portuguese", "Dutch", "Polish", "Czech", "Romanian", "Bulgarian",
  "Croatian", "Slovak", "Slovenian", "Estonian", "Latvian", "Lithuanian"
];

interface EditLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: string[];
  userId: string;
  onUpdate: () => void;
}

const languageLevels = ['beginner', 'intermediate', 'advanced', 'native'];

export const EditLanguagesModal = ({ isOpen, onClose, languages, userId, onUpdate }: EditLanguagesModalProps) => {
  const [languagesList, setLanguagesList] = useState<string[]>(languages);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [newLanguageLevel, setNewLanguageLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Parse existing languages to get just the language names for filtering
  const existingLanguageNames = languagesList.map(lang => {
    const regexPattern = /^([^(]+)/;
    const match = regexPattern.exec(lang);
    return match ? match[1].trim() : lang;
  });

  const addLanguage = () => {
    if (selectedLanguage.trim()) {
      const languageWithLevel = `${selectedLanguage.trim()} (${newLanguageLevel})`;
      setLanguagesList([...languagesList, languageWithLevel]);
      setSelectedLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
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
      
      const { error } = await supabase
        .from('professional_profiles')
        .update({ languages: languagesList })
        .eq('user_id', targetUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Languages updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating languages:', error);
      toast({
        title: "Error",
        description: "Failed to update languages",
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
          <DialogTitle>Edit Languages</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languagesList.map((language, index) => (
                <Badge key={`${language}-${index}`} variant="secondary" className="flex items-center gap-1">
                  {language}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeLanguage(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Add New Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto" position="popper" sideOffset={4}>
                  {AVAILABLE_LANGUAGES.filter(lang => !existingLanguageNames.includes(lang)).map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={newLanguageLevel} onValueChange={setNewLanguageLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button size="icon" onClick={addLanguage} disabled={!selectedLanguage}>
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