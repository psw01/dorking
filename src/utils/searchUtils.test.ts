import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildSearchUrl,
  evaluateFormatterFunction,
  getSearchAsFormState,
  SearchEngine,
  SearchHistoryItem,
  EngineConfiguration,
  DEFAULT_ENGINE_CONFIGS, // Import if needed for direct access
  SEARCH_ENGINES, // Import to get engine definitions
} from './searchUtils';

// Mock localStorage for tests if functions directly use it and it's not setup elsewhere
// For these tests, we'll primarily rely on DEFAULT_ENGINE_CONFIGS for predictability
// or ensure functions like getEngineConfigurations are stable.

describe('searchUtils', () => {
  // --- buildSearchUrl Tests ---
  describe('buildSearchUrl', () => {
    const googleEngine = SEARCH_ENGINES.find(e => e.id === 'google')!;
    const baiduEngine = SEARCH_ENGINES.find(e => e.id === 'baidu')!; // Baidu supports filetype but let's find one that doesn't or modify one for test

    // For a non-filetype supporting engine, let's create a mock or use one.
    // For simplicity, let's assume 'baidu' can be temporarily considered non-supporting for a test case
    // by overriding its config locally if needed, or find an actual non-supporting one if available.
    // The current DEFAULT_ENGINE_CONFIGS show most support filetype.
    // Let's simulate one:
    const mockNonFiletypeEngine: SearchEngine = {
      id: 'noFiletypeSupportEngine',
      name: 'NoFiletype',
      url: 'https://example.com/search?q=',
      icon: '🚫',
    };
    // And its configuration (assuming getEngineConfigurations would return this for mockNonFiletypeEngine)
    const mockNonFiletypeConfig: EngineConfiguration = {
      ...DEFAULT_ENGINE_CONFIGS.google, // Base on google for other syntaxes
      supportsFiletype: false,
      fileSyntax: '', // No filetype syntax
    };
    
    // Mock getEngineConfigurations to control configurations during tests
    vi.mock('./searchUtils', async (importOriginal) => {
        const original = await importOriginal() as typeof import('./searchUtils');
        return {
            ...original,
            getEngineConfigurations: vi.fn(() => ({
                ...original.DEFAULT_ENGINE_CONFIGS,
                [mockNonFiletypeEngine.id]: mockNonFiletypeConfig,
            })),
        };
    });


    it('should add filetype to query for supporting engines (Google)', () => {
      const url = buildSearchUrl(googleEngine, 'test query', [], [], 'pdf');
      expect(url).toContain('filetype:pdf');
    });

    it('should NOT add filetype to query for non-supporting engines', () => {
      const url = buildSearchUrl(mockNonFiletypeEngine, 'test query', [], [], 'pdf');
      expect(url).not.toContain('filetype:pdf');
      expect(url).not.toContain('pdf'); // Check it's not just adding the word pdf
    });

    it('should NOT add filetype query if fileType string is empty', () => {
      const url = buildSearchUrl(googleEngine, 'test query', [], [], '');
      expect(url).not.toContain('filetype:');
    });

    it('should NOT add filetype query if fileType string is undefined', () => {
      const url = buildSearchUrl(googleEngine, 'test query', [], []); // fileType is undefined
      expect(url).not.toContain('filetype:');
    });
  });

  // --- Yandex includeDomainFormatter Tests (via evaluateFormatterFunction) ---
  describe('Yandex includeDomainFormatter', () => {
    const yandexConfig = DEFAULT_ENGINE_CONFIGS.yandex;
    const yandexFormatter = yandexConfig.includeDomainFormatter!;

    const testCases = [
      { input: 'example.com', expected: 'rhost:com.example.*' },
      { input: 'www.example.com', expected: 'rhost:com.example.*' },
      { input: 'https://example.com', expected: 'rhost:com.example.*' },
      { input: '*.example.com', expected: 'rhost:com.example.*' },
      { input: 'sub.example.com', expected: 'rhost:com.example.sub.*' },
      { input: 'another.sub.example.com', expected: 'rhost:com.example.sub.another.*' },
      { input: 'example.*', expected: 'site:example' },
      { input: 'another.example.*', expected: 'site:another.example' },
      { input: 'https_www.google.com', expected: 'rhost:com.google.https_www.*' }, // Based on current cleaning
      { input: 'website.co.uk', expected: 'rhost:uk.co.website.*' },
      { input: '*.website.co.uk', expected: 'rhost:uk.co.website.*' },
      { input: 'website.co.uk.*', expected: 'site:website.co.uk' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should format "${input}" to "${expected}"`, () => {
        const result = evaluateFormatterFunction(yandexFormatter, input);
        expect(result).toBe(expected);
      });
    });
  });

  // --- getSearchAsFormState Tests ---
  describe('getSearchAsFormState', () => {
    const baseHistoryItem: SearchHistoryItem = {
      id: '1',
      query: 'test query',
      timestamp: Date.now(),
      engines: ['google'],
      includeDomains: ['example.com'],
      excludeDomains: ['baddomain.com'],
      status: 'pending',
      tags: [],
    };

    it('should include fileType if present in history item', () => {
      const historyItemWithFileType: SearchHistoryItem = {
        ...baseHistoryItem,
        fileType: 'pdf',
      };
      const formState = getSearchAsFormState(historyItemWithFileType);
      expect(formState.fileType).toBe('pdf');
    });

    it('should return empty string for fileType if not present in history item', () => {
      const historyItemWithoutFileType: SearchHistoryItem = {
        ...baseHistoryItem,
        // fileType is undefined
      };
      const formState = getSearchAsFormState(historyItemWithoutFileType);
      expect(formState.fileType).toBe('');
    });
    
    it('should handle empty include/exclude domains correctly', () => {
      const historyItemNoDomains: SearchHistoryItem = {
        ...baseHistoryItem,
        includeDomains: [],
        excludeDomains: [],
      };
      const formState = getSearchAsFormState(historyItemNoDomains);
      expect(formState.includeDomains).toEqual(['']); // Should provide one empty string for the input field
      expect(formState.excludeDomains).toEqual(['']); // Should provide one empty string for the input field
    });

     it('should map include/exclude domains correctly if present', () => {
      const historyItemWithDomains: SearchHistoryItem = {
        ...baseHistoryItem,
        includeDomains: ["site1.com", "site2.com"],
        excludeDomains: ["exsite1.com"],
      };
      const formState = getSearchAsFormState(historyItemWithDomains);
      expect(formState.includeDomains).toEqual(["site1.com", "site2.com"]);
      expect(formState.excludeDomains).toEqual(["exsite1.com"]);
    });
  });
});
