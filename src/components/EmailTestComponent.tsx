import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEmail } from '@/hooks/use-email';
import { useToast } from '@/hooks/use-toast';

export const EmailTestComponent: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const { 
    sendEmail, 
    sendWelcomeEmail, 
    sendPasswordResetEmail, 
    sendVerificationEmail,
    sendProfessionalApprovalEmail,
    sendProfessionalRejectionEmail,
    sendCompanyApprovalEmail,
    sendCompanyRejectionEmail,
    getUsageStats,
    isLoading, 
    error 
  } = useEmail();
  
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!recipient || !subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const result = await sendEmail({
      to: recipient,
      subject: subject,
      html: `<p>${message}</p>`,
      text: message,
    });

    if (result.success) {
      toast({
        title: "Email Sent",
        description: `Email sent successfully! Message ID: ${result.messageId}`,
      });
      // Clear form
      setRecipient('');
      setSubject('');
      setMessage('');
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendWelcomeEmail(
      'Test User', 
      recipient, 
      'https://yourapp.com/login'
    );

    if (result.success) {
      toast({
        title: "Welcome Email Sent",
        description: `Welcome email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send welcome email",
        variant: "destructive",
      });
    }
  };

  const handleSendPasswordResetEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendPasswordResetEmail(
      'Test User', 
      recipient, 
      'https://yourapp.com/reset-password?token=test123'
    );

    if (result.success) {
      toast({
        title: "Password Reset Email Sent",
        description: `Password reset email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendVerificationEmail(
      'Test User', 
      recipient, 
      'https://yourapp.com/verify-email?token=test123'
    );

    if (result.success) {
      toast({
        title: "Verification Email Sent",
        description: `Verification email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  const handleSendProfessionalApprovalEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendProfessionalApprovalEmail(
      'John Doe', 
      recipient, 
      'https://yourapp.com/'
    );

    if (result.success) {
      toast({
        title: "Professional Approval Email Sent",
        description: `Professional approval email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send professional approval email",
        variant: "destructive",
      });
    }
  };

  const handleSendProfessionalRejectionEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendProfessionalRejectionEmail(
      'John Doe', 
      recipient, 
      'Profile information incomplete',
      'support@spective-talent-flow.com'
    );

    if (result.success) {
      toast({
        title: "Professional Rejection Email Sent",
        description: `Professional rejection email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send professional rejection email",
        variant: "destructive",
      });
    }
  };

  const handleSendCompanyApprovalEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendCompanyApprovalEmail(
      'Acme Corp', 
      'Jane Smith',
      recipient, 
      'https://yourapp.com/company-dashboard'
    );

    if (result.success) {
      toast({
        title: "Company Approval Email Sent",
        description: `Company approval email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send company approval email",
        variant: "destructive",
      });
    }
  };

  const handleSendCompanyRejectionEmail = async () => {
    if (!recipient) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    const result = await sendCompanyRejectionEmail(
      'Acme Corp', 
      'Jane Smith',
      recipient, 
      'Company information needs verification',
      'support@spective-talent-flow.com'
    );

    if (result.success) {
      toast({
        title: "Company Rejection Email Sent",
        description: `Company rejection email sent to ${recipient}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send company rejection email",
        variant: "destructive",
      });
    }
  };

  const usageStats = getUsageStats();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Service Test</CardTitle>
          <CardDescription>
            Test the email functionality using Resend service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="Enter recipient email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded">
              Error: {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSendTestEmail} 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Custom Email'}
            </Button>

            <Button 
              onClick={handleSendWelcomeEmail} 
              disabled={isLoading}
              variant="outline"
            >
              Send Welcome Email
            </Button>

            <Button 
              onClick={handleSendPasswordResetEmail} 
              disabled={isLoading}
              variant="outline"
            >
              Send Password Reset
            </Button>

            <Button 
              onClick={handleSendVerificationEmail} 
              disabled={isLoading}
              variant="outline"
            >
              Send Verification Email
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Approval/Rejection Email Tests</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleSendProfessionalApprovalEmail} 
                disabled={isLoading}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Send Professional Approval
              </Button>

              <Button 
                onClick={handleSendProfessionalRejectionEmail} 
                disabled={isLoading}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Send Professional Rejection
              </Button>

              <Button 
                onClick={handleSendCompanyApprovalEmail} 
                disabled={isLoading}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Send Company Approval
              </Button>

              <Button 
                onClick={handleSendCompanyRejectionEmail} 
                disabled={isLoading}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Send Company Rejection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Track your email usage against Resend free tier limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{usageStats.daily}</div>
              <div className="text-sm text-gray-600">
                Daily ({usageStats.dailyLimit} limit)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(usageStats.daily / usageStats.dailyLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{usageStats.monthly}</div>
              <div className="text-sm text-gray-600">
                Monthly ({usageStats.monthlyLimit} limit)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(usageStats.monthly / usageStats.monthlyLimit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
