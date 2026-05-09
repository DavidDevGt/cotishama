'use client';

/**
 * SearchResultsList Component
 * Displays search results from fuzzy search
 */

import type { Product } from '@cotishama/shared/types/product';

interface SearchResultsListProps {
  products: Product[];
  onAddToQuote: (product: Product) => void;
}

export function SearchResultsList({ products, onAddToQuote }: SearchResultsListProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">
        {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
      </h3>
      <div className="grid gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
          >
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">
                {product.code} • {product.category}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-green-600">
                Q{product.price.toFixed(2)}
              </span>
              <button
                onClick={() => onAddToQuote(product)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}