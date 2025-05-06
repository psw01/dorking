
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { File, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { importAppData } from '@/utils/searchUtils';
import { useToast } from '@/hooks/use-toast';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleImport = () => {
    try {
      const success = importAppData(importData);
      
      if (success) {
        setImportStatus('success');
        toast({
          title: "Import successful",
          description: "Your data has been imported successfully."
        });
        onSuccess();
        setImportData('');
        setTimeout(() => {
          onClose();
          setImportStatus('idle');
        }, 1500);
      } else {
        setImportStatus('error');
        toast({
          title: "Import failed",
          description: "The data format appears to be invalid.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setImportStatus('error');
      toast({
        title: "Import failed",
        description: "There was an error importing your data.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Import Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {importStatus === 'success' ? (
            <Alert className="bg-green-500/20 border-green-500/50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Import successful! Refreshing data...
              </AlertDescription>
            </Alert>
          ) : importStatus === 'error' ? (
            <Alert className="bg-red-500/20 border-red-500/50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription>
                Failed to import data. Please check the format and try again.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="importFile" className="text-sm font-medium">
              Select Export File
            </Label>
            <div className="flex items-center">
              <input
                id="importFile"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('importFile')?.click()}
                className="mr-2"
              >
                <File className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                {importData ? "File selected" : "No file selected"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="importData" className="text-sm font-medium">
              Or Paste JSON Data
            </Label>
            <Textarea
              id="importData"
              placeholder='{"version":"1.0","searchHistory":[...]}'
              className="font-mono text-xs h-[200px]"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            className="bg-cyber-purple hover:bg-cyber-purple/90"
            disabled={!importData || importStatus === 'success'}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
