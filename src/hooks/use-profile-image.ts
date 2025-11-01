import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cloudinaryService } from '@/lib/cloudinary-service';
import { useToast } from '@/hooks/use-toast';

interface ProfileImage {
  readonly src: string;
  readonly cloudinaryPublicId: string | null;
}

interface UseProfileImageReturn {
  profileImage: ProfileImage | null;
  loading: boolean;
  uploading: boolean;
  deleting: boolean;
  uploadProfileImage: (imageBlob: Blob, userId: string) => Promise<void>;
  deleteProfileImage: (userId: string) => Promise<void>;
  refreshProfileImage: (userId: string) => Promise<void>;
}

export function useProfileImage(): UseProfileImageReturn {
  const [profileImage, setProfileImage] = useState<ProfileImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchProfileImage = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profileimages')
        .select('src, cloudinary_public_id')
        .eq('uid', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile image:', error);
        setProfileImage(null);
        return;
      }

      if (data) {
        setProfileImage({
          src: data.src,
          cloudinaryPublicId: data.cloudinary_public_id
        });
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setProfileImage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProfileImage = useCallback(async (imageBlob: Blob, userId: string) => {
    try {
      setUploading(true);

      // Convert blob to file
      const file = new File([imageBlob], 'profile-picture.jpg', { type: 'image/jpeg' });

      // Check if user already has a profile image
      const { data: existingImage } = await supabase
        .from('profileimages')
        .select('cloudinary_public_id')
        .eq('uid', userId)
        .maybeSingle();

      // Delete old image from Cloudinary if it exists
      if (existingImage?.cloudinary_public_id) {
        await cloudinaryService.deleteImage(existingImage.cloudinary_public_id);
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage({
        file,
        folder: 'profile-pictures',
        tags: ['profile', 'avatar'],
        transformation: {
          width: 512,
          height: 512,
          crop: 'fill',
          quality: 'auto'
        }
      });

      if (!uploadResult.success || !uploadResult.secureUrl || !uploadResult.publicId) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('profileimages')
        .upsert({
          uid: userId,
          src: uploadResult.secureUrl,
          cloudinary_public_id: uploadResult.publicId,
          updated: new Date().toISOString()
        }, {
          onConflict: 'uid'
        });

      if (dbError) {
        // If database save fails, try to clean up Cloudinary
        await cloudinaryService.deleteImage(uploadResult.publicId);
        throw dbError;
      }

      // Update local state
      setProfileImage({
        src: uploadResult.secureUrl,
        cloudinaryPublicId: uploadResult.publicId
      });

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });

    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload profile picture',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const deleteProfileImage = useCallback(async (userId: string) => {
    try {
      setDeleting(true);

      // Get current image info
      const { data: existingImage } = await supabase
        .from('profileimages')
        .select('cloudinary_public_id')
        .eq('uid', userId)
        .maybeSingle();

      if (!existingImage) {
        toast({
          title: 'Info',
          description: 'No profile picture to delete',
        });
        return;
      }

      // Delete from Cloudinary
      if (existingImage.cloudinary_public_id) {
        await cloudinaryService.deleteImage(existingImage.cloudinary_public_id);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('profileimages')
        .delete()
        .eq('uid', userId);

      if (dbError) {
        throw dbError;
      }

      // Update local state
      setProfileImage(null);

      toast({
        title: 'Success',
        description: 'Profile picture removed successfully',
      });

    } catch (error) {
      console.error('Error deleting profile image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete profile picture',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setDeleting(false);
    }
  }, [toast]);

  const refreshProfileImage = useCallback(async (userId: string) => {
    await fetchProfileImage(userId);
  }, [fetchProfileImage]);

  return {
    profileImage,
    loading,
    uploading,
    deleting,
    uploadProfileImage,
    deleteProfileImage,
    refreshProfileImage
  };
}
