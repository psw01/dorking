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
  notes?: string;
  bookmarked?: boolean; // Added for bookmark feature
};

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

// Default enabled search engines
const DEFAULT_ENABLED_ENGINES = ['google', 'yandex'];

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
    supportsFiletype: true,
    useAdvancedFormatting: true,
    includeDomainFormatter: `function formatYandexDomain(domain) {
  // Remove protocol and www if present
  let cleanDomain = domain.replace(/^(https?:\\/\\/)?((www|web)\\.)?/, '');
  
  // Handle wildcard domains
  if (cleanDomain.startsWith('*.')) {
    cleanDomain = cleanDomain.substring(2);
  }
  
  // Split by dots and reverse
  const parts = cleanDomain.split('.');
  const reversed = parts.reverse().join('.');
  
  return 'rhost:' + reversed;
}`
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

// Get custom search engines
export const getCustomSearchEngines = (): SearchEngine[] => {
  try {
    const customEngines = localStorage.getItem('dorking_custom_engines');
    return customEngines ? JSON.parse(customEngines) : [];
  } catch (error) {
    console.error('Error loading custom search engines:', error);
    return [];
  }
};

// Add a custom search engine
export const addSearchEngine = (engine: SearchEngine): void => {
  const customEngines = getCustomSearchEngines();
  customEngines.push(engine);
  localStorage.setItem('dorking_custom_engines', JSON.stringify(customEngines));
};

// Remove a custom search engine
export const removeSearchEngine = (engineId: string): void => {
  const customEngines = getCustomSearchEngines();
  const updatedEngines = customEngines.filter(engine => engine.id !== engineId);
  localStorage.setItem('dorking_custom_engines', JSON.stringify(updatedEngines));
  
  // Also remove from enabled engines
  const enabledEngines = getEnabledSearchEngines();
  if (enabledEngines.includes(engineId)) {
    toggleSearchEngine(engineId, false);
  }
};

// Toggle a search engine on/off
export const toggleSearchEngine = (engineId: string, enabled: boolean): void => {
  const enabledEngines = getEnabledSearchEngines();
  
  let updatedEnabledEngines: string[];
  
  if (enabled && !enabledEngines.includes(engineId)) {
    updatedEnabledEngines = [...enabledEngines, engineId];
  } else if (!enabled && enabledEngines.includes(engineId)) {
    updatedEnabledEngines = enabledEngines.filter(id => id !== engineId);
  } else {
    // No change needed
    return;
  }
  
  localStorage.setItem('dorking_enabled_engines', JSON.stringify(updatedEnabledEngines));
};

// Get enabled search engines
export const getEnabledSearchEngines = (): string[] => {
  try {
    const enabledEngines = localStorage.getItem('dorking_enabled_engines');
    if (enabledEngines) {
      return JSON.parse(enabledEngines);
    }
    
    // If not set yet, initialize with default enabled engines
    localStorage.setItem('dorking_enabled_engines', JSON.stringify(DEFAULT_ENABLED_ENGINES));
    return DEFAULT_ENABLED_ENGINES;
  } catch (error) {
    console.error('Error loading enabled search engines:', error);
    return DEFAULT_ENABLED_ENGINES;
  }
};

// Get all search engines (default + custom)
export const getAllSearchEngines = (): SearchEngine[] => {
  const customEngines = getCustomSearchEngines();
  return [...SEARCH_ENGINES, ...customEngines];
};

export const getEngineConfigurations = (): Record<string, EngineConfiguration> => {
  try {
    const configs = localStorage.getItem('dorking_engine_configs');
    return configs ? JSON.parse(configs) : DEFAULT_ENGINE_CONFIGS;
  } catch (error) {
    console.error('Error loading engine configurations:', error);
    return DEFAULT_ENGINE_CONFIGS;
  }
};

export const saveEngineConfigurations = (configs: Record<string, EngineConfiguration>): void => {
  localStorage.setItem('dorking_engine_configs', JSON.stringify(configs));
};

