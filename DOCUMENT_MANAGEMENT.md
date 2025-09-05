# Document Management Feature

This feature provides a document upload and management system for the admin panel. Currently implemented as a demo with base64 storage, but designed to be easily upgraded to Vercel Blob storage.

## Current Implementation

### Features
- ✅ Upload documents through admin panel
- ✅ Store document metadata in Supabase database
- ✅ Download uploaded documents
- ✅ Delete documents (admin only)
- ✅ View document list with file details
- ✅ File size validation (max 50MB)
- ✅ Permission system (admin upload/delete, companies/professionals view only)
- ✅ Tabbed interface in admin panel (Companies | Documents)

### Database Schema
The `documents` table includes:
- `id` - UUID primary key
- `file_id` - Unique file identifier
- `file_name` - Original filename
- `file_url` - File URL (currently base64 data URL)
- `file_size` - File size in bytes
- `mime_type` - File MIME type
- `uploaded_by` - User ID who uploaded the file
- `created_at` - Upload timestamp
- `updated_at` - Last modified timestamp

### Permissions (RLS Policies)
- **Admins**: Can upload, view, and delete all documents (`FOR ALL USING (public.has_role(auth.uid(), 'admin'))`)
- **Companies**: Can view and download all documents (`FOR SELECT USING (public.has_role(auth.uid(), 'company'))`)
- **Professionals**: Can view and download all documents (`FOR SELECT USING (public.has_role(auth.uid(), 'professional'))`)

## Setup Instructions

### 1. Database Migration
The migration file `20250816030000_add_documents_table.sql` needs to be applied to your database. If you're using local Supabase:

```bash
# Make sure Docker Desktop is running first
cd supabase
npx supabase db reset
```

If you're using a hosted Supabase instance, apply the migration through the dashboard or CLI.

### 2. Access the Feature
1. Log in as an admin user
2. Navigate to Admin Dashboard
3. Go to the "Companies" section
4. Click on the "Documents" tab
5. Use "Upload Document" to add files

### Current Limitations
- Files are stored as base64 in the database (not recommended for production)
- Large files may cause memory issues
- No chunked upload for very large files
- Requires admin privileges to upload

## Next Steps: Vercel Blob Integration

### 1. Environment Setup
Add to your `.env.local`:
```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 2. API Route Setup
Since this is a Vite project, you'll need to:
1. Either migrate to Next.js for API routes, or
2. Set up a separate backend service, or
3. Use Vercel Functions with the Vite deployment

### 3. Code Changes for Production

Replace the upload logic in `DocumentManagement.tsx`:

```typescript
// Replace this section in handleUpload:
import { put } from '@vercel/blob';

const blob = await put(selectedFile.name, selectedFile, {
  access: 'public',
});

// Save to database with blob.url instead of base64
const { error } = await supabase
  .from('documents')
  .insert({
    file_id: blob.pathname,
    file_name: selectedFile.name,
    file_url: blob.url,
    file_size: selectedFile.size,
    mime_type: selectedFile.type,
    uploaded_by: userData.user.id,
  });
```

Replace the delete logic:
```typescript
// In handleDelete, add blob deletion:
import { del } from '@vercel/blob';

// Before database deletion:
await del(document.file_url);
```

### 4. Migration
Run the database migration to create the documents table:
```bash
npx supabase db reset
```

## File Types Supported
- Documents: PDF, DOC, DOCX, TXT
- Spreadsheets: XLS, XLSX, CSV
- Images: JPEG, PNG, GIF, WebP
- All other file types (up to 50MB)

## Usage

1. Navigate to Admin Dashboard → Companies tab → Documents tab
2. Click "Upload Document" to add new files
3. Use the download button to retrieve files
4. Use the delete button (trash icon) to remove files

## Architecture Notes

The current implementation stores files as base64 data URLs in the database. While this works for development and small files, it's not recommended for production due to:
- Database size limitations
- Performance impact
- Memory usage

The Vercel Blob integration will store files externally and only keep metadata in the database, which is the recommended approach for production applications.

## Components Added

- `src/components/admin/DocumentManagement.tsx` - Main document management component
- Updated `src/components/admin/CompanyManagement.tsx` - Added tabs and integrated document management
- Updated `src/integrations/supabase/types.ts` - Added documents table types
- `supabase/migrations/20250816030000_add_documents_table.sql` - Database migration

## Dependencies Added
- `@vercel/blob` - For future Vercel Blob integration
