
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tag as TagIcon, Plus, X } from 'lucide-react';
import { getTags, saveTag, deleteTag, Tag, generateId } from '@/utils/searchUtils';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface TagsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onSave: (tags: string[]) => void;
}

const COLORS = [
  { name: 'Teal', value: 'bg-cyber-teal' },
  { name: 'Blue', value: 'bg-cyber-blue' },
  { name: 'Purple', value: 'bg-cyber-purple' },
  { name: 'Success', value: 'bg-cyber-success' },
  { name: 'Warning', value: 'bg-cyber-warning' },
  { name: 'Danger', value: 'bg-cyber-danger' },
];

const TagsDialog: React.FC<TagsDialogProps> = ({ 
  isOpen, 
  onClose, 
  selectedTags, 
  onSave 
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagMode, setNewTagMode] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-cyber-teal');
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);

  useEffect(() => {
    setTags(getTags());
    setCurrentSelection(selectedTags || []);
  }, [isOpen, selectedTags]);

  const handleTagToggle = (tagId: string) => {
    setCurrentSelection(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSave = () => {
    onSave(currentSelection);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    const newTag: Tag = {
      id: generateId(),
      name: newTagName.trim(),
      color: newTagColor
    };
    
    saveTag(newTag);
    
    // Update local state
    setTags([...tags, newTag]);
    setNewTagName('');
    setNewTagMode(false);
    
    // Add to current selection
    setCurrentSelection([...currentSelection, newTag.id]);
  };

  const handleDeleteTag = (tagId: string) => {
    deleteTag(tagId);
    
    // Remove from current selection
    setCurrentSelection(prev => prev.filter(id => id !== tagId));
    
    // Update local state
    setTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="cyber-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TagIcon className="mr-2 h-5 w-5" />
            Manage Tags
          </DialogTitle>
        </DialogHeader>

        <div className="my-4">
          <ScrollArea className="h-[300px] pr-4">
            {tags.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No tags available. Create one below.
              </div>
            ) : (
              <div className="space-y-2">
                {tags.map(tag => (
                  <div 
                    key={tag.id} 
                    className="flex items-center justify-between rounded-lg border border-muted p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`tag-${tag.id}`}
                        checked={currentSelection.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                        className="cyber-checkbox"
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`}
                        className="cursor-pointer flex items-center"
                      >
                        <Badge className={`mr-2 ${tag.color}`}>{tag.name}</Badge>
                      </Label>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteTag(tag.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator className="my-4" />

          {newTagMode ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-tag-name" className="text-sm">Tag Name</Label>
                <Input
                  id="new-tag-name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="cyber-input mt-1"
                  autoFocus
                />
              </div>
              
              <div>
                <Label className="text-sm">Tag Color</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLORS.map(color => (
                    <Badge 
                      key={color.value}
                      className={`cursor-pointer ${color.value} ${
                        newTagColor === color.value ? 'ring-2 ring-cyber-teal-light' : ''
                      }`}
                      onClick={() => setNewTagColor(color.value)}
                    >
                      {color.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="secondary"
                  onClick={() => setNewTagMode(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="flex-1 bg-cyber-teal hover:bg-cyber-teal-light"
                >
                  Create Tag
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-muted-foreground/50 text-muted-foreground hover:text-foreground"
              onClick={() => setNewTagMode(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Tag
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyber-teal hover:bg-cyber-teal-light">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagsDialog;
