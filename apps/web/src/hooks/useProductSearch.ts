'use client';

/**
 * useProductSearch Hook
 * Implements debounced search with fuzzy matching
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@cotishama/shared/types/product';

interface UseProductSearchOptions {
  debounceMs?: number;
}

export function useProductSearch(options: UseProductSearchOptions = {}) {
  const { debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.products);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, search, debounceMs]);

  return {
    query,
    setQuery,
    results,
    isLoading,
  };
}