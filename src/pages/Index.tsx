
import React, { useState } from 'react';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import SearchHistory from '@/components/SearchHistory';
import TagsManager from '@/components/TagsManager';
import { SearchHistoryItem } from '@/utils/searchUtils';

type ActiveTab = 'search' | 'history' | 'tags';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [preloadedSearch, setPreloadedSearch] = useState<SearchHistoryItem | undefined>();
  
  const handleLoadSearch = (search: SearchHistoryItem) => {
    setPreloadedSearch(search);
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header 
          activeTab={activeTab} 
          onTabChange={(value) => setActiveTab(value as ActiveTab)} 
        />
        
        <main>
          {activeTab === 'search' && <SearchForm preloadedSearch={preloadedSearch} />}
          {activeTab === 'history' && <SearchHistory onLoadSearch={handleLoadSearch} />}
          {activeTab === 'tags' && <TagsManager />}
        </main>
      </div>
    </div>
  );
};

export default Index;
