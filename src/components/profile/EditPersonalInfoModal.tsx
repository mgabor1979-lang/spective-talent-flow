import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CitySelector } from '@/components/ui/city-selector';

interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    full_name: string;
    phone?: string;
    birth_date?: string;
    user_id: string;
    professional_profile?: {
      daily_wage_net?: number;
      city?: string;
    };
  };
  onUpdate: () => void;
}

export const EditPersonalInfoModal = ({ isOpen, onClose, profileData, onUpdate }: EditPersonalInfoModalProps) => {
  const [fullName, setFullName] = useState(profileData.full_name);
  const [phone, setPhone] = useState(profileData.phone || '');
  const [birthDate, setBirthDate] = useState(profileData.birth_date || '');
  const [dailyWage, setDailyWage] = useState(profileData.professional_profile?.daily_wage_net?.toString() || '');
  const [city, setCity] = useState(profileData.professional_profile?.city || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    console.log('Saving profile data:', { fullName, phone, birthDate, dailyWage, city });
    
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          birth_date: birthDate || null,
        })
        .eq('user_id', profileData.user_id);

      if (profileError) throw profileError;

      // Update professional profile with daily wage and city
      if (dailyWage || city) {
        console.log('Updating professional profile with:', { dailyWage, city });
        
        const { error: professionalError } = await supabase
          .from('professional_profiles')
          .update({
            daily_wage_net: parseFloat(dailyWage) || null,
            city: city || null,
          })
          .eq('user_id', profileData.user_id);

        if (professionalError) {
          console.error('Professional profile update error:', professionalError);
          throw professionalError;
        }
        
        console.log('Professional profile updated successfully');
      }

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyWage">Daily Wage (€)</Label>
            <Input
              id="dailyWage"
              type="number"
              value={dailyWage}
              onChange={(e) => setDailyWage(e.target.value)}
              placeholder="Enter daily wage in euros"
            />
          </div>
          <div className="space-y-2">
            <CitySelector
              value={city}
              onChange={setCity}
              placeholder="Select your city in Hungary"
              label="City"
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