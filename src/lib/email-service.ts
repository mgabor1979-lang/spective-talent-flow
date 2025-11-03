// Email service that calls server-side API instead of directly calling Resend
// This avoids CORS issues by using server-side email sending

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  scheduledAt?: Date | string | null;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class EmailService {
  private static instance: EmailService;
  private dailyEmailCount = 0;
  private monthlyEmailCount = 0;
  private lastResetDate = new Date();

  // Singleton pattern to ensure single instance
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send a single email via server-side API
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check rate limits
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Free tier allows 100 emails per day and 3000 per month.'
        };
      }

      // Prepare CC field
      let ccArray: string[] | undefined;
      if (options.cc) {
        ccArray = Array.isArray(options.cc) ? options.cc : [options.cc];
      }

      // Prepare BCC field
      let bccArray: string[] | undefined;
      if (options.bcc) {
        bccArray = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      }

      const emailData = {
        from: undefined,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        cc: ccArray,
        bcc: bccArray,
        scheduledAt: options.scheduledAt ? new Date(options.scheduledAt).toISOString() : undefined
      };

      // Call server-side API endpoint - use relative path in production
      const apiUrl = import.meta.env.VITE_API_URL_ || '';
      const endpoint = apiUrl ? `${apiUrl}/api/send-email` : '/api/send-email';
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('Email API Error:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to send email'
        };
      }

      // Increment counters on successful send
      this.incrementCounters();

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async cancelEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL_ || '';
      const endpoint = apiUrl ? `${apiUrl}/api/cancel-email` : '/api/cancel-email';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId: emailId }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('Email API Error:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to cancel email'
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Email cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send bulk emails (with rate limit consideration)
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results: any[] = [];
    const errors: any[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result.success) {
        results.push(result);
      } else {
        errors.push({ email: email.to, error: result.error });
      }

      // Add small delay between emails to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = new Date();
    
    // Reset daily counter if it's a new day
    if (now.getDate() !== this.lastResetDate.getDate()) {
      this.dailyEmailCount = 0;
    }

    // Reset monthly counter if it's a new month
    if (now.getMonth() !== this.lastResetDate.getMonth() || 
        now.getFullYear() !== this.lastResetDate.getFullYear()) {
      this.monthlyEmailCount = 0;
    }

    this.lastResetDate = now;

    // Check limits (Free tier: 100/day, 3000/month)
    return this.dailyEmailCount < 100 && this.monthlyEmailCount < 3000;
  }

  /**
   * Increment email counters
   */
  private incrementCounters(): void {
    this.dailyEmailCount++;
    this.monthlyEmailCount++;
  }

  /**
   * Get current usage stats
   */
  getUsageStats(): { daily: number; monthly: number; dailyLimit: number; monthlyLimit: number } {
    return {
      daily: this.dailyEmailCount,
      monthly: this.monthlyEmailCount,
      dailyLimit: 100,
      monthlyLimit: 3000
    };
  }

  /**
   * Test email service connection via server API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test API endpoint connectivity - use relative path in production
      const apiUrl = import.meta.env.VITE_API_URL_ || '';
      const endpoint = apiUrl ? `${apiUrl}/api/email-status` : '/api/email-status';
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Email API endpoint not accessible'
        };
      }

      return { success: result.configured };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
