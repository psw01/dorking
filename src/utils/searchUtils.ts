
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
};

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

export const buildSearchUrl = (
  engine: SearchEngine,
  query: string,
  includeDomains: string[],
  excludeDomains: string[]
): string => {
  let searchQuery = query.trim();

  // Add domain scoping
  if (includeDomains.length > 0) {
    searchQuery += ' ' + includeDomains.map(domain => `site:${domain}`).join(' OR ');
  }

  // Add domain exclusion
  if (excludeDomains.length > 0) {
    searchQuery += ' ' + excludeDomains.map(domain => `-site:${domain}`).join(' ');
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
