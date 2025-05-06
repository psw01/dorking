
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Search, X, Plus } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { 
  getAllSearchEngines,
  buildSearchUrl, 
  saveSearchHistory, 
  generateId,
  SearchEngine,
  SearchHistoryItem,
  getSearchAsFormState
} from '@/utils/searchUtils';
import { useToast } from '@/hooks/use-toast';

interface SearchFormProps {
  preloadedSearch?: SearchHistoryItem;
}

const SearchForm: React.FC<SearchFormProps> = ({ preloadedSearch }) => {
  const [query, setQuery] = useState<string>('');
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['google', 'yandex']);
  const [includeDomains, setIncludeDomains] = useState<string[]>(['']);
  const [excludeDomains, setExcludeDomains] = useState<string[]>(['']);
  const [availableEngines, setAvailableEngines] = useState<SearchEngine[]>([]);
  const { toast } = useToast();

  // Effect to load all available search engines
  useEffect(() => {
    setAvailableEngines(getAllSearchEngines());
    
    const handleStorageChange = () => {
      setAvailableEngines(getAllSearchEngines());
    };
    
    window.addEventListener('storage-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage-updated', handleStorageChange);
    };
  }, []);

  // Effect to load preloaded search if provided
  useEffect(() => {
    if (preloadedSearch) {
      const formState = getSearchAsFormState(preloadedSearch);
      setQuery(formState.query);
      setSelectedEngines(formState.engines);
      setIncludeDomains(formState.includeDomains);
      setExcludeDomains(formState.excludeDomains);
      
      toast({
        title: "Search loaded",
        description: "Search query has been loaded from history."
      });
    }
  }, [preloadedSearch]);

  const handleAddDomainField = (type: 'include' | 'exclude') => {
    if (type === 'include') {
      setIncludeDomains([...includeDomains, '']);
    } else {
      setExcludeDomains([...excludeDomains, '']);
    }
  };

  const handleRemoveDomainField = (index: number, type: 'include' | 'exclude') => {
    if (type === 'include') {
      const newDomains = [...includeDomains];
      newDomains.splice(index, 1);
      setIncludeDomains(newDomains);
    } else {
      const newDomains = [...excludeDomains];
      newDomains.splice(index, 1);
      setExcludeDomains(newDomains);
    }
  };

  const handleDomainChange = (
    index: number,
    value: string,
    type: 'include' | 'exclude'
  ) => {
    if (type === 'include') {
      const newDomains = [...includeDomains];
      newDomains[index] = value;
      setIncludeDomains(newDomains);
    } else {
      const newDomains = [...excludeDomains];
      newDomains[index] = value;
      setExcludeDomains(newDomains);
    }
  };

  const handleEngineToggle = (engineId: string) => {
    setSelectedEngines(prev => {
      if (prev.includes(engineId)) {
        return prev.filter(id => id !== engineId);
      } else {
        return [...prev, engineId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedEngines.length === 0) {
      toast({
        title: "Search engine required",
        description: "Please select at least one search engine",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty domains
    const filteredIncludeDomains = includeDomains.filter(d => d.trim() !== '');
    const filteredExcludeDomains = excludeDomains.filter(d => d.trim() !== '');

    // Save to history
    const historyItem: SearchHistoryItem = {
      id: generateId(),
      query: query,
      engines: selectedEngines,
      includeDomains: filteredIncludeDomains,
      excludeDomains: filteredExcludeDomains,
      timestamp: Date.now(),
      status: 'pending',
      tags: [],
      notes: '',
      bookmarked: false
    };
    
    saveSearchHistory(historyItem);

    // Open search tabs
    const allEngines = getAllSearchEngines();
    selectedEngines.forEach(engineId => {
      const engine = allEngines.find(e => e.id === engineId);
      if (engine) {
        const searchUrl = buildSearchUrl(
          engine, 
          query, 
          filteredIncludeDomains, 
          filteredExcludeDomains
        );
        window.open(searchUrl, '_blank');
      }
    });

    toast({
      title: "Search initiated",
      description: `Opened ${selectedEngines.length} search tabs`,
    });
  };

  return (
    <Card className="cyber-card mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="query" className="text-lg font-mono mb-2 block">
            Search Query
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="query"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="cyber-input pl-10 font-mono text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-mono mb-2 block">Search Engines</Label>
          <div className="flex flex-wrap gap-2">
            {availableEngines.map((engine) => (
              <Toggle
                key={engine.id}
                pressed={selectedEngines.includes(engine.id)}
                onPressedChange={() => handleEngineToggle(engine.id)}
                className="data-[state=on]:bg-cyber-teal data-[state=on]:text-white border border-input px-3 py-1"
              >
                <span className="mr-1">{engine.icon}</span>
                {engine.name}
              </Toggle>
            ))}
          </div>
        </div>

        <Separator />

        {/* Include Domains Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-mono">Include Domains</Label>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 text-cyber-teal border-cyber-teal/50"
              onClick={() => handleAddDomainField('include')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Domain
            </Button>
          </div>
          
          <div className="space-y-2">
            {includeDomains.map((domain, index) => (
              <div key={`include-${index}`} className="flex items-center space-x-2">
                <Input
                  placeholder="example.com or *.example.com"
                  value={domain}
                  onChange={(e) => handleDomainChange(index, e.target.value, 'include')}
                  className="cyber-input font-mono"
                />
                {includeDomains.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDomainField(index, 'include')}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exclude Domains Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-mono">Exclude Domains</Label>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 text-cyber-teal border-cyber-teal/50"
              onClick={() => handleAddDomainField('exclude')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Domain
            </Button>
          </div>
          
          <div className="space-y-2">
            {excludeDomains.map((domain, index) => (
              <div key={`exclude-${index}`} className="flex items-center space-x-2">
                <Input
                  placeholder="example.com or *.example.com"
                  value={domain}
                  onChange={(e) => handleDomainChange(index, e.target.value, 'exclude')}
                  className="cyber-input font-mono"
                />
                {excludeDomains.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDomainField(index, 'exclude')}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="cyber-button w-full text-lg py-6 group"
            disabled={!query.trim() || selectedEngines.length === 0}
          >
            <Search className="mr-2 h-6 w-6 group-hover:animate-pulse" />
            Execute Search
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SearchForm;
