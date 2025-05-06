
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tag as TagIcon, Trash2, Edit, Check, X, Save, Plus } from 'lucide-react';
import { getTags, saveTag, deleteTag, Tag } from '@/utils/searchUtils';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { generateId } from '@/utils/searchUtils';

const COLORS = [
  { name: 'Teal', value: 'bg-cyber-teal' },
  { name: 'Blue', value: 'bg-cyber-blue' },
  { name: 'Purple', value: 'bg-cyber-purple' },
  { name: 'Success', value: 'bg-cyber-success' },
  { name: 'Warning', value: 'bg-cyber-warning' },
  { name: 'Danger', value: 'bg-cyber-danger' },
];

const TagsManager: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-cyber-teal');
  const { toast } = useToast();

  useEffect(() => {
    setTags(getTags());
  }, []);

  const handleEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setEditingTagColor(tag.color);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
    setEditingTagColor('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editingTagName.trim()) {
      toast({
        title: "Tag name required",
        description: "Please enter a tag name",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTag: Tag = {
      id,
      name: editingTagName.trim(),
      color: editingTagColor
    };
    
    saveTag(updatedTag);
    
    // Update local state
    setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
    
    setEditingTagId(null);
    setEditingTagName('');
    setEditingTagColor('');
    
    toast({
      title: "Tag Updated",
      description: "Tag has been successfully updated"
    });
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage-updated'));
  };

  const handleDelete = (id: string) => {
    deleteTag(id);
    
    // Update local state
    setTags(prev => prev.filter(tag => tag.id !== id));
    
    toast({
      title: "Tag Deleted",
      description: "Tag has been removed"
    });
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage-updated'));
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Tag name required",
        description: "Please enter a tag name",
        variant: "destructive"
      });
      return;
    }
    
    const newTag: Tag = {
      id: generateId(),
      name: newTagName.trim(),
      color: newTagColor
    };
    
    saveTag(newTag);
    
    // Update local state
    setTags([...tags, newTag]);
    
    setIsAddingTag(false);
    setNewTagName('');
    setNewTagColor('bg-cyber-teal');
    
    toast({
      title: "Tag Created",
      description: "New tag has been added"
    });
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage-updated'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-mono flex items-center">
          <TagIcon className="mr-2 h-5 w-5" /> Manage Tags
        </h2>
        <Button 
          onClick={() => setIsAddingTag(true)}
          className="bg-cyber-teal hover:bg-cyber-teal-light"
          disabled={isAddingTag}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </div>

      <Card className="cyber-card p-4">
        {isAddingTag && (
          <div className="mb-4 p-4 border border-cyber-teal/30 rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-tag-name">Tag Name</Label>
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
                <Label>Tag Color</Label>
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
                  variant="outline" 
                  onClick={() => setIsAddingTag(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTag}
                  disabled={!newTagName.trim()}
                  className="flex-1 bg-cyber-teal hover:bg-cyber-teal-light"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Tag
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <ScrollArea className="h-[400px] pr-4">
          {tags.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <TagIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No tags available</p>
              <p className="text-sm">Create tags to organize your searches</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map(tag => (
                <div 
                  key={tag.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-muted hover:bg-muted/20 transition-colors"
                >
                  {editingTagId === tag.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="cyber-input"
                        autoFocus
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(color => (
                          <Badge 
                            key={color.value}
                            className={`cursor-pointer ${color.value} ${
                              editingTagColor === color.value ? 'ring-2 ring-cyber-teal-light' : ''
                            }`}
                            onClick={() => setEditingTagColor(color.value)}
                          >
                            {color.name}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(tag.id)}
                          disabled={!editingTagName.trim()}
                          className="bg-cyber-teal hover:bg-cyber-teal-light"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Badge className={`mr-2 ${tag.color}`}>{tag.name}</Badge>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(tag)}
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(tag.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default TagsManager;
