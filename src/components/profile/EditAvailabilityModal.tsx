import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmail } from '@/hooks/use-email';

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAvailable?: boolean;
  currentAvailableFrom?: string | null;
  onUpdate: () => void;
}

export const EditAvailabilityModal = ({
  isOpen,
  onClose,
  userId,
  currentAvailable = true,
  currentAvailableFrom = null,
  onUpdate
}: EditAvailabilityModalProps) => {
  const [available, setAvailable] = useState(currentAvailable);
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(
    currentAvailableFrom ? new Date(currentAvailableFrom) : undefined
  );
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { scheduleAvailabilityReminder, cancelScheduledEmail } = useEmail();

  // Update state when props change
  useEffect(() => {
    setAvailable(currentAvailable);
    setAvailableFrom(currentAvailableFrom ? new Date(currentAvailableFrom) : undefined);
  }, [currentAvailable, currentAvailableFrom]);

  // Function to cancel existing scheduled emails and schedule new ones if needed
  const handleScheduling = async (newAvailable: boolean, newAvailableFrom: Date | undefined) => {
    try {
      // Always cancel existing reminders first

      // If setting unavailable with a future date, schedule a reminder
    } catch (error) {
      console.error('Error handling scheduling:', error);
    }
  };

  const handleSave = async () => {
    if (!available && !availableFrom) {
      toast({
        title: "Missing Information",
        description: "Please set an available date when marking yourself as unavailable",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Handle email scheduling first
      await handleScheduling(available, availableFrom);

      // Update professional profile
      let availableFromValue = null;
      if (!available && availableFrom) {
        // Format date to YYYY-MM-DD without timezone conversion
        const year = availableFrom.getFullYear();
        const month = String(availableFrom.getMonth() + 1).padStart(2, '0');
        const day = String(availableFrom.getDate()).padStart(2, '0');
        availableFromValue = `${year}-${month}-${day}`;
      }

      const { error } = await supabase
        .from('professional_profiles')
        .update({
          available: !!available,
          availablefrom: availableFromValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Schedule email if needed
      if (!available && availableFrom) {

        const { data: userData } = (await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', userId)
          .single());

        const userEmail = userData?.email;
        const userName = userData?.full_name;
        const profileUrl = `${window.location.origin}/profile/${userId}`;

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

        let scheduleStatus = 'pending';
        let resendId = null;
        if (availableFrom < thirtyDaysFromNow) {
          const scheduledEmail = await scheduleAvailabilityReminder(userName, userEmail, availableFrom.toISOString(), profileUrl);

          if (scheduledEmail.error) {
            throw new Error(scheduledEmail.error);
          }

          scheduleStatus = 'scheduled';
          resendId = scheduledEmail.messageId;
        }

        const { data: alreadyScheduledEmails } = await supabase
          .from('scheduled_availability_emails')
          .select('*')
          .eq('user_id', userId)
          .eq('professional_id', userId);

        if (alreadyScheduledEmails.length > 0) {
          cancelScheduledEmail(alreadyScheduledEmails[0].resend_email_id);

          await supabase.from('scheduled_availability_emails')
            .delete()
            .eq('user_id', userId)
            .eq('professional_id', userId);
        }

        await supabase.from('scheduled_availability_emails').insert({
          user_id: userId,
          professional_id: userId,
          available_date: availableFrom.toISOString(),
          email_data: {
            email: userEmail,
            profile_url: profileUrl,
            availableFrom: availableFrom.toISOString(),
            user_name: userName
          },
          scheduled_date: availableFrom.toISOString(),
          status: scheduleStatus,
          resend_email_id: resendId
        });
      }

      let successMessage = "Availability status updated successfully";
      if (available) {
        successMessage = "You are now marked as available for new projects";
      } else if (availableFrom) {
        successMessage = `Availability set for ${availableFrom.toLocaleDateString()}. You'll receive a reminder email.`;
      }

      toast({
        title: "Success",
        description: successMessage,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
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
          <DialogTitle>Edit Availability Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="available">Available for Work</Label>
              <p className="text-sm text-muted-foreground">
                Are you currently available for new projects?
              </p>
            </div>
            <Switch
              id="available"
              checked={available}
              onCheckedChange={setAvailable}
            />
          </div>

          {!available && (
            <div className="space-y-2">
              <Label htmlFor="availableFrom">Available From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !availableFrom && "text-muted-foreground"
                    )}
                  >
                    {availableFrom ? (
                      format(availableFrom, "PPP")
                    ) : (
                      <span>Pick your available date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="flex gap-2">
                      <Select
                        value={calendarDate.getMonth().toString()}
                        onValueChange={(month) => {
                          const newDate = new Date(calendarDate);
                          newDate.setMonth(parseInt(month));
                          setCalendarDate(newDate);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: 0, label: "January" },
                            { value: 1, label: "February" },
                            { value: 2, label: "March" },
                            { value: 3, label: "April" },
                            { value: 4, label: "May" },
                            { value: 5, label: "June" },
                            { value: 6, label: "July" },
                            { value: 7, label: "August" },
                            { value: 8, label: "September" },
                            { value: 9, label: "October" },
                            { value: 10, label: "November" },
                            { value: 11, label: "December" },
                          ].map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={calendarDate.getFullYear().toString()}
                        onValueChange={(year) => {
                          const newDate = new Date(calendarDate);
                          newDate.setFullYear(parseInt(year));
                          setCalendarDate(newDate);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={availableFrom}
                    onSelect={setAvailableFrom}
                    month={calendarDate}
                    onMonthChange={setCalendarDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Companies will be notified when this date arrives
              </p>
            </div>
          )}

          {available && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ You are currently marked as available for new projects. Companies can contact you immediately.
              </p>
            </div>
          )}

          {!available && availableFrom && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                📅 You will be marked as available on {availableFrom.toLocaleDateString()}.
                Companies who contact you now will be notified when you become available.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
