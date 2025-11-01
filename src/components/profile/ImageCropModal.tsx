import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageCropModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSave: (croppedImage: Blob) => Promise<void>;
}

interface CropArea {
  x: number;
  y: number;
  size: number;
}

export function ImageCropModal({ open, onClose, onSave }: ImageCropModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setPreviewUrl(url);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        
        // Set initial crop area to center of image
        const containerWidth = 500; // Max width of preview container
        const containerHeight = 400; // Max height of preview container
        const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
        const displayWidth = img.width * scale;
        const displayHeight = img.height * scale;
        
        const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
        setCropArea({
          x: (displayWidth - initialSize) / 2,
          y: (displayHeight - initialSize) / 2,
          size: initialSize
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    if (!containerRef.current || !imageRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const maxX = imageRect.width;
    const maxY = imageRect.height;

    if (isDragging) {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX - prev.size, prev.x + deltaX)),
        y: Math.max(0, Math.min(maxY - prev.size, prev.y + deltaY))
      }));
    } else if (isResizing) {
      setCropArea(prev => {
        const newSize = Math.max(50, prev.size + deltaX);
        const maxSize = Math.min(maxX - prev.x, maxY - prev.y);
        return {
          ...prev,
          size: Math.min(newSize, maxSize)
        };
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, isResizing, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const getCroppedImage = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!canvasRef.current || !imageRef.current || !previewUrl) {
        reject(new Error('Missing required elements'));
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to 512x512
      canvas.width = 512;
      canvas.height = 512;

      const img = new Image();
      img.onload = () => {
        const imageRect = imageRef.current!.getBoundingClientRect();
        const scaleX = img.width / imageRect.width;
        const scaleY = img.height / imageRect.height;

        // Calculate source coordinates
        const sx = cropArea.x * scaleX;
        const sy = cropArea.y * scaleY;
        const sSize = cropArea.size * scaleX;

        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sx, sy, sSize, sSize,
          0, 0, 512, 512
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = previewUrl;
    });
  }, [previewUrl, cropArea]);

  const handleSave = async () => {
    try {
      setUploading(true);
      setError(null);

      const croppedBlob = await getCroppedImage();
      await onSave(croppedBlob);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!previewUrl ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Choose an image</p>
                    <p>or drag and drop it here</p>
                    <p className="text-xs">JPEG, PNG, WebP (max 10MB)</p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                ref={containerRef}
                className="relative border rounded-lg overflow-hidden bg-muted"
                style={{ maxWidth: '500px', maxHeight: '400px', margin: '0 auto' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[400px] block"
                  style={{ userSelect: 'none' }}
                  draggable={false}
                />
                
                {/* Crop overlay */}
                <div
                  className="absolute border-2 border-primary bg-primary/10 cursor-move"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.size,
                    height: cropArea.size,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'drag')}
                >
                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-nwse-resize"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, 'resize');
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Drag the square to position, resize from bottom-right corner. Final image will be 512x512px.
              </p>

              <Button
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                variant="outline"
                className="w-full"
                disabled={uploading}
              >
                Choose Different Image
              </Button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter>
          <Button onClick={handleClose} variant="outline" disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!previewUrl || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
