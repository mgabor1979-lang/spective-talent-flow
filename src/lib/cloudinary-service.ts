/**
 * Cloudinary Image Upload Service
 * 
 * Provides secure image upload, replace, and delete functionality with rate limiting
 * and validation to prevent spam and abuse.
 */

interface CloudinaryUploadOptions {
  file: File;
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
}

interface CloudinaryUploadResult {
  success: boolean;
  publicId?: string;
  url?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  error?: string;
}

interface CloudinaryDeleteResult {
  success: boolean;
  result?: string;
  error?: string;
}

class CloudinaryService {
  private static instance: CloudinaryService;
  private uploadCount = 0;
  private lastResetDate = new Date();
  private readonly MAX_UPLOADS_PER_DAY = 100; // Adjust based on your Cloudinary plan
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  // Singleton pattern
  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  /**
   * Upload an image to Cloudinary
   * @param options Upload options including file, folder, and transformations
   * @returns Upload result with URL and metadata
   */
  async uploadImage(options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
    try {
      // Validate rate limit
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: `Daily upload limit (${this.MAX_UPLOADS_PER_DAY}) exceeded. Please try again tomorrow.`
        };
      }

      // Validate file
      const validationError = this.validateFile(options.file);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', options.file);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.publicId) {
        formData.append('publicId', options.publicId);
      }
      
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', JSON.stringify(options.tags));
      }
      
      if (options.transformation) {
        formData.append('transformation', JSON.stringify(options.transformation));
      }

      // Call API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = `/api/cloudinary/upload`;
      //const endpoint = `${apiUrl}/api/cloudinary/upload`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to upload image'
        };
      }

      // Increment counter on success
      this.incrementCounter();

      return {
        success: true,
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.secureUrl,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resourceType
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
      };
    }
  }

  /**
   * Replace an existing image in Cloudinary
   * @param publicId The public ID of the image to replace
   * @param options Upload options for the new image
   * @returns Upload result with new URL and metadata
   */
  async replaceImage(publicId: string, options: Omit<CloudinaryUploadOptions, 'publicId'>): Promise<CloudinaryUploadResult> {
    try {
      // First, delete the old image
      const deleteResult = await this.deleteImage(publicId);
      
      if (!deleteResult.success) {
        console.warn(`Failed to delete old image ${publicId}, proceeding with upload anyway:`, deleteResult.error);
      }

      // Upload new image with the same public ID
      return await this.uploadImage({
        ...options,
        publicId
      });

    } catch (error) {
      console.error('Replace error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during replace'
      };
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId The public ID of the image to delete
   * @returns Deletion result
   */
  async deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
    try {
      if (!publicId || typeof publicId !== 'string') {
        return {
          success: false,
          error: 'Invalid public ID'
        };
      }

      // Call API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const endpoint = `${apiUrl}/api/cloudinary/delete`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to delete image'
        };
      }

      return {
        success: true,
        result: result.result
      };

    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during deletion'
      };
    }
  }

  /**
   * Validate file before upload
   * @param file File to validate
   * @returns Error message if invalid, null if valid
   */
  private validateFile(file: File): string | null {
    // Check if file exists
    if (!file) {
      return 'No file provided';
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    // Check file type
    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      return `Invalid file format. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`;
    }

    return null;
  }

  /**
   * Check if within rate limits
   * @returns true if within limits, false otherwise
   */
  private checkRateLimit(): boolean {
    const now = new Date();
    
    // Reset counter if it's a new day
    if (now.getDate() !== this.lastResetDate.getDate() ||
        now.getMonth() !== this.lastResetDate.getMonth() ||
        now.getFullYear() !== this.lastResetDate.getFullYear()) {
      this.uploadCount = 0;
      this.lastResetDate = now;
    }

    return this.uploadCount < this.MAX_UPLOADS_PER_DAY;
  }

  /**
   * Increment upload counter
   */
  private incrementCounter(): void {
    this.uploadCount++;
  }

  /**
   * Get current upload statistics
   * @returns Upload stats
   */
  getUploadStats(): { count: number; limit: number; remaining: number } {
    return {
      count: this.uploadCount,
      limit: this.MAX_UPLOADS_PER_DAY,
      remaining: Math.max(0, this.MAX_UPLOADS_PER_DAY - this.uploadCount)
    };
  }

  /**
   * Reset upload counter (for testing purposes)
   */
  resetCounter(): void {
    this.uploadCount = 0;
    this.lastResetDate = new Date();
  }
}

// Export singleton instance
export const cloudinaryService = CloudinaryService.getInstance();

// Export types
export type {
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
  CloudinaryDeleteResult
};
