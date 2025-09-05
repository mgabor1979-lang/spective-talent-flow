# Email Service Documentation

## Overview

This email service is built on top of Resend and provides a comprehensive solution for sending emails in your React application. It includes rate limiting, template management, and React hooks for easy integration.

## Features

- ✅ **Rate Limiting**: Automatic tracking of daily (100) and monthly (3000) limits for Resend free tier
- ✅ **Pre-built Templates**: Welcome, password reset, email verification, and notification templates
- ✅ **React Hooks**: Easy integration with React components
- ✅ **Bulk Email Support**: Send multiple emails with rate limiting
- ✅ **TypeScript Support**: Fully typed for better development experience
- ✅ **Error Handling**: Comprehensive error handling and reporting

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
VITE_RESEND_API_KEY="your_resend_api_key_here"
VITE_RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Note**: In Vite, environment variables exposed to the client must be prefixed with `VITE_`.

### 2. Domain Verification

In your Resend dashboard, verify your domain to use custom email addresses. Until verified, you can only send to your own email address.

## Usage

### Basic Email Sending

```typescript
import { useEmail } from '@/hooks/use-email';

function MyComponent() {
  const { sendEmail, isLoading, error } = useEmail();

  const handleSendEmail = async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Hello!',
      html: '<p>This is a test email</p>',
      text: 'This is a test email'
    });

    if (result.success) {
      console.log('Email sent!', result.messageId);
    } else {
      console.error('Failed to send:', result.error);
    }
  };

  return (
    <button onClick={handleSendEmail} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Send Email'}
    </button>
  );
}
```

### Pre-built Templates

#### Welcome Email
```typescript
const { sendWelcomeEmail } = useEmail();

await sendWelcomeEmail(
  'John Doe',                    // userName
  'john@example.com',           // userEmail
  'https://app.com/dashboard'   // loginUrl (optional)
);
```

#### Password Reset Email
```typescript
const { sendPasswordResetEmail } = useEmail();

await sendPasswordResetEmail(
  'John Doe',                   // userName
  'john@example.com',          // userEmail
  'https://app.com/reset?token=abc123', // resetUrl
  '1 hour'                     // expiresIn (optional)
);
```

#### Email Verification
```typescript
const { sendVerificationEmail } = useEmail();

await sendVerificationEmail(
  'John Doe',                   // userName
  'john@example.com',          // userEmail
  'https://app.com/verify?token=abc123', // verificationUrl
  '24 hours'                   // expiresIn (optional)
);
```

#### Custom Notification
```typescript
const { sendNotificationEmail } = useEmail();

await sendNotificationEmail(
  'John Doe',                   // userName
  'john@example.com',          // userEmail
  'New Message Received',      // title
  'You have a new message from Sarah.', // message
  'https://app.com/messages',  // actionUrl (optional)
  'View Message'               // actionText (optional)
);
```

### Bulk Email Sending

```typescript
const { sendBulkEmails } = useEmail();

const emails = [
  {
    to: 'user1@example.com',
    subject: 'Bulk Email 1',
    text: 'Hello User 1'
  },
  {
    to: 'user2@example.com',
    subject: 'Bulk Email 2',
    text: 'Hello User 2'
  }
];

const result = await sendBulkEmails(emails);
console.log(`Sent: ${result.results.length}, Failed: ${result.errors.length}`);
```

### Usage Statistics

```typescript
const { getUsageStats } = useEmail();

const stats = getUsageStats();
console.log(`Daily: ${stats.daily}/${stats.dailyLimit}`);
console.log(`Monthly: ${stats.monthly}/${stats.monthlyLimit}`);
```

## Direct Service Usage (without hooks)

```typescript
import { emailService } from '@/lib/email-service';
import { EmailTemplates } from '@/lib/email-templates';

// Direct service usage
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Direct Email',
  html: '<p>Hello from service</p>'
});

// Using templates directly
const welcomeEmailOptions = EmailTemplates.welcomeEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  loginUrl: 'https://app.com/login'
});

await emailService.sendEmail(welcomeEmailOptions);
```

## Advanced Email Options

```typescript
await sendEmail({
  to: ['user1@example.com', 'user2@example.com'], // Multiple recipients
  subject: 'Advanced Email',
  html: '<h1>HTML Content</h1>',
  text: 'Plain text version',
  from: 'custom@yourdomain.com',           // Custom sender
  replyTo: 'support@yourdomain.com',       // Reply-to address
  cc: ['cc@example.com'],                  // CC recipients
  bcc: ['bcc@example.com']                 // BCC recipients
});
```

## Creating Custom Templates

```typescript
import { EmailTemplates, TemplateVariables } from '@/lib/email-templates';

// Create a custom template function
export function customTemplate(variables: {
  userName: string;
  userEmail: string;
  customData: string;
}): EmailOptions {
  const htmlContent = `
    <h1>Hello {{ userName }}!</h1>
    <p>Your custom data: {{ customData }}</p>
  `;

  return {
    to: variables.userEmail,
    subject: 'Custom Template',
    html: EmailTemplates.replaceVariables(htmlContent, variables),
  };
}
```

## Error Handling

The email service provides comprehensive error handling:

```typescript
const { sendEmail, error } = useEmail();

const result = await sendEmail(emailOptions);

if (!result.success) {
  // Handle specific errors
  if (result.error?.includes('Rate limit')) {
    console.log('Rate limit exceeded, try again later');
  } else if (result.error?.includes('Invalid email')) {
    console.log('Invalid recipient email address');
  } else {
    console.log('General error:', result.error);
  }
}

// Or use the error state from the hook
if (error) {
  console.log('Hook error:', error);
}
```

## Rate Limiting

The service automatically tracks usage and prevents sending when limits are exceeded:

- **Daily Limit**: 100 emails
- **Monthly Limit**: 3000 emails

Rate limiting is handled automatically, but you can check limits:

```typescript
const stats = getUsageStats();

if (stats.daily >= stats.dailyLimit) {
  console.log('Daily limit reached');
}

if (stats.monthly >= stats.monthlyLimit) {
  console.log('Monthly limit reached');
}
```

## Best Practices

1. **Domain Verification**: Always verify your domain in Resend for production use
2. **Template Testing**: Test all email templates before deployment
3. **Error Handling**: Always handle email sending errors gracefully
4. **Rate Limiting**: Monitor usage to avoid hitting limits
5. **Unsubscribe Links**: Add unsubscribe functionality for marketing emails
6. **Security**: Never expose API keys in client-side code

## Testing

Use the `EmailTestComponent` to test email functionality during development:

```typescript
import { EmailTestComponent } from '@/components/EmailTestComponent';

function DevPage() {
  return <EmailTestComponent />;
}
```

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your `RESEND_API_KEY` in `.env`
2. **"Invalid recipient"**: Verify domain or use verified email addresses
3. **"Rate limit exceeded"**: Wait for reset or upgrade Resend plan
4. **"Domain not verified"**: Verify your domain in Resend dashboard

### Debug Mode

Enable logging in development:

```typescript
// Add to your email service calls
console.log('Email service stats:', getUsageStats());
```

## Migration Guide

If migrating from another email service:

1. Install Resend: `npm install resend`
2. Update environment variables
3. Replace existing email calls with the new service
4. Test all email functionality
5. Update email templates to use new format

## Support

For issues with:
- **Resend API**: Check [Resend documentation](https://resend.com/docs)
- **This service**: Review error messages and check configuration
- **Rate limits**: Consider upgrading Resend plan or optimizing email frequency
