
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Settings, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEARCH_ENGINES, SearchEngine, saveEngineConfigurations, getEngineConfigurations } from '@/utils/searchUtils';

interface EngineConfigurationProps {
  engine: SearchEngine;
  configuration: EngineConfiguration;
  onChange: (engineId: string, config: EngineConfiguration) => void;
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

const EngineConfigurationPanel: React.FC<EngineConfigurationProps> = ({ engine, configuration, onChange }) => {
  const handleChange = (key: keyof EngineConfiguration, value: string | boolean) => {
    onChange(engine.id, { 
      ...configuration, 
      [key]: value 
    });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center space-x-4">
        <span className="text-lg font-mono">{engine.icon}</span>
        <h3 className="text-lg font-medium">{engine.name}</h3>
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

      <div className="grid grid-cols-2 gap-4">
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
  const { toast } = useToast();

  useEffect(() => {
    // Load saved configurations
    const savedConfigs = getEngineConfigurations();
    
    // Create default configurations for engines that don't have saved configs
    const defaultConfigs: Record<string, EngineConfiguration> = {};
    SEARCH_ENGINES.forEach(engine => {
      defaultConfigs[engine.id] = savedConfigs[engine.id] || { ...defaultEngineConfig };
    });
    
    setConfigurations(defaultConfigs);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Settings className="mr-2 h-5 w-5" />
            DorkMaster Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-auto mb-4">
            <TabsTrigger value="engines">Search Engine Configuration</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="engines" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(60vh-120px)]">
              <div className="space-y-6 p-2">
                {SEARCH_ENGINES.map((engine) => (
                  <EngineConfigurationPanel 
                    key={engine.id}
                    engine={engine}
                    configuration={configurations[engine.id] || defaultEngineConfig}
                    onChange={handleEngineConfigChange}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="about" className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About DorkMaster</h3>
              <p>DorkMaster is an advanced search dork generator that helps you create powerful search queries for various search engines.</p>
              <p className="text-sm text-muted-foreground">Version 1.1.0</p>
              
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
