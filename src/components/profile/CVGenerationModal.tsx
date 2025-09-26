import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Download } from 'lucide-react';
import { CVDocument } from './CVDocument';
import { CVPDFDocument } from './CVPDFDocument';
import { pdf } from '@react-pdf/renderer';

interface CVGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  parsedData: any;
}

interface CVOptions {
  hideName: boolean;
  hideEmail: boolean;
  hideMobile: boolean;
  hideWage: boolean;
  wageOverride: boolean;
  customDailyWage: string;
  logo: string | null;
}

export const CVGenerationModal = ({ isOpen, onClose, profileData, parsedData }: CVGenerationModalProps) => {
  const [cvOptions, setCvOptions] = useState<CVOptions>({
    hideName: false,
    hideEmail: false,
    hideMobile: false,
    hideWage: false,
    wageOverride: false,
    customDailyWage: '',
    logo: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvOptions(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (field: keyof Omit<CVOptions, 'logo' | 'customDailyWage'>, checked: boolean) => {
    setCvOptions(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleCustomWageChange = (value: string) => {
    setCvOptions(prev => ({
      ...prev,
      customDailyWage: value
    }));
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Create the PDF document
      const pdfDocument = <CVPDFDocument 
        profileData={profileData}
        parsedData={parsedData}
        options={cvOptions}
      />;

      // Generate the PDF blob
      const blob = await pdf(pdfDocument).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${profileData.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBackToOptions = () => {
    setShowPreview(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate CV for {profileData.full_name}</span>
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Logo Upload Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Logo</span>
                    </Button>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {cvOptions.logo && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={cvOptions.logo} 
                          alt="Logo preview" 
                          className="h-8 w-8 object-contain rounded"
                        />
                        <span className="text-sm text-green-600">Logo uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Options */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Privacy Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hideName"
                        checked={cvOptions.hideName}
                        onCheckedChange={(checked) => handleCheckboxChange('hideName', checked as boolean)}
                      />
                      <Label htmlFor="hideName">Hide Name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hideEmail"
                        checked={cvOptions.hideEmail}
                        onCheckedChange={(checked) => handleCheckboxChange('hideEmail', checked as boolean)}
                      />
                      <Label htmlFor="hideEmail">Hide Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hideMobile"
                        checked={cvOptions.hideMobile}
                        onCheckedChange={(checked) => handleCheckboxChange('hideMobile', checked as boolean)}
                      />
                      <Label htmlFor="hideMobile">Hide Mobile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hideWage"
                        checked={cvOptions.hideWage}
                        onCheckedChange={(checked) => handleCheckboxChange('hideWage', checked as boolean)}
                      />
                      <Label htmlFor="hideWage">Hide Wage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wageOverride"
                        checked={cvOptions.wageOverride}
                        onCheckedChange={(checked) => handleCheckboxChange('wageOverride', checked as boolean)}
                      />
                      <Label htmlFor="wageOverride">Wage Override</Label>
                    </div>
                  </div>
                  {cvOptions.wageOverride && (
                    <div className="mt-4">
                      <Label htmlFor="customDailyWage" className="text-sm font-medium">
                        Custom Daily Wage
                      </Label>
                      <Input
                        id="customDailyWage"
                        type="text"
                        placeholder="100.000 HUF/day"
                        value={cvOptions.customDailyWage}
                        onChange={(e) => handleCustomWageChange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handlePreview}>
                  Preview CV
                </Button>
                <Button onClick={generatePDF} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate & Download PDF'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview Section */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleBackToOptions}>
                ← Back to Options
              </Button>
              <Button onClick={generatePDF} disabled={isGenerating} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
              </Button>
            </div>

            {/* CV Preview - HTML version for preview */}
            <div className="border rounded-lg p-4 bg-white" style={{ minHeight: '800px' }}>
              <div ref={cvRef}>
                <CVDocument
                  profileData={profileData}
                  parsedData={parsedData}
                  options={cvOptions}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};