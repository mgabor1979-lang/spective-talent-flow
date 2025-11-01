import { useState } from 'react';
import { 
  cloudinaryService, 
  type CloudinaryUploadOptions, 
  type CloudinaryUploadResult,
  type CloudinaryDeleteResult 
} from '@/lib/cloudinary-service';

interface UseCloudinaryReturn {
  upload: (options: CloudinaryUploadOptions) => Promise<CloudinaryUploadResult>;
  replace: (publicId: string, options: Omit<CloudinaryUploadOptions, 'publicId'>) => Promise<CloudinaryUploadResult>;
  deleteImage: (publicId: string) => Promise<CloudinaryDeleteResult>;
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  uploadStats: { count: number; limit: number; remaining: number };
}

/**
 * React hook for Cloudinary image operations
 * Provides upload, replace, and delete functionality with loading states
 */
export const useCloudinary = (): UseCloudinaryReturn => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> => {
    setUploading(true);
    setError(null);

    try {
      const result = await cloudinaryService.uploadImage(options);
      
      if (!result.success) {
        setError(result.error || 'Upload failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setUploading(false);
    }
  };

  const replace = async (
    publicId: string, 
    options: Omit<CloudinaryUploadOptions, 'publicId'>
  ): Promise<CloudinaryUploadResult> => {
    setUploading(true);
    setError(null);

    try {
      const result = await cloudinaryService.replaceImage(publicId, options);
      
      if (!result.success) {
        setError(result.error || 'Replace failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Replace failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (publicId: string): Promise<CloudinaryDeleteResult> => {
    setDeleting(true);
    setError(null);

    try {
      const result = await cloudinaryService.deleteImage(publicId);
      
      if (!result.success) {
        setError(result.error || 'Delete failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setDeleting(false);
    }
  };

  const uploadStats = cloudinaryService.getUploadStats();

  return {
    upload,
    replace,
    deleteImage,
    uploading,
    deleting,
    error,
    uploadStats
  };
};
