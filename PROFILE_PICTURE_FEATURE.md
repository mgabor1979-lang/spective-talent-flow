# Profile Picture Upload Feature

## Overview

This feature allows users to upload, crop, and manage their profile pictures. Images are stored in Cloudinary and URLs are saved in the Supabase `profileimages` table.

## Components Created

### 1. Database Migration (`supabase/migrations/20251101000000_create_profileimages.sql`)
- Creates `profileimages` table with RLS policies
- Stores image URL and Cloudinary public ID
- Automatic timestamp management
- Foreign key relationship with `profiles` table

### 2. Image Crop Modal (`src/components/profile/ImageCropModal.tsx`)
- File selection with drag-and-drop support
- Interactive crop area with draggable square
- Resizable crop area (drag from bottom-right corner)
- Automatic resize to 512x512px
- Preview before upload
- File validation (type, size)

### 3. Profile Picture Badges (`src/components/profile/ProfilePictureBadges.tsx`)
- Upload button (camera icon)
- Delete button (trash icon) - only shown when image exists
- Confirmation dialog before deletion
- Positioned at bottom-right of avatar

### 4. Profile Image Hook (`src/hooks/use-profile-image.ts`)
- `uploadProfileImage()` - Upload new image
- `deleteProfileImage()` - Remove image
- `refreshProfileImage()` - Reload image data
- Automatic cleanup of old images
- Loading and error state management

## Database Schema

```sql
CREATE TABLE profileimages (
  uid uuid PRIMARY KEY,
  src text NOT NULL,
  cloudinary_public_id text,
  created timestamp with time zone DEFAULT now(),
  updated timestamp with time zone DEFAULT now(),
  FOREIGN KEY (uid) REFERENCES profiles(user_id) ON DELETE CASCADE
);
```

### Row Level Security Policies

- Users can view their own profile images
- Users can insert/update/delete their own profile images
- Admins can view all profile images
- Company users can view professional profile images

## Integration in Profile.tsx

### New State & Hooks
```typescript
const {
  profileImage,
  uploading: imageUploading,
  deleting: imageDeleting,
  uploadProfileImage,
  deleteProfileImage,
  refreshProfileImage
} = useProfileImage();

const [imageCropModalOpen, setImageCropModalOpen] = useState(false);
```

### Handler Functions
```typescript
const handleUploadImage = () => {
  setImageCropModalOpen(true);
};

const handleSaveImage = async (croppedImage: Blob) => {
  if (profileData?.user_id) {
    await uploadProfileImage(croppedImage, profileData.user_id);
  }
};

const handleDeleteImage = async () => {
  if (profileData?.user_id) {
    await deleteProfileImage(profileData.user_id);
  }
};
```

### Avatar Section
```tsx
<div className="relative">
  <Avatar className="h-24 w-24">
    <AvatarImage src={profileImage?.src || "/images/maleavatar.png"} />
    <AvatarFallback className="text-2xl font-bold">
      {displayNameForAvatar}
    </AvatarFallback>
  </Avatar>
  {isOwner && (
    <ProfilePictureBadges
      hasImage={!!profileImage}
      onUpload={handleUploadImage}
      onDelete={handleDeleteImage}
      disabled={imageUploading || imageDeleting}
    />
  )}
</div>
```

## User Flow

### Upload Flow
1. User clicks upload button (camera icon) on their avatar
2. Modal opens with file selection
3. User selects image file (JPEG, PNG, WebP, GIF, max 10MB)
4. Image preview appears with draggable crop square
5. User adjusts crop area:
   - Drag square to reposition
   - Drag bottom-right corner to resize
6. User clicks "Save"
7. Image is cropped to 512x512px
8. Upload to Cloudinary (with transformations)
9. URL saved to database
10. Avatar updates immediately

### Replace Flow
1. User uploads new image (same process as above)
2. Hook automatically:
   - Deletes old image from Cloudinary
   - Uploads new image
   - Updates database record
3. Avatar displays new image

### Delete Flow
1. User clicks delete button (trash icon)
2. Confirmation dialog appears: "Are you sure?"
3. On confirmation:
   - Image deleted from Cloudinary
   - Database record removed
   - Avatar reverts to default/initials

