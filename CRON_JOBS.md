# Cron Jobs Documentation

## Overview

This document describes the automated background jobs (cron jobs) that run in the Spective  application.

## Availability Email Reminder Cron Job

### Purpose
Automatically processes pending availability reminder emails for professionals who have set future availability dates.

### Schedule
- **Frequency**: Daily at 6:00 AM (Europe/Budapest timezone)
- **Cron Expression**: `0 6 * * *`

### What it does

1. **Queries the database** for records in the `scheduled_availability_emails` table where:
   - `status` = 'pending'
   - `resend_email_id` is null
   - `available_date` <= current date (the availability date has arrived)

2. **For each matching record**:
   - Extracts email data (user name, email, profile URL)
   - Sends an availability reminder email using the `scheduleAvailabilityReminder` function
   - Updates the database record with the Resend email ID
   - Changes the status from 'pending' to 'scheduled'
   - Updates the professional's profile to mark them as available

3. **Error handling**:
   - If email sending fails, marks the record as 'failed'
   - Logs all activities for monitoring
   - Continues processing other records even if one fails

### Required Environment Variables

```bash
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Database Schema

The cron job works with the `scheduled_availability_emails` table:

```sql
scheduled_availability_emails (
  id: string (primary key)
  user_id: string
  professional_id: string
  available_date: timestamp
  email_data: jsonb {
    email: string
    user_name: string
    profile_url: string
    availableFrom: string
  }
  scheduled_date: timestamp
  status: string ('pending' | 'scheduled' | 'failed')
  resend_email_id: string (nullable)
  created_at: timestamp
  updated_at: timestamp
)
```

## Running the Cron Jobs

### Development
```bash
# Run cron jobs only
npm run dev:cron

# Run everything (frontend, API, and cron jobs)
npm run dev:full
```

### Production
```bash
# Start cron jobs in production
npm run start:cron
```

### Docker/Process Manager
In production environments, you may want to run the cron jobs as a separate process using PM2 or similar:

```bash
# Using PM2
pm2 start cron-jobs.ts --name "availability-cron"

# Or using nohup
nohup npm run start:cron &
```

## Monitoring

The cron job provides detailed logging:

- `🕖` - Cron job start time
- `📬` - No pending emails to process
- `📧` - Number of emails being processed
- `✅` - Successful operations
- `❌` - Errors and failures
- `⚠️` - Warnings (e.g., missing data)
- `🎉` - Job completion

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all required environment variables are set
   - Check that the Supabase service role key has the necessary permissions

2. **Email Sending Failures**
   - Verify Resend API key is valid and has sufficient quota
   - Check that the from email address is verified in Resend

3. **Database Connection Issues**
   - Verify Supabase URL and service key
   - Check network connectivity to Supabase

4. **Timezone Issues**
   - The cron job runs in Europe/Budapest timezone
   - Adjust the timezone in the cron schedule if needed

### Logs Location
All logs are output to stdout/stderr and should be captured by your process manager or container runtime.

## Future Enhancements

Potential improvements for the cron job system:

1. **Email Templates**: Support for different email template variants
2. **Retry Logic**: Exponential backoff for failed email deliveries
3. **Batch Processing**: Process emails in batches to handle large volumes
4. **Health Checks**: HTTP endpoint for monitoring cron job health
5. **Configuration**: Runtime configuration for schedules and settings
