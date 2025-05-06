
import React, { useState, useEffect } from 'react';
import { Database, Tag, History, Search, Settings, Import, ArrowUpRight, Sun, Moon, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import SettingsDialog from './SettingsDialog';
import ImportDialog from './ImportDialog';
import ThemeSwitcher from './ThemeSwitcher';
import { exportAppData } from '@/utils/searchUtils';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const data = exportAppData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `dorkmaster-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "Export successful",
      description: "Your data has been exported to a file."
    });
  };

  const handleImportSuccess = () => {
    // Trigger storage-updated event to refresh data in components
    window.dispatchEvent(new Event('storage-updated'));
  };

  return (
    <div className="flex flex-col space-y-2 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-cyber-teal via-cyber-blue to-cyber-purple opacity-30"></div>
          <h1 className="relative text-4xl font-bold font-mono text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-teal via-cyber-blue to-cyber-purple animate-pulse-subtle">
              Dorking
            </span>
          </h1>
        </div>
        <div className="flex-1 flex justify-end items-center space-x-1">
          <ThemeSwitcher />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setImportOpen(true)} 
                className="rounded-full w-8 h-8"
              >
                <Import className="h-4 w-4" />
                <span className="sr-only">Import data</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import data</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleExport} 
                className="rounded-full w-8 h-8"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span className="sr-only">Export data</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export data</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSettingsOpen(true)} 
                className="rounded-full w-8 h-8"
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <p className="text-center text-muted-foreground mb-6">
        Advanced Search Engine Dork Generator & History Management
      </p>
      
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="search" className="data-[state=active]:bg-cyber-teal data-[state=active]:text-white">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-cyber-teal data-[state=active]:text-white">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="tags" className="data-[state=active]:bg-cyber-teal data-[state=active]:text-white">
            <Tag className="h-4 w-4 mr-2" />
            Tags
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Dialogs */}
      <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ImportDialog 
        isOpen={importOpen} 
        onClose={() => setImportOpen(false)} 
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default Header;
