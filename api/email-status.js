function isAllowedOrigin(request) {
  const origin = request.headers.origin || request.headers.referer;
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://spective-talent-flow-git-ssr-resend-cryptonit.vercel.app',
    'https://spective.cryptonit.hu',
    'https://spective.hu'
  ];
  
  if (!origin) return false; // No origin header
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

export default async function handler(request, response) {
  // Set CORS headers for specific origins only
  const origin = request.headers.origin;
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://spective-talent-flow-git-ssr-resend-cryptonit.vercel.app',
    'https://spective.cryptonit.hu',
    'https://spective.hu'
  ];
  
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if request comes from allowed origin
    if (!isAllowedOrigin(request)) {
      return response.status(403).json({ 
        error: 'Forbidden: Request from unauthorized origin' 
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    // Add some debugging info (without exposing sensitive data)
    const result = {
      configured: !!resendApiKey,
      fromEmailConfigured: !!fromEmail && fromEmail !== 'noreply@yourdomain.com',
      status: 'operational',
      debug: {
        hasApiKey: !!resendApiKey,
        apiKeyLength: resendApiKey ? resendApiKey.length : 0,
        fromEmailSet: !!fromEmail,
        fromEmail: fromEmail === 'noreply@yourdomain.com' ? 'default' : 'custom'
      }
    };
    
    return response.status(200).json(result);
  } catch (statusError) {
    console.error('Email status check failed:', statusError);
    return response.status(500).json({
      error: 'Service check failed',
      message: statusError instanceof Error ? statusError.message : 'Unknown error'
    });
  }
}
