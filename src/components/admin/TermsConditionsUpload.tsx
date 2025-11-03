import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TermsConditionsUploadProps {
  currentUrl?: string;
  currentFilename?: string;
  onUpdate: (url: string | null, filename: string | null) => void;
}

export const TermsConditionsUpload = ({ 
  currentUrl, 
  currentFilename, 
  onUpdate 
}: TermsConditionsUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Delete existing file if it exists
      if (currentUrl) {
        await handleFileDelete(false); // Don't show success toast for replacement
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Vercel Blob
      const response = await fetch(`${import.meta.env.VITE_API_URL_ || ''}/api/upload-terms?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-Filename': file.name,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const { downloadUrl } = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update the callback with new URL and filename
      onUpdate(downloadUrl, file.name);

      toast({
        title: "Upload successful",
        description: "Terms & Conditions document has been uploaded.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileDelete = async (showToast = true) => {
    if (!currentUrl) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL_ || ''}/api/delete-terms`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: currentUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      onUpdate(null, null);

      if (showToast) {
        toast({
          title: "File deleted",
          description: "Terms & Conditions document has been removed.",
        });
      }

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Terms & Conditions Document</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current File Display */}
        {currentUrl && currentFilename && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Current Document
                </span>
              </div>
              <Badge variant="secondary">{currentFilename}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFileDelete()}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="terms-upload" className="text-sm font-medium">
              {currentUrl ? 'Replace Document' : 'Upload Document'}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, Word (.doc, .docx), Text (.txt) - Max 10MB
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              id="terms-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileUpload}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('terms-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Browse
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Usage Information:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>This document will be linked in registration forms</li>
              <li>Users must accept terms to complete registration</li>
              <li>Document is publicly accessible via the link</li>
              <li>Replace anytime by uploading a new file</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
