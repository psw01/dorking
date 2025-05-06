
import React from 'react';
import { Database, Tag, History, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col space-y-2 mb-8">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-cyber-teal via-cyber-blue to-cyber-purple opacity-30"></div>
          <h1 className="relative text-4xl font-bold font-mono text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-teal via-cyber-blue to-cyber-purple animate-pulse-subtle">
              DorkMaster
            </span>
          </h1>
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
    </div>
  );
};

export default Header;
