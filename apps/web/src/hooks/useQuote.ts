'use client';

/**
 * useQuote Hook
 * Implements optimistic updates for quote management
 * Follows Constitution III: Optimistic UI
 */

import { useState, useCallback } from 'react';
import type { Quotation, CreateQuotationRequest } from '@cotishama/shared/types/quotation';

export function useQuote() {
  const [quote, setQuote] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuote = useCallback(async (data: CreateQuotationRequest): Promise<Quotation | null> => {
    setIsLoading(true);
    setError(null);

    // Optimistic update would go here in a full implementation
    // For now, we just wait for the server response

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setQuote(result.data);
        return result.data;
      } else {
        setError(result.error.message);
        return null;
      }
    } catch (err) {
      setError('Error al crear la cotización');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveQuote = useCallback(async (quotationId: string): Promise<Quotation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${quotationId}/save`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        setQuote(result.data);
        return result.data;
      } else {
        setError(result.error.message);
        return null;
      }
    } catch (err) {
      setError('Error al guardar la cotización');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    quote,
    isLoading,
    error,
    createQuote,
    saveQuote,
    reset,
  };
}