## Security Features

### File Validation
- **File types**: JPEG, JPG, PNG, WebP, GIF only
- **Max size**: 10MB
- **Client-side validation**: Before upload
- **Server-side validation**: In API endpoint

### Rate Limiting
- **Client-side**: 100 uploads per day
- **Server-side (IP-based)**: 20 uploads per 15 minutes

### Access Control
- **Upload/Delete**: Only profile owner
- **View**: Owner, admins, and company users (for professionals)
- **RLS**: Enforced at database level

### Cloudinary Integration
- Secure API calls from server only
- Automatic image optimization
- CDN delivery
- Old images cleaned up on replace

## Dependencies

Already installed in previous Cloudinary implementation:
- `cloudinary` - For image upload/delete
- `formidable` - For multipart form parsing (server-side)

## API Endpoints Used

### Upload
- **Endpoint**: `/api/cloudinary/upload`
- **Method**: POST
- **Body**: FormData with file
- **Response**: `{ publicId, secureUrl, width, height, format }`

### Delete
- **Endpoint**: `/api/cloudinary/delete`
- **Method**: POST
- **Body**: `{ publicId }`
- **Response**: `{ success, result }`

## Error Handling

### Client-Side
- File validation errors
- Upload/delete failures
- Toast notifications for all operations
- Loading states during operations

### Server-Side
- Cloudinary API errors
- Database errors
- Automatic cleanup on partial failures

## Testing

### Manual Testing Steps
1. Navigate to your profile page
2. Verify upload and delete buttons appear
3. Click upload, select an image
4. Test crop functionality:
   - Drag to reposition
   - Resize from corner
5. Save and verify image appears
6. Upload new image (test replace)
7. Click delete and confirm
8. Verify image removed

### Edge Cases
- Very small images
- Very large images (>10MB)
- Invalid file types
- Network errors during upload
- Partial upload failures

## Future Enhancements

1. **Image editing**: Rotation, filters
2. **Multiple images**: Gallery support
3. **Batch operations**: Upload multiple
4. **Image optimization**: Better compression
5. **Progress indicator**: Upload progress bar
6. **Image formats**: Support more formats
7. **Thumbnails**: Generate multiple sizes
8. **Image history**: Keep previous images

## Troubleshooting

### Image doesn't appear after upload
- Check browser console for errors
- Verify Cloudinary credentials in `.env`
- Check network tab for API failures
- Verify database record created

### Upload fails
- Check file size (<10MB)
- Verify file type is allowed
- Check rate limits
- Verify Cloudinary quota

### Delete doesn't work
- Check browser console
- Verify RLS policies
- Check Cloudinary API response

### Crop area behaves strangely
- Try refreshing the page
- Check browser console for errors
- Verify image loaded completely

## Database Queries

### Get profile image
```sql
SELECT src, cloudinary_public_id
FROM profileimages
WHERE uid = 'user-id';
```

### Update profile image
```sql
INSERT INTO profileimages (uid, src, cloudinary_public_id, updated)
VALUES ('user-id', 'image-url', 'public-id', now())
ON CONFLICT (uid)
DO UPDATE SET
  src = EXCLUDED.src,
  cloudinary_public_id = EXCLUDED.cloudinary_public_id,
  updated = now();
```

### Delete profile image
```sql
DELETE FROM profileimages
WHERE uid = 'user-id';
```

## Performance Considerations

- Images are lazy-loaded
- Cloudinary CDN for fast delivery
- Automatic image optimization
- Client-side caching of image URLs
- Database indexes on uid column

## Accessibility

- Alt text for images
- Keyboard navigation in modal
- Focus management
- Screen reader friendly
- ARIA labels on buttons

## Related Files

- `src/lib/cloudinary-service.ts` - Core upload service
- `src/hooks/use-cloudinary.ts` - React hook
- `api/cloudinary/upload.js` - Upload API
- `api/cloudinary/delete.js` - Delete API
- `CLOUDINARY_SETUP.md` - Setup documentation
- `CLOUDINARY_IMPLEMENTATION.md` - Implementation guide
