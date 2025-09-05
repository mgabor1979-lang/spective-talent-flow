# Vercel Deployment Guide for Availability Email Cron Jobs

## 🚀 Overview

This project now includes **Vercel Cron Jobs** for processing availability email reminders. The cron job runs daily at 6:00 AM UTC and automatically processes pending availability emails.

## 📋 Prerequisites

1. **Vercel Account** - [Sign up at vercel.com](https://vercel.com)
2. **Supabase Service Role Key** - From your Supabase dashboard
3. **Resend API Key** - From your Resend dashboard

## 🔧 Environment Variables Setup

### 1. Required Environment Variables

Set these in your Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://kaebjhoxcorrkrbelyvt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email Service Configuration  
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Optional: Cron Security (Recommended)
CRON_SECRET=your_random_secret_string_here
```

### 2. How to Get Environment Variables

#### Supabase Service Role Key:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the **service_role** key (NOT the anon key!)

#### Resend API Key:
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Go to API Keys
3. Create a new API key or copy existing one

## 📁 File Structure

```
api/
├── cron/
│   └── availability-emails.js    # Main cron job handler
└── test-cron.js                  # Manual test endpoint
vercel.json                       # Vercel configuration with cron schedule
```

## ⚙️ Vercel Configuration

The `vercel.json` file configures the cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/availability-emails",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Schedule**: Daily at 6:00 AM UTC (8:00 AM Central European Time)

## 🚀 Deployment Steps

### 1. Deploy to Vercel

```bash
# Option 1: Using Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Connect GitHub repository
# - Link your GitHub repo to Vercel
# - Push changes to trigger automatic deployment
```

### 2. Set Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add all required variables (see above)
4. Redeploy to apply changes

### 3. Verify Deployment

After deployment, your cron job will be available at:
```
https://your-app.vercel.app/api/cron/availability-emails
```

## 🧪 Testing

### Manual Test Endpoint

Test the cron job manually:
```bash
# Visit in browser or curl:
https://your-app.vercel.app/api/test-cron
```

### Expected Response

Success response:
```json
{
  "success": true,
  "message": "Cron job completed",
  "processed": 2,
  "successCount": 2,
  "failureCount": 0,
  "results": [
    {
      "id": "uuid-1",
      "success": true,
      "error": null
    }
  ]
}
```

No emails to process:
```json
{
  "success": true,
  "message": "No pending emails to process",
  "processed": 0
}
```

## 📊 Monitoring

### Vercel Functions Tab

Monitor cron job execution in Vercel Dashboard:
1. Go to your project
2. Functions tab
3. View logs for `/api/cron/availability-emails`

### Log Messages

- `🕖` - Cron job started
- `📬` - No pending emails
- `📧` - Processing X emails
- `✅` - Success messages
- `❌` - Error messages
- `🎉` - Job completed

## 🔒 Security

### Cron Secret (Optional)

Add extra security by setting `CRON_SECRET` environment variable. The cron job will verify the Authorization header:

```bash
# Manual trigger with secret:
curl -H "Authorization: Bearer your_cron_secret" \
     https://your-app.vercel.app/api/cron/availability-emails
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing SUPABASE_SERVICE_ROLE_KEY" Error**
   - Ensure you're using the service role key, not the anon key
   - Verify it's set in Vercel environment variables

2. **"Missing RESEND_API_KEY" Error**
   - Check Resend API key is valid
   - Verify from email is verified in Resend

3. **Database Permission Errors**
   - Service role key should bypass RLS policies
   - Check Supabase project is accessible

4. **Cron Job Not Running**
   - Verify `vercel.json` is in project root
   - Check Vercel Functions tab for errors
   - Ensure project is deployed with Pro plan (cron jobs require Pro)

### Debug Steps

1. **Test manually**: Visit `/api/test-cron` endpoint
2. **Check logs**: Vercel Dashboard → Functions → Logs
3. **Verify environment**: Ensure all env vars are set
4. **Test database**: Check Supabase connection

## 🔄 How It Works

1. **Vercel Cron** triggers `/api/cron/availability-emails` daily at 6 AM UTC
2. **Query Database** for pending emails where:
   - `status = 'pending'`
   - `resend_email_id IS NULL`
   - `available_date <= NOW()`
3. **Process Each Email**:
   - Send availability reminder via Resend
   - Update record with `resend_email_id`
   - Change status to `'scheduled'`
   - Update professional profile to `available: true`
4. **Error Handling**: Failed emails marked as `'failed'`

## 📈 Scaling Considerations

- **Vercel Pro Plan** required for cron jobs
- **10 second timeout** for serverless functions (hobby plan)
- **60 second timeout** for serverless functions (pro plan)
- **Rate Limits**: Consider Resend API limits for bulk emails

## 🔮 Next Steps

After deployment:
1. Monitor cron job logs for first few days
2. Test with actual availability date scenarios
3. Consider adding retry logic for failed emails
4. Set up alerts for cron job failures

Your availability email reminder system is now ready for Vercel! 🎉
