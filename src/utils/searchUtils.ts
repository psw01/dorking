
export type SearchEngine = {
  id: string;
  name: string;
  url: string;
  icon: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type SearchStatus = 'pending' | 'complete';

export type SearchHistoryItem = {
  id: string;
  query: string;
  timestamp: number;
  engines: string[];
  includeDomains: string[];
  excludeDomains: string[];
  status: SearchStatus;
  tags: string[];
  notes?: string; // Added notes field
};

export interface EngineConfiguration {
  includeSyntax: string;
  excludeSyntax: string;
  fileSyntax: string;
  supportsExcludeDomains: boolean;
  supportsFiletype: boolean;
}

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '🔍'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: '🦆'
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: '🔎'
  },
  {
    id: 'yandex',
    name: 'Yandex',
    url: 'https://yandex.com/search/?text=',
    icon: '🌐'
  },
  {
    id: 'baidu',
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    icon: '🇨🇳'
  },
  {
    id: 'startpage',
    name: 'Startpage',
    url: 'https://www.startpage.com/do/search?q=',
    icon: '🔒'
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    icon: '📦'
  },
];

export const DEFAULT_TAGS: Tag[] = [
  { id: 'osint', name: 'OSINT', color: 'bg-cyber-teal' },
  { id: 'security', name: 'Security', color: 'bg-cyber-purple' }, 
  { id: 'personal', name: 'Personal', color: 'bg-cyber-blue' },
  { id: 'work', name: 'Work', color: 'bg-cyber-success' }
];

// Default engine configurations
const DEFAULT_ENGINE_CONFIGS: Record<string, EngineConfiguration> = {
  google: {
    includeSyntax: 'site:$domain',
    excludeSyntax: '-site:$domain',
    fileSyntax: 'filetype:$type',
    supportsExcludeDomains: true,
    supportsFiletype: true
  },
  duckduckgo: {
    includeSyntax: 'site:$domain',
    excludeSyntax: '-site:$domain',
    fileSyntax: 'filetype:$type',
    supportsExcludeDomains: true,
    supportsFiletype: true
  },
  bing: {
    includeSyntax: 'site:$domain',
    excludeSyntax: '-site:$domain',
    fileSyntax: 'filetype:$type',
    supportsExcludeDomains: true,
    supportsFiletype: true
  },
  yandex: {
    includeSyntax: 'site:$domain',
    excludeSyntax: '',
    fileSyntax: 'mime:$type',
    supportsExcludeDomains: false,
    supportsFiletype: true
  },
  baidu: {
    includeSyntax: 'site:$domain',
    excludeSyntax: '',
    fileSyntax: 'filetype:$type',
    supportsExcludeDomains: false,
    supportsFiletype: true
  },
  startpage: {
    includeSyntax: 'site:$domain',
    excludeSyntax: '-site:$domain',
    fileSyntax: 'filetype:$type',
    supportsExcludeDomains: true,
    supportsFiletype: true
  },
  github: {
    includeSyntax: 'repo:$domain',
    excludeSyntax: '-repo:$domain',
    fileSyntax: 'language:$type',
    supportsExcludeDomains: true,
    supportsFiletype: true
  }
};

export const getEngineConfigurations = (): Record<string, EngineConfiguration> => {
  try {
    const configs = localStorage.getItem('dork_engine_configs');
    return configs ? JSON.parse(configs) : DEFAULT_ENGINE_CONFIGS;
  } catch (error) {
    console.error('Error loading engine configurations:', error);
    return DEFAULT_ENGINE_CONFIGS;
  }
};

export const saveEngineConfigurations = (configs: Record<string, EngineConfiguration>): void => {
  localStorage.setItem('dork_engine_configs', JSON.stringify(configs));
};

export const buildSearchUrl = (
  engine: SearchEngine,
  query: string,
  includeDomains: string[],
  excludeDomains: string[]
): string => {
  let searchQuery = query.trim();
  const configs = getEngineConfigurations();
  const engineConfig = configs[engine.id] || DEFAULT_ENGINE_CONFIGS[engine.id];

  // Add domain scoping
  if (includeDomains.length > 0 && engineConfig.includeSyntax) {
    const includeTerms = includeDomains
      .filter(domain => domain.trim() !== '')
      .map(domain => engineConfig.includeSyntax.replace('$domain', domain));
    
    searchQuery += ' ' + includeTerms.join(' OR ');
  }

  // Add domain exclusion if supported
  if (excludeDomains.length > 0 && engineConfig.supportsExcludeDomains && engineConfig.excludeSyntax) {
    const excludeTerms = excludeDomains
      .filter(domain => domain.trim() !== '')
      .map(domain => engineConfig.excludeSyntax.replace('$domain', domain));
    
    searchQuery += ' ' + excludeTerms.join(' ');
  }

  return engine.url + encodeURIComponent(searchQuery);
};

export const saveSearchHistory = (item: SearchHistoryItem): void => {
  const history = getSearchHistory();
  history.unshift(item);
  localStorage.setItem('dork_search_history', JSON.stringify(history));
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  const history = localStorage.getItem('dork_search_history');
  return history ? JSON.parse(history) : [];
};

export const updateSearchStatus = (id: string, status: SearchStatus): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, status } : item
  );
  localStorage.setItem('dork_search_history', JSON.stringify(updatedHistory));
};

export const updateSearchTags = (id: string, tags: string[]): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, tags } : item
  );
  localStorage.setItem('dork_search_history', JSON.stringify(updatedHistory));
};

export const updateSearchNotes = (id: string, notes: string): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, notes } : item
  );
  localStorage.setItem('dork_search_history', JSON.stringify(updatedHistory));
};

export const deleteSearchItem = (id: string): void => {
  const history = getSearchHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem('dork_search_history', JSON.stringify(updatedHistory));
};

export const getTags = (): Tag[] => {
  const tags = localStorage.getItem('dork_search_tags');
  return tags ? JSON.parse(tags) : DEFAULT_TAGS;
};

export const saveTag = (tag: Tag): void => {
  const tags = getTags();
  const existingTagIndex = tags.findIndex(t => t.id === tag.id);
  
  if (existingTagIndex >= 0) {
    tags[existingTagIndex] = tag;
  } else {
    tags.push(tag);
  }
  
  localStorage.setItem('dork_search_tags', JSON.stringify(tags));
};

export const deleteTag = (id: string): void => {
  const tags = getTags();
  const updatedTags = tags.filter(tag => tag.id !== id);
  localStorage.setItem('dork_search_tags', JSON.stringify(updatedTags));
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Export and Import functionality
export const exportAppData = (): string => {
  const data = {
    version: '1.0',
    timestamp: Date.now(),
    searchHistory: getSearchHistory(),
    tags: getTags(),
    engineConfigs: getEngineConfigurations()
  };
  
  return JSON.stringify(data, null, 2);
};

export const importAppData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate imported data
    if (!data.searchHistory || !data.tags) {
      return false;
    }
    
    localStorage.setItem('dork_search_history', JSON.stringify(data.searchHistory));
    localStorage.setItem('dork_search_tags', JSON.stringify(data.tags));
    
    if (data.engineConfigs) {
      localStorage.setItem('dork_engine_configs', JSON.stringify(data.engineConfigs));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Load search into form
export const getSearchAsFormState = (item: SearchHistoryItem) => {
  return {
    query: item.query,
    engines: item.engines,
    includeDomains: item.includeDomains.length > 0 ? item.includeDomains : [''],
    excludeDomains: item.excludeDomains.length > 0 ? item.excludeDomains : [''],
  };
};
