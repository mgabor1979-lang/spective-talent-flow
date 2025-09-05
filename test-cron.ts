import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { EmailTemplates } from './src/lib/email-templates.js';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const SUPABASE_URL = "https://kaebjhoxcorrkrbelyvt.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZWJqaG94Y29ycmtyYmVseXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MzQyNTEsImV4cCI6MjA3MDAxMDI1MX0.D35-hMwjux7ZuVAOTMCRKDW_hCvg4gY5tezUlyZo4IE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Initialize Resend
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is not set in environment variables');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to schedule availability reminder
async function scheduleAvailabilityReminder(userName: string, userEmail: string, availableFrom: string, profileUrl: string) {
  try {
    const emailOptions = EmailTemplates.availabilityReminderEmail({
      userName, 
      userEmail, 
      availableDate: availableFrom, 
      profileUrl
    });

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: userEmail,
      subject: emailOptions.subject,
      html: emailOptions.html || '',
      text: emailOptions.text || '',
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
async function processEmailRecord(emailRecord: any) {
  try {
    const emailData = emailRecord.email_data;
    
    if (!emailData || !emailData.user_name || !emailData.email || !emailData.availableFrom) {
      console.warn(`⚠️ Skipping email record ${emailRecord.id} - missing required data`);
      return;
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
      await updateEmailRecordSuccess(emailRecord.id, result.messageId, emailRecord.user_id);
    } else {
      console.error(`❌ Failed to send email for record ${emailRecord.id}:`, result.error);
      await markEmailRecordFailed(emailRecord.id);
    }
  } catch (error) {
    console.error(`❌ Error processing email record ${emailRecord.id}:`, error);
    await markEmailRecordFailed(emailRecord.id);
  }
}

// Update email record after successful sending
async function updateEmailRecordSuccess(recordId: string, messageId: string, userId: string) {
  const { error: updateError } = await supabase
    .from('scheduled_availability_emails')
    .update({
      resend_email_id: messageId,
      status: 'scheduled',
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId);

  if (updateError) {
    console.error(`❌ Error updating email record ${recordId}:`, updateError);
  } else {
    console.log(`✅ Successfully processed and updated email record ${recordId}`);
    await updateProfessionalProfile(userId);
  }
}

// Update professional profile availability
async function updateProfessionalProfile(userId: string) {
  const { error: profileUpdateError } = await supabase
    .from('professional_profiles')
    .update({
      available: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (profileUpdateError) {
    console.error(`❌ Error updating professional profile for user ${userId}:`, profileUpdateError);
  } else {
    console.log(`✅ Updated professional profile availability for user ${userId}`);
  }
}

// Mark email record as failed
async function markEmailRecordFailed(recordId: string) {
  await supabase
    .from('scheduled_availability_emails')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId);
}

// Manual test function to run the cron job logic immediately
async function runAvailabilityEmailsJob() {
  console.log('🧪 Running availability emails job manually at', new Date().toISOString());
  
  try {
    // Get all pending scheduled availability emails that don't have a resend_id
    const { data: pendingEmails, error } = await supabase
      .from('scheduled_availability_emails')
      .select('*')
      .eq('status', 'pending')
      .is('resend_email_id', null)
      .lte('available_date', new Date().toISOString()); // Only process emails where the available date has arrived

    if (error) {
      console.error('❌ Error fetching pending emails:', error);
      return;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('📬 No pending availability emails to process');
      
      // Let's also check all records for debugging
      const { data: allEmails, error: allError } = await supabase
        .from('scheduled_availability_emails')
        .select('*')
        .limit(10);
      
      if (allError) {
        console.error('❌ Error fetching all emails:', allError);
      } else {
        console.log(`📊 Total records in scheduled_availability_emails: ${allEmails?.length || 0}`);
        if (allEmails && allEmails.length > 0) {
          console.log('🔍 Sample records:');
          allEmails.forEach((email, index) => {
            console.log(`  ${index + 1}. ID: ${email.id}, Status: ${email.status}, Available Date: ${email.available_date}, Has Resend ID: ${!!email.resend_email_id}`);
          });
        }
      }
      return;
    }

    console.log(`📧 Processing ${pendingEmails.length} pending availability emails`);

    // Process each email record
    for (const emailRecord of pendingEmails) {
      await processEmailRecord(emailRecord);
    }

    console.log('🎉 Finished processing pending availability emails');
  } catch (error) {
    console.error('❌ Critical error in availability emails cron job:', error);
  }
}

// Run the job immediately
console.log('⚠️ Warning: Using anon key for testing. Use service role key in production!');
runAvailabilityEmailsJob().then(() => {
  console.log('✅ Manual test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Manual test failed:', error);
  process.exit(1);
});
