import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Rate limiting per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 30; // Max 30 deletions per 15 minutes per IP

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
  
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

export default async function handler(request, response) {
  // Set CORS headers
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
    // Check origin
    if (!isAllowedOrigin(request)) {
      return response.status(403).json({ 
        error: 'Forbidden: Request from unauthorized origin' 
      });
    }

    // Rate limiting check
    const clientIP = getRealIP(request);
    if (!checkRateLimit(clientIP)) {
      return response.status(429).json({ 
        error: 'Rate limit exceeded. Maximum 30 deletions per 15 minutes.' 
      });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return response.status(500).json({ 
        error: 'Cloudinary not configured' 
      });
    }

    const { publicId } = request.body;

    if (!publicId) {
      return response.status(400).json({ error: 'Public ID is required' });
    }

    // Validate public ID format (basic security check)
    if (typeof publicId !== 'string' || publicId.length === 0 || publicId.length > 500) {
      return response.status(400).json({ error: 'Invalid public ID format' });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true, // Invalidate CDN cache
    });

    // Check if deletion was successful
    if (result.result === 'ok') {
      return response.status(200).json({
        success: true,
        result: result.result,
        message: 'Image deleted successfully'
      });
    } else if (result.result === 'not found') {
      return response.status(404).json({
        success: false,
        error: 'Image not found',
        result: result.result
      });
    } else {
      return response.status(400).json({
        success: false,
        error: 'Failed to delete image',
        result: result.result
      });
    }

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return response.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
}
