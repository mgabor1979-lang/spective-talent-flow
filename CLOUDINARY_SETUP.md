# Cloudinary Image Upload Service

## Overview

This service provides secure image upload, replace, and delete functionality using Cloudinary with built-in rate limiting and validation to prevent spam and abuse.

## Features

- ✅ **Secure Upload**: Image upload with validation and rate limiting
- ✅ **Replace Images**: Replace existing images while maintaining public IDs
- ✅ **Delete Images**: Safe deletion of images from Cloudinary
- ✅ **Rate Limiting**: IP-based rate limiting (20 uploads/15 min, 30 deletes/15 min)
- ✅ **Daily Limits**: Client-side tracking (100 uploads per day)
- ✅ **File Validation**: Size (10MB max) and format validation (JPEG, PNG, WebP, GIF)
- ✅ **TypeScript Support**: Fully typed for better development experience
- ✅ **React Hook**: Easy integration with React components
- ✅ **Origin Validation**: Only allowed origins can access the API
- ✅ **Automatic Transformations**: Support for image transformations during upload

## Setup

### 1. Install Dependencies

```bash
npm install cloudinary formidable
npm install -D @types/formidable
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Get Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

### 4. Vercel Configuration

Add environment variables in Vercel:
- Go to Project Settings → Environment Variables
- Add `CLOUDINARY_CLOUD_NAME`
- Add `CLOUDINARY_API_KEY`
- Add `CLOUDINARY_API_SECRET`

## Usage

### Using the React Hook

```tsx
import { useCloudinary } from '@/hooks/use-cloudinary';
import { useState } from 'react';

function ImageUploadComponent() {
  const { upload, deleteImage, uploading, error, uploadStats } = useCloudinary();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload({
      file,
      folder: 'profile-pictures',
      tags: ['profile', 'user'],
      transformation: {
        width: 500,
        height: 500,
        crop: 'fill',
        quality: 'auto'
      }
    });

    if (result.success) {
      setImageUrl(result.secureUrl!);
      setPublicId(result.publicId!);
      console.log('Upload successful:', result);
    } else {
      console.error('Upload failed:', result.error);
    }
  };

  const handleDelete = async () => {
    if (!publicId) return;

    const result = await deleteImage(publicId);
    
    if (result.success) {
      setImageUrl(null);
      setPublicId(null);
      console.log('Delete successful');
    } else {
      console.error('Delete failed:', result.error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '300px' }} />
          <button onClick={handleDelete}>Delete Image</button>
        </div>
      )}
      
      <div>
        <p>Upload Stats: {uploadStats.count}/{uploadStats.limit}</p>
        <p>Remaining: {uploadStats.remaining}</p>
      </div>
    </div>
  );
}
```

### Using the Service Directly

```typescript
import { cloudinaryService } from '@/lib/cloudinary-service';

// Upload an image
const uploadResult = await cloudinaryService.uploadImage({
  file: myFile,
  folder: 'products',
  tags: ['featured', 'homepage'],
  transformation: {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto'
  }
});

if (uploadResult.success) {
  console.log('Image URL:', uploadResult.secureUrl);
  console.log('Public ID:', uploadResult.publicId);
}

// Replace an image
const replaceResult = await cloudinaryService.replaceImage(
  'old-public-id',
  {
    file: newFile,
    folder: 'products'
  }
);

// Delete an image
const deleteResult = await cloudinaryService.deleteImage('public-id-to-delete');

