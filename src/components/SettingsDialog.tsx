
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Settings, Save, Trash2, Plus, ToggleLeft, ToggleRight, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  SEARCH_ENGINES, 
  SearchEngine, 
  saveEngineConfigurations,
  getEngineConfigurations,
  addSearchEngine,
  removeSearchEngine,
  getCustomSearchEngines,
  toggleSearchEngine,
  getEnabledSearchEngines,
  evaluateFormatterFunction
} from '@/utils/searchUtils';

interface EngineConfigurationProps {
  engine: SearchEngine;
  configuration: EngineConfiguration;
  onChange: (engineId: string, config: EngineConfiguration) => void;
  onRemove?: (engineId: string) => void;
  isCustom?: boolean;
  isEnabled: boolean;
  onToggle: (engineId: string, enabled: boolean) => void;
}

export interface EngineConfiguration {
  includeSyntax: string;
  excludeSyntax: string;
  fileSyntax: string;
  supportsExcludeDomains: boolean;
  supportsFiletype: boolean;
  useAdvancedFormatting?: boolean;
  includeDomainFormatter?: string;
  excludeDomainFormatter?: string;
  queryFormatter?: string;
}

const defaultEngineConfig: EngineConfiguration = {
  includeSyntax: 'site:$domain',
  excludeSyntax: '-site:$domain',
  fileSyntax: 'filetype:$type',
  supportsExcludeDomains: true,
  supportsFiletype: true,
  useAdvancedFormatting: false
};

const defaultFormatterFunction = `function formatDomain(domain) {
  // Your custom formatter logic here
  // Example: return a modified version of the domain
  return domain;
}`;

