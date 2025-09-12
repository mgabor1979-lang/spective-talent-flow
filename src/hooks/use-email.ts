import { useState, useCallback } from 'react';
import { emailService, EmailOptions } from '@/lib/email-service';
import { EmailTemplates } from '@/lib/email-templates';

interface UseEmailReturn {
  sendEmail: (options: EmailOptions) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendWelcomeEmail: (userName: string, userEmail: string, loginUrl?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendPasswordResetEmail: (userName: string, userEmail: string, resetUrl: string, expiresIn?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendVerificationEmail: (userName: string, userEmail: string, verificationUrl: string, expiresIn?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendNotificationEmail: (userName: string, userEmail: string, title: string, message: string, actionUrl?: string, actionText?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendProfessionalApprovalEmail: (userName: string, userEmail: string, loginUrl?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendProfessionalRejectionEmail: (userName: string, userEmail: string, reason?: string, supportEmail?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendCompanyApprovalEmail: (companyName: string, contactPerson: string, userEmail: string, loginUrl?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendCompanyRejectionEmail: (companyName: string, contactPerson: string, userEmail: string, reason?: string, supportEmail?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendBulkEmails: (emails: EmailOptions[]) => Promise<{ success: boolean; results: any[]; errors: any[] }>;
  scheduleAvailabilityReminder: (userName: string, userEmail: string, availableFrom: string, profileUrl: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  cancelScheduledEmail: (emailId: string) => Promise<{ success: boolean; error?: string }>;
  sendAdminNotificationAboutNewProfileToReviewEmail: (adminEmail: string, professionalName: string, profileUrl?: string, profileType?: 'professional' | 'company') => Promise<{ success: boolean; messageId?: string; error?: string }>;
  getUsageStats: () => { daily: number; monthly: number; dailyLimit: number; monthlyLimit: number };
  isLoading: boolean;
  error: string | null;
}

export const useEmail = (): UseEmailReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = useCallback(async (options: EmailOptions) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await emailService.sendEmail(options);
      if (!result.success) {
        setError(result.error || 'Failed to send email');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelEmail = useCallback(async (emailId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await emailService.cancelEmail(emailId);
      if (!result.success) {
        setError(result.error || 'Failed to cancel email');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendWelcomeEmail = useCallback(async (
    userName: string, 
    userEmail: string, 
    loginUrl?: string
  ) => {
    const emailOptions = EmailTemplates.welcomeEmail({ userName, userEmail, loginUrl });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendPasswordResetEmail = useCallback(async (
    userName: string, 
    userEmail: string, 
    resetUrl: string, 
    expiresIn?: string
  ) => {
    const emailOptions = EmailTemplates.passwordResetEmail({ userName, userEmail, resetUrl, expiresIn });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendVerificationEmail = useCallback(async (
    userName: string, 
    userEmail: string, 
    verificationUrl: string, 
    expiresIn?: string
  ) => {
    const emailOptions = EmailTemplates.emailVerificationEmail({ userName, userEmail, verificationUrl, expiresIn });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendNotificationEmail = useCallback(async (
    userName: string, 
    userEmail: string, 
    title: string, 
    message: string, 
    actionUrl?: string, 
    actionText?: string
  ) => {
    const emailOptions = EmailTemplates.notificationEmail({ 
      userName, 
      userEmail, 
      title, 
      message, 
      actionUrl, 
      actionText 
    });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendProfessionalApprovalEmail = useCallback(async (
    userName: string,
    userEmail: string,
    loginUrl?: string
  ) => {
    const emailOptions = EmailTemplates.professionalApprovalEmail({ userName, userEmail, loginUrl });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendProfessionalRejectionEmail = useCallback(async (
    userName: string,
    userEmail: string,
    reason?: string,
    supportEmail?: string
  ) => {
    const emailOptions = EmailTemplates.professionalRejectionEmail({ userName, userEmail, reason, supportEmail });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendAdminNotificationAboutNewProfileToReviewEmail = useCallback(async (
    adminEmail: string,
    professionalName: string,
    profileUrl?: string,
    profileType: 'professional' | 'company' = 'professional'
  ) => {
    const emailOptions = EmailTemplates.newProfileToReviewEmail({ adminEmail, name: professionalName, profileUrl, profileType });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendCompanyApprovalEmail = useCallback(async (
    companyName: string,
    contactPerson: string,
    userEmail: string,
    loginUrl?: string
  ) => {
    const emailOptions = EmailTemplates.companyApprovalEmail({ companyName, contactPerson, userEmail, loginUrl });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendCompanyRejectionEmail = useCallback(async (
    companyName: string,
    contactPerson: string,
    userEmail: string,
    reason?: string,
    supportEmail?: string
  ) => {
    const emailOptions = EmailTemplates.companyRejectionEmail({ companyName, contactPerson, userEmail, reason, supportEmail });
    return sendEmail(emailOptions);
  }, [sendEmail]);

  const sendBulkEmails = useCallback(async (emails: EmailOptions[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await emailService.sendBulkEmails(emails);
      if (!result.success && result.errors.length > 0) {
        setError(`Failed to send ${result.errors.length} out of ${emails.length} emails`);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, results: [], errors: [{ error: errorMessage }] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleAvailabilityReminder = useCallback(async (userName: string, userEmail: string, availableFrom: string, profileUrl: string) => {
    const emailOptions = EmailTemplates.availabilityReminderEmail({userName, userEmail, availableDate:availableFrom, profileUrl});
    emailOptions.scheduledAt = availableFrom ? new Date(availableFrom).toISOString() : undefined;
    return sendEmail(emailOptions);
  }, []);

  const cancelScheduledEmail = useCallback(async (emailId: string) => {
    return cancelEmail(emailId);
  }, []);

  const getUsageStats = useCallback(() => {
    return emailService.getUsageStats();
  }, []);

  return {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendNotificationEmail,
    sendProfessionalApprovalEmail,
    sendProfessionalRejectionEmail,
    sendAdminNotificationAboutNewProfileToReviewEmail,
    sendCompanyApprovalEmail,
    sendCompanyRejectionEmail,
    sendBulkEmails,
    scheduleAvailabilityReminder,
    cancelScheduledEmail,
    getUsageStats,
    isLoading,
    error,
  };
};
