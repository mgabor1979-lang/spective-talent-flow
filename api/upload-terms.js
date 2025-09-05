import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file from the request body (as buffer)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Get filename from query params or headers
    const filename = req.query.filename || req.headers['x-filename'] || 'terms-conditions.pdf';
    const contentType = req.headers['content-type'] || 'application/pdf';

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `terms-conditions-${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({
      downloadUrl: blob.url,
    });

  } catch (error) {
    console.error('Upload terms error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
