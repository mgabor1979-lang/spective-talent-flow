// Manual test endpoint for the availability emails cron job
// Access via: https://your-app.vercel.app/api/test-cron

import handler from './cron/availability-emails.js';

export default async function testCronHandler(request, response) {
  console.log('🧪 Manual test of availability emails cron job triggered');
  
  // Add a test header to bypass cron secret check
  const testRequest = {
    ...request,
    headers: {
      ...request.headers,
      authorization: `Bearer ${process.env.CRON_SECRET || 'test'}`
    }
  };

  // Call the actual cron handler
  return await handler(testRequest, response);
}
