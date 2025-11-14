import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Calendar,
  HardDrive
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  file_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

const getFileIcon = (mimeType: string | null, fileName: string) => {
  if (!mimeType) {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (['pdf'].includes(extension)) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  }

  if (mimeType.startsWith('image/')) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') {
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  }
  if (mimeType.startsWith('text/')) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size';
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const getFileTypeName = (mimeType: string | null, fileName: string): string => {
  console.log(fileName);
  if (!mimeType) {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'Image';
    }
    if (['pdf'].includes(extension)) {
      return 'PDF Document';
    }
    if (['doc', 'docx'].includes(extension)) {
      return 'Word Document';
    }
    if (['xls', 'xlsx'].includes(extension)) {
      return 'Excel Spreadsheet';
    }
    if (['csv'].includes(extension)) {
      return 'CSV File';
    }
    if (['txt'].includes(extension)) {
      return 'Text File';
    }
    if (['zip', 'rar', '7z'].includes(extension)) {
      return 'Archive';
    }
    return 'File';
  }

  // Handle MIME types
  if (mimeType.startsWith('image/')) {
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'JPEG Image';
    if (mimeType === 'image/png') return 'PNG Image';
    if (mimeType === 'image/gif') return 'GIF Image';
    if (mimeType === 'image/svg+xml') return 'SVG Image';
    if (mimeType === 'image/webp') return 'WebP Image';
    return 'Image';
  }
  
  if (mimeType === 'application/pdf') return 'PDF Document';
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'Word Document';
  }
  if (mimeType === 'application/msword') return 'Word Document';
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'Excel Spreadsheet';
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return 'Presentation Document';
  }

  if (mimeType === 'application/vnd.ms-excel') return 'Excel Spreadsheet';
  
  if (mimeType === 'text/csv') return 'CSV File';
  if (mimeType.startsWith('text/')) return 'Text File';
  
  if (mimeType === 'application/zip') return 'ZIP Archive';
  if (mimeType === 'application/x-rar-compressed') return 'RAR Archive';
  if (mimeType === 'application/x-7z-compressed') return '7Z Archive';
  
  if (mimeType === 'application/json') return 'JSON File';
  if (mimeType === 'application/xml' || mimeType === 'text/xml') return 'XML File';
  
  if (mimeType.startsWith('video/')) return 'Video File';
  if (mimeType.startsWith('audio/')) return 'Audio File';
  
  return 'File';
};

export const SpectiveFileManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
        setDocuments([]);
        
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = async (doc: Document) => {
    try {
      setDownloading(doc.id);
      
      // Handle sample/demo files
      if (doc.file_url === '#') {
        toast({
          title: "Demo Mode",
          description: `This is a demo file. In production, ${doc.file_name} would be downloaded.`,
        });
        return;
      }
      
      // Create a temporary anchor element and trigger download
      const link = window.document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.file_name;
      link.target = '_blank';
      
      // Append to body, click, and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Downloaded ${doc.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are currently no documents in the system. Documents uploaded by administrators will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Library
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Access and download documents shared by administrators
        </p>
      </CardHeader>
      <CardContent>
        {/* Mobile-friendly card view on small screens, table on larger screens */}
        <div className="block md:hidden space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getFileIcon(doc.mime_type, doc.file_name)}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 truncate" title={doc.file_name}>
                      {doc.file_name}
                    </h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="text-blue-600 font-medium">
                        {getFileTypeName(doc.mime_type, doc.file_name)}
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(doc.file_size)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  disabled={downloading === doc.id}
                  className="h-8 w-8 p-0 ml-2"
                  title="Download file"
                >
                  {downloading === doc.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Size</TableHead>
                <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50">
                  <TableCell>
                    {getFileIcon(doc.mime_type, doc.file_name)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 truncate max-w-xs" title={doc.file_name}>
                        {doc.file_name}
                      </div>
                      <div className="text-sm text-gray-500 lg:hidden">
                        {getFileTypeName(doc.mime_type, doc.file_name)} • {formatFileSize(doc.file_size)} • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-600">
                    {getFileTypeName(doc.mime_type, doc.file_name)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-600">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      {formatFileSize(doc.file_size)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      className="h-8 w-8 p-0"
                      title="Download file"
                    >
                      {downloading === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                {formatFileSize(documents.reduce((total, doc) => total + (doc.file_size || 0), 0))} total
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Files are managed by administrators
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
