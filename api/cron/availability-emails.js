import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL || "https://kaebjhoxcorrkrbelyvt.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email template function (simplified version of EmailTemplates.availabilityReminderEmail)
function createAvailabilityReminderEmail(userName, userEmail, availableDate, profileUrl) {
  const formattedDate = new Date(availableDate).toLocaleDateString();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Availability Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
        .highlight-box { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .highlight-box h3 { color: #2e7d32; margin-top: 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
        .button { display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🗓️ Availability Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            This is your scheduled reminder that you set yourself as available from <strong>${formattedDate}</strong>.
          </p>
          
          <div class="highlight-box">
            <h3>🎯 Action Required</h3>
            <p>
              Your profile will be automatically updated to show that you're available for new projects. 
              Companies will be able to contact you for opportunities!
            </p>
          </div>
          
          ${profileUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${profileUrl}" class="button">
              View Your Profile
            </a>
          </div>
          ` : ''}
          
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            If you're not ready to be available yet, you can update your availability status in your profile settings.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Spective. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Availability Reminder - You're Available Today!
    
    Hello ${userName}!
    
    This is your scheduled reminder that you set yourself as available from ${formattedDate}.
    
    Action Required:
    Your profile will be automatically updated to show that you're available for new projects. 
    Companies will be able to contact you for opportunities!

    ${profileUrl ? `View your profile: ${profileUrl}` : ''}
    
    If you're not ready to be available yet, you can update your availability status in your profile settings.
    
    Best regards,
    The Spective Kft.
    
    © 2025 Spective Kft. All rights reserved.
  `;

  return {
    to: userEmail,
    subject: '🗓️ Availability Reminder - You\'re Available Today!',
    html: htmlContent,
    text: textContent,
  };
}

// Function to send availability reminder
async function scheduleAvailabilityReminder(userName, userEmail, availableFrom, profileUrl) {
  try {
    const emailOptions = createAvailabilityReminderEmail(userName, userEmail, availableFrom, profileUrl);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: userEmail,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    });

    if (result.error) {
      console.error('❌ Failed to send availability reminder:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ Availability reminder sent successfully:', result.data?.id);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Error sending availability reminder:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Process a single email record
async function processEmailRecord(emailRecord) {
  try {
    const emailData = emailRecord.email_data;
    
    if (!emailData || !emailData.user_name || !emailData.email || !emailData.availableFrom) {
      console.warn(`⚠️ Skipping email record ${emailRecord.id} - missing required data`);
      return { success: false, error: 'Missing required data' };
    }

    console.log(`📧 Processing email for ${emailData.user_name} (${emailData.email})`);

    // Send the availability reminder
    const result = await scheduleAvailabilityReminder(
      emailData.user_name,
      emailData.email,
      emailData.availableFrom,
      emailData.profile_url || ''
    );

    if (result.success && result.messageId) {
      // Update the database record with resend_id and change status to scheduled
      const { error: updateError } = await supabase
        .from('scheduled_availability_emails')
        .update({
          resend_email_id: result.messageId,
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', emailRecord.id);

      if (updateError) {
        console.error(`❌ Error updating email record ${emailRecord.id}:`, updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`✅ Successfully processed and updated email record ${emailRecord.id}`);
      
      // Update professional profile to mark them as available
      const { error: profileUpdateError } = await supabase
        .from('professional_profiles')
        .update({
          available: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', emailRecord.user_id);

      if (profileUpdateError) {
        console.error(`❌ Error updating professional profile for user ${emailRecord.user_id}:`, profileUpdateError);
      } else {
        console.log(`✅ Updated professional profile availability for user ${emailRecord.user_id}`);
      }

      return { success: true, messageId: result.messageId };
    } else {
      console.error(`❌ Failed to send email for record ${emailRecord.id}:`, result.error);
      
      // Mark as failed
      await supabase
        .from('scheduled_availability_emails')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', emailRecord.id);

      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Error processing email record ${emailRecord.id}:`, error);
    
    // Mark as failed
    await supabase
      .from('scheduled_availability_emails')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', emailRecord.id);

    return { success: false, error: error.message };
  }
}

// Main Vercel serverless function
export default async function handler(request, response) {
  // Verify the request is from Vercel Cron or has proper authentication
  const authHeader = request.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🕖 Running scheduled availability emails cron job at', new Date().toISOString());
  
  try {
    // Check for required environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
      return response.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set');
      return response.status(500).json({ error: 'Missing RESEND_API_KEY' });
    }

    // Get all pending scheduled availability emails that don't have a resend_id
    const { data: pendingEmails, error } = await supabase
      .from('scheduled_availability_emails')
      .select('*')
      .eq('status', 'pending')
      .is('resend_email_id', null)
      .lte('available_date', new Date().toISOString()); // Only process emails where the available date has arrived

    if (error) {
      console.error('❌ Error fetching pending emails:', error);
      return response.status(500).json({ error: 'Database error', details: error.message });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('📬 No pending availability emails to process');
      return response.status(200).json({ 
        success: true, 
        message: 'No pending emails to process',
        processed: 0 
      });
    }

    console.log(`📧 Processing ${pendingEmails.length} pending availability emails`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process each email record
    for (const emailRecord of pendingEmails) {
      const result = await processEmailRecord(emailRecord);
      results.push({
        id: emailRecord.id,
        success: result.success,
        error: result.error || null
      });

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log(`🎉 Finished processing availability emails. Success: ${successCount}, Failed: ${failureCount}`);

    return response.status(200).json({
      success: true,
      message: 'Cron job completed',
      processed: pendingEmails.length,
      successCount,
      failureCount,
      results: results
    });

  } catch (error) {
    console.error('❌ Critical error in availability emails cron job:', error);
    return response.status(500).json({
      error: 'Critical error in cron job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
