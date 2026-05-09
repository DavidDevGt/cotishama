'use client';

/**
 * ProductSearchInput Component
 * Implements User Story 1: Búsqueda de Productos con Tolerancia a Errores
 */

import { useState, useEffect } from 'react';

interface ProductSearchInputProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export function ProductSearchInput({ onSearch, isSearching }: ProductSearchInputProps) {
  const [query, setQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos (ej: tornillo, llave, etc.)"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSearching}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
      <p className="mt-2 text-sm text-gray-500">
        La búsqueda tolera errores tipográficos. Prueba "tornilo", "blnca", o "drmañ"
      </p>
    </div>
  );
}