// Function to safely evaluate a formatter function
export const evaluateFormatterFunction = (formatterCode: string, input: string): string => {
  try {
    // Create a safe function that takes the input
    // eslint-disable-next-line no-new-func
    const formatterFn = new Function('input', `
      "use strict";
      // The formatter function
      ${formatterCode}
      
      // Extract the actual function name by finding the function keyword
      const functionMatch = ${JSON.stringify(formatterCode)}.match(/function\\s+([\\w_$]+)\\s*\\(/);
      if (!functionMatch) {
        // If no named function, assume it's an anonymous function or arrow function
        return (${formatterCode})(input);
      }
      
      // Call the named function with the input
      const functionName = functionMatch[1];
      return eval(functionName)(input);
    `);
    
    return formatterFn(input) || input;
  } catch (error) {
    console.error('Error evaluating formatter function:', error);
    // Return the original input if there's an error
    return input;
  }
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

  // Apply query formatter if available
  if (engineConfig.useAdvancedFormatting && engineConfig.queryFormatter) {
    searchQuery = evaluateFormatterFunction(engineConfig.queryFormatter, searchQuery);
  }

  // Add domain scoping
  if (includeDomains.length > 0 && engineConfig.includeSyntax) {
    const includeTerms = includeDomains
      .filter(domain => domain.trim() !== '')
      .map(domain => {
        // If advanced formatting is enabled and a formatter is provided, use it
        if (engineConfig.useAdvancedFormatting && engineConfig.includeDomainFormatter) {
          const formattedDomain = evaluateFormatterFunction(engineConfig.includeDomainFormatter, domain);
          return formattedDomain;
        }
        // Otherwise use the standard syntax
        return engineConfig.includeSyntax.replace('$domain', domain);
      });
    
    searchQuery += ' ' + includeTerms.join(' OR ');
  }

  // Add domain exclusion if supported
  if (excludeDomains.length > 0 && engineConfig.supportsExcludeDomains && engineConfig.excludeSyntax) {
    const excludeTerms = excludeDomains
      .filter(domain => domain.trim() !== '')
      .map(domain => {
        // If advanced formatting is enabled and a formatter is provided, use it
        if (engineConfig.useAdvancedFormatting && engineConfig.excludeDomainFormatter) {
          const formattedDomain = evaluateFormatterFunction(engineConfig.excludeDomainFormatter, domain);
          return formattedDomain;
        }
        // Otherwise use the standard syntax
        return engineConfig.excludeSyntax.replace('$domain', domain);
      });
    
    searchQuery += ' ' + excludeTerms.join(' ');
  }

  return engine.url + encodeURIComponent(searchQuery);
};

export const saveSearchHistory = (item: SearchHistoryItem): void => {
  const history = getSearchHistory();
  history.unshift(item);
  localStorage.setItem('dorking_search_history', JSON.stringify(history));
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  const history = localStorage.getItem('dorking_search_history');
  return history ? JSON.parse(history) : [];
};

export const updateSearchStatus = (id: string, status: SearchStatus): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, status } : item
  );
  localStorage.setItem('dorking_search_history', JSON.stringify(updatedHistory));
};

export const updateSearchTags = (id: string, tags: string[]): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, tags } : item
  );
  localStorage.setItem('dorking_search_history', JSON.stringify(updatedHistory));
};

export const updateSearchNotes = (id: string, notes: string): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, notes } : item
  );
  localStorage.setItem('dorking_search_history', JSON.stringify(updatedHistory));
};

export const toggleBookmark = (id: string): void => {
  const history = getSearchHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
  );
  localStorage.setItem('dorking_search_history', JSON.stringify(updatedHistory));
};

export const deleteSearchItem = (id: string): void => {
  const history = getSearchHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem('dorking_search_history', JSON.stringify(updatedHistory));
};

export const getTags = (): Tag[] => {
  const tags = localStorage.getItem('dorking_search_tags');
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
  
  localStorage.setItem('dorking_search_tags', JSON.stringify(tags));
};

export const deleteTag = (id: string): void => {
  const tags = getTags();
  const updatedTags = tags.filter(tag => tag.id !== id);
  localStorage.setItem('dorking_search_tags', JSON.stringify(updatedTags));
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Export and Import functionality
export const exportAppData = (): string => {
  const data = {
    version: '1.1', // Updated version for advanced formatters
    timestamp: Date.now(),
    searchHistory: getSearchHistory(),
    tags: getTags(),
    engineConfigs: getEngineConfigurations(),
    customEngines: getCustomSearchEngines()
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
    
    localStorage.setItem('dorking_search_history', JSON.stringify(data.searchHistory));
    localStorage.setItem('dorking_search_tags', JSON.stringify(data.tags));
    
    if (data.engineConfigs) {
      localStorage.setItem('dorking_engine_configs', JSON.stringify(data.engineConfigs));
    }
    
    if (data.customEngines) {
      localStorage.setItem('dorking_custom_engines', JSON.stringify(data.customEngines));
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
