import { Resend } from 'resend';

// Simple in-memory rate limiting (for basic protection)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10; // Max 10 emails per 15 minutes per IP

function getRealIP(request) {
  return request.headers['x-forwarded-for']?.split(',')[0] || 
         request.headers['x-real-ip'] || 
         request.connection?.remoteAddress || 
         'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  return true;
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin || request.headers.referer;
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://spective-talent-flow-git-ssr-resend-cryptonit.vercel.app',
    'https://spective.cryptonit.hu',
    'https://spective.hu',
    'https://www.spective.hu',
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
    'https://spective.hu',
    'https://www.spective.hu',

  ];
  
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if request comes from allowed origin
    if (!isAllowedOrigin(request)) {
      return response.status(403).json({ 
        error: 'Forbidden: Request from unauthorized origin' 
      });
    }

    // Rate limiting check
    const clientIP = getRealIP(request);
    if (!checkRateLimit(clientIP)) {
      return response.status(429).json({ 
        error: 'Rate limit exceeded. Maximum 10 emails per 15 minutes.' 
      });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return response.status(500).json({ 
        error: 'Resend API key not configured' 
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { emailId } = request.body;

    const result = await resend.emails.cancel(emailId);

    if (result.error) {
      return response.status(400).json({ error: result.error });
    }

    return response.status(200).json({ 
      success: true, 
      messageId: result.data?.id 
    });

  } catch (error) {
    console.error('Email API Error:', error);
    return response.status(500).json({ 
      error: 'Failed to send email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
