import { useState } from 'react';
import { useCloudinary } from '@/hooks/use-cloudinary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Example component demonstrating Cloudinary image upload functionality
 * This is a reference implementation - adapt for your specific use case
 */
export function CloudinaryExample() {
  const { upload, replace, deleteImage, uploading, deleting, error, uploadStats } = useCloudinary();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState('test-uploads');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await upload({
      file: selectedFile,
      folder: uploadFolder,
      tags: ['example', 'test'],
      transformation: {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto'
      }
    });

    if (result.success) {
      setImageUrl(result.secureUrl!);
      setPublicId(result.publicId!);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };

  const handleReplace = async () => {
    if (!selectedFile || !publicId) return;

    const result = await replace(publicId, {
      file: selectedFile,
      folder: uploadFolder,
      tags: ['example', 'test', 'replaced'],
      transformation: {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto'
      }
    });

    if (result.success) {
      setImageUrl(result.secureUrl!);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    if (!publicId) return;

    const result = await deleteImage(publicId);
    
    if (result.success) {
      setImageUrl(null);
      setPublicId(null);
    }
  };

  const isLoading = uploading || deleting;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Cloudinary Image Upload Example</CardTitle>
          <CardDescription>
            Upload, replace, and delete images securely with rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Stats */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Daily Upload Stats: {uploadStats.count}/{uploadStats.limit} 
              ({uploadStats.remaining} remaining)
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder">Upload Folder</Label>
              <Input
                id="folder"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                placeholder="e.g., profile-pictures"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="file">Select Image</Label>
              <Input
                id="file"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-md rounded-lg border"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!imageUrl ? (
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isLoading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleReplace} 
                  disabled={!selectedFile || isLoading}
                  variant="secondary"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Replacing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Replace Image
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Uploaded Image Display */}
          {imageUrl && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Image uploaded successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Uploaded Image</Label>
                <img 
                  src={imageUrl} 
                  alt="Uploaded" 
                  className="max-w-md rounded-lg border"
                />
              </div>

              <div className="space-y-2">
                <Label>Public ID</Label>
                <code className="block p-2 bg-muted rounded text-sm">
                  {publicId}
                </code>
              </div>

              <div className="space-y-2">
                <Label>Secure URL</Label>
                <code className="block p-2 bg-muted rounded text-sm break-all">
                  {imageUrl}
                </code>
              </div>

              <Button 
                onClick={handleDelete} 
                disabled={isLoading}
                variant="destructive"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Image
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Usage Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Features:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Rate limiting: 20 uploads per 15 minutes</li>
                <li>File size limit: 10MB</li>
                <li>Allowed formats: JPEG, PNG, WebP, GIF</li>
                <li>Daily limit: {uploadStats.limit} uploads</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
