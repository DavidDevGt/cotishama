'use client';

/**
 * QuoteHistory Component
 * Displays list of saved quotations
 */

import { useState, useEffect } from 'react';
import type { Quotation } from '@cotishama/shared/types/quotation';

export function QuoteHistory() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      const response = await fetch('/api/quotations?status=saved&limit=10');
      const data = await response.json();
      if (data.success) {
        setQuotations(data.data.quotations);
      }
    } catch (error) {
      console.error('Failed to load quotations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500">Cargando cotizaciones...</div>;
  }

  if (quotations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Cotizaciones Guardadas</h2>
      <div className="space-y-2">
        {quotations.map((quote) => (
          <div
            key={quote.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded hover:border-blue-300"
          >
            <div>
              <p className="font-medium text-gray-900">{quote.clientName}</p>
              <p className="text-sm text-gray-500">
                {new Date(quote.createdAt).toLocaleDateString('es-GT')} • {quote.items.length} productos
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">Q{quote.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Guardada</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}