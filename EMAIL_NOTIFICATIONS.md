# Email Notification System

## Overview
The email notification system has been implemented to automatically send notifications to professionals and companies when their profiles are approved or rejected by administrators.

## Features

### Professional Notifications
- **Approval Email**: Sent when a professional's profile is approved
  - Welcome message with congratulations
  - List of available features
  - Login link to access dashboard
  - Professional branding with green theme

- **Rejection Email**: Sent when a professional's profile is rejected
  - Respectful notification of rejection
  - Optional reason for rejection
  - Guidance on next steps
  - Support contact information
  - Yellow/warning theme

### Company Notifications
- **Approval Email**: Sent when a company profile is approved
  - Welcome message for the company
  - List of available features for companies
  - Login link to company dashboard
  - Professional branding with green theme

- **Rejection Email**: Sent when a company profile is rejected
  - Respectful notification of rejection
  - Optional reason for rejection
  - Guidance on reapplication process
  - Support contact information
  - Yellow/warning theme

## Implementation Details

### Email Templates
Located in `src/lib/email-templates.ts`:
- `professionalApprovalEmail()` - Professional approval template
- `professionalRejectionEmail()` - Professional rejection template
- `companyApprovalEmail()` - Company approval template
- `companyRejectionEmail()` - Company rejection template

### Email Hook
Located in `src/hooks/use-email.ts`:
- `sendProfessionalApprovalEmail()` - Send professional approval notification
- `sendProfessionalRejectionEmail()` - Send professional rejection notification
- `sendCompanyApprovalEmail()` - Send company approval notification
- `sendCompanyRejectionEmail()` - Send company rejection notification

### Admin Integration
The email notifications are automatically triggered when admins:
- Approve/reject professionals in `UserManagement.tsx`
- Approve/reject companies in `CompanyManagement.tsx`
- Ban users (sends rejection email)

## Configuration

### Email Service
- Uses Resend API for email delivery
- Server-side implementation in `email-server.ts`
- Environment variables required:
  - `RESEND_API_KEY` - Resend API key
  - `RESEND_FROM_EMAIL` - From email address (must be verified domain)

### Rate Limits
- Free tier: 100 emails per day, 3000 per month
- Automatically tracked and enforced
- Usage statistics available in admin interface

## Testing

### Email Test Component
Located at `/email-test` page:
- Test all email templates
- Send sample notifications
- View usage statistics
- Debug email functionality

### Manual Testing
1. Navigate to admin dashboard
2. Approve/reject a professional or company
3. Check email delivery and formatting
4. Verify email content and links

## Error Handling

### Graceful Degradation
- If email fails to send, the approval/rejection still succeeds
- Warning notifications shown to admins
- Errors logged to console for debugging

### Common Issues
- Invalid email addresses
- Rate limit exceeded
- Resend API configuration issues
- Network connectivity problems

## Email Content Features

### HTML Templates
- Responsive design for mobile and desktop
- Professional styling with consistent branding
- Clear call-to-action buttons
- Success/warning color schemes based on notification type

### Text Fallbacks
- Plain text versions included for all emails
- Accessibility friendly
- Email client compatibility

### Personalization
- User names and company names included
- Dynamic login URLs
- Contextual messaging based on user type

## Future Enhancements

### Possible Improvements
- Email customization options for admins
- Batch email notifications
- Email analytics and tracking
- Custom rejection reasons
- Notification preferences for users
- Email queuing for high volume

### Template Variations
- Seasonal themes
- Multi-language support
- Custom branding options
- Rich media content

## Maintenance

### Monitoring
- Check usage statistics regularly
- Monitor email delivery rates
- Review error logs for failed sends

### Updates
- Keep Resend API integration updated
- Review and update email templates
- Test email rendering across clients
- Update contact information as needed
