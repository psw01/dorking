
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { FileText, Save } from 'lucide-react';
import { updateSearchNotes } from '@/utils/searchUtils';
import { useToast } from '@/hooks/use-toast';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  searchId: string;
  initialNotes: string;
}

const NotesDialog: React.FC<NotesDialogProps> = ({ 
  isOpen, 
  onClose, 
  searchId, 
  initialNotes 
}) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const { toast } = useToast();

  const handleSave = () => {
    updateSearchNotes(searchId, notes);
    
    toast({
      title: "Notes saved",
      description: "Your notes have been saved for this search."
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Search Notes
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Add your notes here..."
            className="min-h-[150px] font-mono text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyber-teal hover:bg-cyber-teal/90">
            <Save className="mr-2 h-4 w-4" />
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
