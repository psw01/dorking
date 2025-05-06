
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Settings, Save, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  SEARCH_ENGINES, 
  SearchEngine, 
  saveEngineConfigurations,
  getEngineConfigurations,
  addSearchEngine,
  removeSearchEngine,
  getCustomSearchEngines
} from '@/utils/searchUtils';

interface EngineConfigurationProps {
  engine: SearchEngine;
  configuration: EngineConfiguration;
  onChange: (engineId: string, config: EngineConfiguration) => void;
  onRemove?: (engineId: string) => void;
  isCustom?: boolean;
}

export interface EngineConfiguration {
  includeSyntax: string;
  excludeSyntax: string;
  fileSyntax: string;
  supportsExcludeDomains: boolean;
  supportsFiletype: boolean;
}

const defaultEngineConfig: EngineConfiguration = {
  includeSyntax: 'site:$domain',
  excludeSyntax: '-site:$domain',
  fileSyntax: 'filetype:$type',
  supportsExcludeDomains: true,
  supportsFiletype: true
};

const EngineConfigurationPanel: React.FC<EngineConfigurationProps> = ({ 
  engine, 
  configuration, 
  onChange, 
  onRemove,
  isCustom 
}) => {
  const handleChange = (key: keyof EngineConfiguration, value: string | boolean) => {
    onChange(engine.id, { 
      ...configuration, 
      [key]: value 
    });
  };

  return (
    <div className="space-y-4 py-2 border-b border-border last:border-0 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-mono">{engine.icon}</span>
          <h3 className="text-lg font-medium">{engine.name}</h3>
        </div>
        
        {isCustom && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(engine.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${engine.id}-include`}>Include Domain Syntax</Label>
        <Input 
          id={`${engine.id}-include`}
          value={configuration.includeSyntax} 
          onChange={(e) => handleChange('includeSyntax', e.target.value)}
          placeholder="e.g., site:$domain"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">Use $domain as placeholder for the domain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${engine.id}-exclude`}>Exclude Domain Syntax</Label>
            <Switch
              id={`${engine.id}-supports-exclude`}
              checked={configuration.supportsExcludeDomains}
              onCheckedChange={(checked) => handleChange('supportsExcludeDomains', checked)}
            />
          </div>
          <Input 
            id={`${engine.id}-exclude`}
            value={configuration.excludeSyntax} 
            onChange={(e) => handleChange('excludeSyntax', e.target.value)}
            placeholder="e.g., -site:$domain"
            className="font-mono"
            disabled={!configuration.supportsExcludeDomains}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${engine.id}-file`}>File Type Syntax</Label>
            <Switch
              id={`${engine.id}-supports-file`}
              checked={configuration.supportsFiletype}
              onCheckedChange={(checked) => handleChange('supportsFiletype', checked)}
            />
          </div>
          <Input 
            id={`${engine.id}-file`}
            value={configuration.fileSyntax} 
            onChange={(e) => handleChange('fileSyntax', e.target.value)}
            placeholder="e.g., filetype:$type"
            className="font-mono"
            disabled={!configuration.supportsFiletype}
          />
        </div>
      </div>
    </div>
  );
};

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('engines');
  const [configurations, setConfigurations] = useState<Record<string, EngineConfiguration>>({});
  const [customEngines, setCustomEngines] = useState<SearchEngine[]>([]);
  const [newEngine, setNewEngine] = useState<SearchEngine>({
    id: '',
    name: '',
    url: '',
    icon: '🔍'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load saved configurations
      const savedConfigs = getEngineConfigurations();
      
      // Get custom engines
      const customEngines = getCustomSearchEngines();
      setCustomEngines(customEngines);
      
      // Create default configurations for engines that don't have saved configs
      const defaultConfigs: Record<string, EngineConfiguration> = {};
      const allEngines = [...SEARCH_ENGINES, ...customEngines];
      
      allEngines.forEach(engine => {
        defaultConfigs[engine.id] = savedConfigs[engine.id] || { ...defaultEngineConfig };
      });
      
      setConfigurations(defaultConfigs);
      
      // Reset new engine form
      setNewEngine({
        id: '',
        name: '',
        url: '',
        icon: '🔍'
      });
    }
  }, [isOpen]);

  const handleEngineConfigChange = (engineId: string, config: EngineConfiguration) => {
    const updatedConfigs = {
      ...configurations,
      [engineId]: config
    };
    
    setConfigurations(updatedConfigs);
    
    // Apply changes immediately
    saveEngineConfigurations(updatedConfigs);
    window.dispatchEvent(new Event('storage-updated'));
  };

  const handleSave = () => {
    saveEngineConfigurations(configurations);
    toast({
      title: "Settings saved",
      description: "Your search engine configurations have been saved."
    });
    onClose();
    window.dispatchEvent(new Event('storage-updated'));
  };

  const handleAddEngine = () => {
    // Validation
    if (!newEngine.id || !newEngine.name || !newEngine.url) {
      toast({
        title: "Validation Error",
        description: "Engine ID, Name, and URL are required.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if ID already exists
    const allEngines = [...SEARCH_ENGINES, ...customEngines];
    if (allEngines.some(e => e.id === newEngine.id)) {
      toast({
        title: "Duplicate ID",
        description: "An engine with this ID already exists.",
        variant: "destructive"
      });
      return;
    }
    
    // Format URL (ensure it ends with proper structure for query)
    let formattedUrl = newEngine.url;
    if (!formattedUrl.includes('?')) {
      formattedUrl += '?q=';
    } else if (!formattedUrl.endsWith('=')) {
      formattedUrl += '=';
    }
    
    // Add the engine
    const engineToAdd = {
      ...newEngine,
      url: formattedUrl
    };
    
    addSearchEngine(engineToAdd);
    
    // Add default configuration
    const updatedConfigs = {
      ...configurations,
      [engineToAdd.id]: { ...defaultEngineConfig }
    };
    setConfigurations(updatedConfigs);
    saveEngineConfigurations(updatedConfigs);
    
    // Update local state
    setCustomEngines([...customEngines, engineToAdd]);
    
    // Reset form
    setNewEngine({
      id: '',
      name: '',
      url: '',
      icon: '🔍'
    });
    
    // Update UI immediately
    window.dispatchEvent(new Event('storage-updated'));
    
    toast({
      title: "Search Engine Added",
      description: `${engineToAdd.name} has been added to your search engines.`
    });
  };

  const handleRemoveEngine = (engineId: string) => {
    removeSearchEngine(engineId);
    
    // Update local state
    setCustomEngines(customEngines.filter(engine => engine.id !== engineId));
    
    // Remove from configurations
    const updatedConfigs = { ...configurations };
    delete updatedConfigs[engineId];
    setConfigurations(updatedConfigs);
    saveEngineConfigurations(updatedConfigs);
    
    // Update UI immediately
    window.dispatchEvent(new Event('storage-updated'));
    
    toast({
      title: "Search Engine Removed",
      description: "The search engine has been removed."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Settings className="mr-2 h-5 w-5" />
            Dorking Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-auto mb-4 grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="engines">Search Engines</TabsTrigger>
            <TabsTrigger value="add">Add Engine</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="engines" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(60vh-120px)]">
              <div className="space-y-4 p-2">
                <h3 className="font-semibold text-lg">Default Search Engines</h3>
                {SEARCH_ENGINES.map((engine) => (
                  <EngineConfigurationPanel 
                    key={engine.id}
                    engine={engine}
                    configuration={configurations[engine.id] || defaultEngineConfig}
                    onChange={handleEngineConfigChange}
                  />
                ))}
                
                {customEngines.length > 0 && (
                  <>
                    <h3 className="font-semibold text-lg pt-4">Custom Search Engines</h3>
                    {customEngines.map((engine) => (
                      <EngineConfigurationPanel 
                        key={engine.id}
                        engine={engine}
                        configuration={configurations[engine.id] || defaultEngineConfig}
                        onChange={handleEngineConfigChange}
                        onRemove={handleRemoveEngine}
                        isCustom
                      />
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="add" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(60vh-120px)]">
              <div className="space-y-4 p-2">
                <h3 className="font-semibold text-lg">Add New Search Engine</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="engine-id">Engine ID</Label>
                      <Input
                        id="engine-id"
                        placeholder="e.g., brave"
                        value={newEngine.id}
                        onChange={(e) => setNewEngine({...newEngine, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">Unique identifier (lowercase, no spaces)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="engine-name">Engine Name</Label>
                      <Input
                        id="engine-name"
                        placeholder="e.g., Brave Search"
                        value={newEngine.name}
                        onChange={(e) => setNewEngine({...newEngine, name: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">Display name for the search engine</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="engine-url">Search URL</Label>
                    <Input
                      id="engine-url"
                      placeholder="e.g., https://search.brave.com/search?q="
                      value={newEngine.url}
                      onChange={(e) => setNewEngine({...newEngine, url: e.target.value})}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">URL with query parameter (must end with ? or =)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="engine-icon">Icon (Emoji)</Label>
                    <Input
                      id="engine-icon"
                      placeholder="e.g., 🦁"
                      value={newEngine.icon}
                      onChange={(e) => setNewEngine({...newEngine, icon: e.target.value})}
                      maxLength={2}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Use a single emoji as the icon</p>
                  </div>
                  
                  <Button 
                    onClick={handleAddEngine}
                    className="bg-cyber-teal hover:bg-cyber-teal/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Search Engine
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="about" className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About Dorking</h3>
              <p>Dorking is an advanced search dork generator that helps you create powerful search queries for various search engines.</p>
              <p className="text-sm text-muted-foreground">Version 1.2.0</p>
              
              <div className="pt-4">
                <h4 className="font-medium">Syntax Help:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1 pt-2">
                  <li><span className="font-mono">$domain</span> - Placeholder for domain in include/exclude syntax</li>
                  <li><span className="font-mono">$type</span> - Placeholder for file type in file type syntax</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-cyber-teal hover:bg-cyber-teal/90">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