const EngineConfigurationPanel: React.FC<EngineConfigurationProps> = ({ 
  engine, 
  configuration, 
  onChange, 
  onRemove,
  isCustom,
  isEnabled,
  onToggle
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testDomain, setTestDomain] = useState('example.com');
  const [testResult, setTestResult] = useState('');
  
  const handleChange = (key: keyof EngineConfiguration, value: string | boolean) => {
    onChange(engine.id, { 
      ...configuration, 
      [key]: value 
    });
  };
  
  const handleTestFormatter = (formatterCode: string) => {
    if (!testDomain.trim()) return;
    
    try {
      const result = evaluateFormatterFunction(formatterCode, testDomain);
      setTestResult(result);
    } catch (error) {
      setTestResult(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-4 py-2 border-b border-border last:border-0 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-mono">{engine.icon}</span>
          <h3 className="text-lg font-medium">{engine.name}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(engine.id, !isEnabled)}
            className={isEnabled ? "text-cyber-teal" : "text-muted-foreground"}
          >
            {isEnabled ? (
              <ToggleRight className="h-5 w-5 mr-1" />
            ) : (
              <ToggleLeft className="h-5 w-5 mr-1" />
            )}
            {isEnabled ? "Enabled" : "Disabled"}
          </Button>
        
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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${engine.id}-advanced`}>Advanced Formatting</Label>
          <Switch
            id={`${engine.id}-advanced`}
            checked={!!configuration.useAdvancedFormatting}
            onCheckedChange={(checked) => {
              handleChange('useAdvancedFormatting', checked);
              setShowAdvanced(checked);
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle to use custom JavaScript functions for formatting search queries
        </p>
      </div>

      {!configuration.useAdvancedFormatting && (
        <>
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
        </>
      )}

      {configuration.useAdvancedFormatting && (
        <div className="space-y-4 border-t border-border pt-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${engine.id}-include-formatter`}>Domain Include Formatter</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestFormatter(configuration.includeDomainFormatter || defaultFormatterFunction)}
              >
                <Code className="h-4 w-4 mr-1" />
                Test
              </Button>
            </div>
            <Textarea 
              id={`${engine.id}-include-formatter`}
              value={configuration.includeDomainFormatter || defaultFormatterFunction}
              onChange={(e) => handleChange('includeDomainFormatter', e.target.value)}
              placeholder={defaultFormatterFunction}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Write a function that takes a domain as input and returns a formatted string.
            </p>
          </div>
          
          {configuration.supportsExcludeDomains && (
            <div className="space-y-2">
              <Label htmlFor={`${engine.id}-exclude-formatter`}>Domain Exclude Formatter</Label>
              <Textarea 
                id={`${engine.id}-exclude-formatter`}
                value={configuration.excludeDomainFormatter || defaultFormatterFunction}
                onChange={(e) => handleChange('excludeDomainFormatter', e.target.value)}
                placeholder={defaultFormatterFunction}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Write a function that takes a domain as input and returns a formatted string for exclusion.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor={`${engine.id}-query-formatter`}>Query Formatter (Optional)</Label>
            <Textarea 
              id={`${engine.id}-query-formatter`}
              value={configuration.queryFormatter || ''}
              onChange={(e) => handleChange('queryFormatter', e.target.value)}
              placeholder="function formatQuery(query) {\n  // Modify the query if needed\n  return query;\n}"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Optional function to format the main search query.
            </p>
          </div>
          
          <div className="space-y-2 mt-4 border border-border rounded-md p-4">
            <Label htmlFor={`${engine.id}-test-domain`}>Test Domain Formatter</Label>
            <div className="flex space-x-2">
              <Input 
                id={`${engine.id}-test-domain`}
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                placeholder="example.com"
                className="font-mono"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleTestFormatter(configuration.includeDomainFormatter || defaultFormatterFunction)}
              >
                Test
              </Button>
            </div>
            {testResult && (
              <div className="mt-2">
                <Label>Result:</Label>
                <div className="mt-1 p-2 bg-black/10 rounded-md font-mono text-sm overflow-auto break-all">
                  {testResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
  const [enabledEngines, setEnabledEngines] = useState<string[]>([]);
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
      
      // Get enabled engines
      const enabledEngines = getEnabledSearchEngines();
      setEnabledEngines(enabledEngines);
      
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
    setConfigurations(prev => ({
      ...prev,
      [engineId]: config
    }));
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

  const handleToggleEngine = (engineId: string, enabled: boolean) => {
    // Update the enabled state in local storage
    toggleSearchEngine(engineId, enabled);
    
    // Update local state to reflect the changes
    if (enabled) {
      setEnabledEngines(prev => [...prev, engineId]);
    } else {
      setEnabledEngines(prev => prev.filter(id => id !== engineId));
    }
    
    toast({
      title: enabled ? "Engine enabled" : "Engine disabled",
      description: `Search engine ${enabled ? 'enabled' : 'disabled'} successfully.`
    });
    
    // Dispatch an event to update other components
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
    setConfigurations(prev => ({
      ...prev,
      [engineToAdd.id]: { ...defaultEngineConfig }
    }));
    
    // Update local state
    setCustomEngines(prev => [...prev, engineToAdd]);

    // Enable the new engine by default
    handleToggleEngine(engineToAdd.id, true);
    
    // Reset form
    setNewEngine({
      id: '',
      name: '',
      url: '',
      icon: '🔍'
    });
    
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
    
    // Remove from enabled engines too
    if (enabledEngines.includes(engineId)) {
      setEnabledEngines(prev => prev.filter(id => id !== engineId));
    }
    
    toast({
      title: "Search Engine Removed",
      description: "The search engine has been removed."
    });
    
    window.dispatchEvent(new Event('storage-updated'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Settings className="mr-2 h-5 w-5" />
            Search Engine Settings
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
                    isEnabled={enabledEngines.includes(engine.id)}
                    onToggle={handleToggleEngine}
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
                        isEnabled={enabledEngines.includes(engine.id)}
                        onToggle={handleToggleEngine}
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
              <h3 className="text-lg font-semibold">About Advanced Search</h3>
              <p>This tool helps you create powerful search queries for various search engines with custom formatting.</p>
              
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium">Advanced Formatting</h4>
                <p className="mt-2 text-sm">Each search engine can use custom JavaScript functions to format domains and queries differently:</p>
                
                <div className="mt-2 space-y-2">
                  <div>
                    <h5 className="font-medium text-sm">Domain Include Formatter</h5>
                    <p className="text-xs text-muted-foreground">
                      This function formats domains for inclusion in search. For example, Yandex requires domains in reverse order.
                    </p>
                    <pre className="text-xs bg-black/10 p-2 rounded-md mt-1 overflow-x-auto">
                      {`function formatYandexDomain(domain) {
  // Clean domain from protocols and www
  let cleanDomain = domain.replace(/^(https?:\\/\\/)?((www|web)\\.)?/, '');
  
  // Handle wildcard domains
  if (cleanDomain.startsWith('*.')) {
    cleanDomain = cleanDomain.substring(2);
  }
  
  // Split by dots and reverse
  const parts = cleanDomain.split('.');
  const reversed = parts.reverse().join('.');
  
  return 'rhost:' + reversed;
}`}
                    </pre>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">Version 1.3.0</p>
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
