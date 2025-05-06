
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  SearchHistoryItem as HistoryItemType,
  getSearchHistory, 
  updateSearchStatus,
  updateSearchTags,
  deleteSearchItem,
  SEARCH_ENGINES,
  getTags,
  buildSearchUrl,
} from '@/utils/searchUtils';
import { 
  Search, 
  Clock, 
  CheckSquare, 
  Trash2, 
  Tag,
  ExternalLink,
  FileText,
  Edit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import TagsDialog from './TagsDialog';
import NotesDialog from './NotesDialog';
import { formatDistanceToNow } from 'date-fns';

interface SearchHistoryProps {
  onLoadSearch?: (search: HistoryItemType) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onLoadSearch }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([]);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemTags, setSelectedItemTags] = useState<string[]>([]);
  const [selectedItemNotes, setSelectedItemNotes] = useState<string>('');
  const { toast } = useToast();
  const allTags = getTags();

  useEffect(() => {
    setHistoryItems(getSearchHistory());

    // Set up listener for storage changes
    const handleStorageChange = () => {
      setHistoryItems(getSearchHistory());
    };

    window.addEventListener('storage-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage-updated', handleStorageChange);
    };
  }, []);

  const handleStatusToggle = (id: string, currentStatus: 'pending' | 'complete') => {
    const newStatus = currentStatus === 'pending' ? 'complete' : 'pending';
    updateSearchStatus(id, newStatus);
    
    // Update local state
    setHistoryItems(prev => 
      prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
    );
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage-updated'));
    
    toast({
      title: "Status Updated",
      description: `Search marked as ${newStatus}`,
    });
  };

  const handleDelete = (id: string) => {
    deleteSearchItem(id);
    
    // Update local state
    setHistoryItems(prev => prev.filter(item => item.id !== id));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage-updated'));
    
    toast({
      title: "Search Deleted",
      description: "Search item has been removed from history",
    });
  };

  const handleRepeatSearch = (item: HistoryItemType) => {
    item.engines.forEach(engineId => {
      const engine = SEARCH_ENGINES.find(e => e.id === engineId);
      if (engine) {
        const searchUrl = buildSearchUrl(
          engine,
          item.query,
          item.includeDomains,
          item.excludeDomains
        );
        window.open(searchUrl, '_blank');
      }
    });
    
    toast({
      title: "Search Repeated",
      description: `Opened ${item.engines.length} search tabs`,
    });
  };

  const openTagsDialog = (item: HistoryItemType) => {
    setSelectedItemId(item.id);
    setSelectedItemTags(item.tags || []);
    setIsTagsDialogOpen(true);
  };

  const openNotesDialog = (item: HistoryItemType) => {
    setSelectedItemId(item.id);
    setSelectedItemNotes(item.notes || '');
    setIsNotesDialogOpen(true);
  };

  const handleTagsUpdate = (tags: string[]) => {
    if (selectedItemId) {
      updateSearchTags(selectedItemId, tags);
      
      // Update local state
      setHistoryItems(prev => 
        prev.map(item => item.id === selectedItemId ? { ...item, tags } : item)
      );
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage-updated'));
      
      toast({
        title: "Tags Updated",
        description: "Search tags have been updated",
      });
    }
    setIsTagsDialogOpen(false);
  };

  const handleLoadSearch = (item: HistoryItemType) => {
    if (onLoadSearch) {
      onLoadSearch(item);
      
      toast({
        title: "Search Loaded",
        description: "Search has been loaded to the form",
      });
    }
  };

  if (historyItems.length === 0) {
    return (
      <Card className="cyber-card p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-2 opacity-70" />
        <h3 className="text-lg font-mono mb-2">No Search History</h3>
        <p className="text-muted-foreground">
          Your search history will appear here once you perform searches.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-mono mb-2 flex items-center">
        <Clock className="mr-2 h-5 w-5" /> Search History
      </h2>

      <div className="space-y-4">
        {historyItems.map((item) => (
          <Card key={item.id} className={`cyber-card overflow-hidden transition-all duration-300 ${
            item.status === 'complete' ? 'border-cyber-success/30' : 'border-cyber-warning/30'
          }`}>
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 pb-2">
                <div className="flex flex-col">
                  <h3 className="text-lg font-mono font-semibold break-all">
                    {item.query}
                  </h3>
                  <div className="flex flex-wrap text-xs text-muted-foreground mt-1">
                    <span className="mr-3 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                    
                    <span className="flex items-center">
                      <Search className="h-3 w-3 mr-1" />
                      {item.engines.length} {item.engines.length === 1 ? 'engine' : 'engines'}
                    </span>
                    
                    {item.notes && (
                      <span className="ml-3 flex items-center">
                        <FileText className="h-3 w-3 mr-1 text-cyber-teal" />
                        Has notes
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                  {onLoadSearch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadSearch(item)}
                      className="text-cyber-blue border-cyber-blue/30 h-8"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRepeatSearch(item)}
                    className="text-cyber-teal border-cyber-teal/30 h-8"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Repeat
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusToggle(item.id, item.status)}
                    className={`h-8 border-${item.status === 'complete' ? 'cyber-success' : 'cyber-warning'}/30`}
                  >
                    <CheckSquare className={`h-4 w-4 mr-1 ${
                      item.status === 'complete' ? 'text-cyber-success' : 'text-cyber-warning'
                    }`} />
                    {item.status === 'complete' ? 'Completed' : 'Pending'}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openTagsDialog(item)}>
                        Manage Tags
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openNotesDialog(item)}
                    className="h-8 w-8"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="px-4 pb-2">
                {/* Tags */}
                <div className="flex flex-wrap mb-2">
                  {item.tags && item.tags.length > 0 ? (
                    item.tags.map((tagId) => {
                      const tag = allTags.find(t => t.id === tagId);
                      return tag ? (
                        <Badge 
                          key={tag.id} 
                          className={`mr-1 mb-1 ${tag.color}`}
                        >
                          {tag.name}
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No tags</span>
                  )}
                </div>
              </div>
              
              {(item.includeDomains.length > 0 || item.excludeDomains.length > 0) && (
                <div className="px-4 pb-3 text-xs">
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.includeDomains.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Including:</span>
                        <div className="font-mono mt-1">
                          {item.includeDomains.map((domain, i) => (
                            <Badge key={`inc-${i}`} variant="secondary" className="mr-1 mb-1">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.excludeDomains.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Excluding:</span>
                        <div className="font-mono mt-1">
                          {item.excludeDomains.map((domain, i) => (
                            <Badge key={`exc-${i}`} variant="secondary" className="mr-1 mb-1">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show notes preview if exists */}
              {item.notes && (
                <div className="px-4 pb-3">
                  <Separator className="my-2" />
                  <div className="text-xs">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="font-mono mt-1 whitespace-pre-wrap line-clamp-2">
                      {item.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <TagsDialog 
        isOpen={isTagsDialogOpen}
        onClose={() => setIsTagsDialogOpen(false)}
        selectedTags={selectedItemTags}
        onSave={handleTagsUpdate}
      />
      
      <NotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => setIsNotesDialogOpen(false)}
        searchId={selectedItemId || ''}
        initialNotes={selectedItemNotes}
      />
    </div>
  );
};

export default SearchHistory;
