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
const MAX_REQUESTS = 20; // Max 20 uploads per 15 minutes per IP

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

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formidable
  },
};

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
        error: 'Rate limit exceeded. Maximum 20 uploads per 15 minutes.' 
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

    // Parse multipart form data using formidable
    const formidable = (await import('formidable')).default;
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(request);
    
    // Get the uploaded file
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return response.status(400).json({ error: 'No file uploaded' });
    }

    const file = fileArray[0];

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return response.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      });
    }

    // Prepare upload options
    const uploadOptions = {
      resource_type: 'image',
      folder: fields.folder?.[0] || 'spective-uploads',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // Add public_id if provided
    if (fields.publicId && fields.publicId[0]) {
      uploadOptions.public_id = fields.publicId[0];
      uploadOptions.overwrite = true;
    }

    // Add tags if provided
    if (fields.tags && fields.tags[0]) {
      try {
        uploadOptions.tags = JSON.parse(fields.tags[0]);
      } catch (e) {
        console.warn('Failed to parse tags:', e);
      }
    }

    // Add transformation if provided
    if (fields.transformation && fields.transformation[0]) {
      try {
        const transformation = JSON.parse(fields.transformation[0]);
        uploadOptions.transformation = transformation;
      } catch (e) {
        console.warn('Failed to parse transformation:', e);
      }
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);

    // Return success response
    return response.status(200).json({
      success: true,
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      createdAt: result.created_at,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return response.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
}
