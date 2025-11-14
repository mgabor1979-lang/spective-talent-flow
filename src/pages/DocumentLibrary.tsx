import { Layout } from '@/components/layout/Layout';
import { SpectiveFileManager } from '@/components/admin/SpectiveFileManager';

const DocumentLibrary = () => {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Document Library</h1>
          <p className="text-muted-foreground">
            Access and download shared documents
          </p>
        </div>
        <SpectiveFileManager />
      </div>
    </Layout>
  );
};

export default DocumentLibrary;