// Check upload stats
const stats = cloudinaryService.getUploadStats();
console.log(`Used ${stats.count}/${stats.limit} uploads today`);
```

## API Endpoints

### POST /api/cloudinary/upload

Upload a new image to Cloudinary.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body (FormData):
  - `file`: Image file (required)
  - `folder`: Folder name in Cloudinary (optional)
  - `publicId`: Custom public ID (optional)
  - `tags`: JSON array of tags (optional)
  - `transformation`: JSON object with transformation options (optional)

**Response:**
```json
{
  "success": true,
  "publicId": "folder/image-name",
  "url": "http://...",
  "secureUrl": "https://...",
  "width": 1920,
  "height": 1080,
  "format": "jpg",
  "resourceType": "image",
  "bytes": 123456,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### POST /api/cloudinary/delete

Delete an image from Cloudinary.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
  ```json
  {
    "publicId": "folder/image-name"
  }
  ```

**Response:**
```json
{
  "success": true,
  "result": "ok",
  "message": "Image deleted successfully"
}
```

## Security Features

### Rate Limiting

**Server-Side (IP-based):**
- Upload: 20 requests per 15 minutes per IP
- Delete: 30 requests per 15 minutes per IP

**Client-Side:**
- 100 uploads per day (tracked locally)

### File Validation

- **Maximum file size**: 10MB
- **Allowed formats**: JPEG, JPG, PNG, WebP, GIF
- **MIME type validation**: Server-side verification

### Origin Validation

Only requests from allowed origins are processed:
- `http://localhost:8080`
- `http://localhost:3000`
- `http://localhost:5173`
- `https://spective.cryptonit.hu`
- `https://spective.hu`
- `https://www.spective.hu`

### Environment Security

- API keys stored in environment variables
- Never exposed to client-side code
- Validated before processing requests

## Configuration Options

### Upload Options

```typescript
interface CloudinaryUploadOptions {
  file: File;                    // Required: The file to upload
  folder?: string;               // Optional: Cloudinary folder
  publicId?: string;             // Optional: Custom public ID
  tags?: string[];               // Optional: Tags for organization
  transformation?: {             // Optional: Image transformations
    width?: number;              // Target width
    height?: number;             // Target height
    crop?: string;               // Crop mode: 'fill', 'fit', 'scale', etc.
    quality?: string | number;   // Quality: 'auto', 1-100
  };
}
```

### Transformation Options

Common transformation parameters:
- `width`: Target width in pixels
- `height`: Target height in pixels
- `crop`: Crop mode (`fill`, `fit`, `scale`, `pad`, `crop`)
- `quality`: Quality level (`auto`, `auto:eco`, `auto:good`, `auto:best`, or 1-100)
- `format`: Output format (`jpg`, `png`, `webp`, `auto`)

## Best Practices

1. **Use Folders**: Organize images in folders for better management
   ```typescript
   folder: 'profiles/avatars'
   ```

2. **Add Tags**: Tag images for easy filtering and searching
   ```typescript
   tags: ['user', 'profile', 'verified']
   ```

3. **Apply Transformations**: Optimize images during upload
   ```typescript
   transformation: {
     width: 1000,
     height: 1000,
     crop: 'fill',
     quality: 'auto'
   }
   ```

4. **Handle Errors**: Always check the success flag
   ```typescript
   if (!result.success) {
     console.error(result.error);
     // Show user-friendly error message
   }
   ```

5. **Track Usage**: Monitor upload statistics
   ```typescript
   const stats = cloudinaryService.getUploadStats();
   if (stats.remaining < 10) {
     // Warn user about approaching limit
   }
   ```

6. **Delete Unused Images**: Clean up old images to save storage
   ```typescript
   await cloudinaryService.deleteImage(oldPublicId);
   ```

## Troubleshooting

### Upload Fails with "Cloudinary not configured"

**Solution**: Ensure environment variables are set correctly:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Rate Limit Exceeded

**Solution**: Wait 15 minutes or implement request queuing. Adjust `MAX_REQUESTS` in API files if needed.

### File Type Not Allowed

**Solution**: Only JPEG, PNG, WebP, and GIF are supported. Convert your image or update `ALLOWED_FORMATS` in the service.

### File Too Large

**Solution**: Compress the image or adjust `MAX_FILE_SIZE` (default: 10MB).

### CORS Error

**Solution**: Ensure your origin is in the `allowedOrigins` array in API files.

## Extending the Service

### Adding New File Types

Update `ALLOWED_FORMATS` in `cloudinary-service.ts`:
```typescript
private readonly ALLOWED_FORMATS = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'image/gif',
  'image/svg+xml'  // Add SVG support
];
```

And in `api/cloudinary/upload.js`:
```javascript
const allowedMimeTypes = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'image/gif',
  'image/svg+xml'
];
```

### Adjusting Rate Limits

Update limits in API files:
```javascript
const MAX_REQUESTS = 50; // Increase limit
const RATE_LIMIT_WINDOW = 30 * 60 * 1000; // 30 minutes
```

### Adding Video Support

1. Update resource type in upload options
2. Add video MIME types to validation
3. Update Cloudinary upload call with `resource_type: 'video'`

## Support

For issues or questions:
1. Check Cloudinary documentation: https://cloudinary.com/documentation
2. Review error messages in browser console
3. Check server logs for detailed error information

## License

This implementation is part of the Spective project and is proprietary software.
