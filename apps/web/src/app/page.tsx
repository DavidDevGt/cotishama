'use client';

/**
 * Main page for the Cotizaciones System
 * Implements User Story 5: Interfaz Simple con Pocos Pasos
 * 
 * 3-step flow: Search Products → Review Quote → Generate PDF
 */

import { useState } from 'react';
import { ProductSearchInput } from '../components/ProductSearchInput';
import { SearchResultsList } from '../components/SearchResultsList';
import { QuotePanel } from '../components/QuotePanel';
import { StepIndicator } from '../components/StepIndicator';
import { QuoteHistory } from '../components/QuoteHistory';
import type { Product } from '@cotishama/shared/types/product';
import type { Quotation } from '@cotishama/shared/types/quotation';

type Step = 'search' | 'review' | 'pdf';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quotation | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.products);
      } else {
        console.error('Search error:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToQuote = (product: Product) => {
    setCurrentStep('review');
    // The QuotePanel component will handle the actual add operation
  };

  const handleQuoteCreated = (quote: Quotation) => {
    setCurrentQuote(quote);
    setCurrentStep('review');
  };

  const handleGeneratePDF = () => {
    setCurrentStep('pdf');
  };

  const handleReset = () => {
    setCurrentStep('search');
    setSearchResults([]);
    setCurrentQuote(null);
  };

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={currentStep} />

      {currentStep === 'search' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Buscar Productos</h2>
          <p className="text-gray-600">
            Escribe el nombre del producto. La búsqueda tolera errores tipográficos.
          </p>
          <ProductSearchInput onSearch={handleSearch} isSearching={isSearching} />
          <SearchResultsList products={searchResults} onAddToQuote={handleAddToQuote} />
        </div>
      )}

      {currentStep === 'review' && (
        <QuotePanel
          quote={currentQuote}
          onQuoteCreated={handleQuoteCreated}
          onGeneratePDF={handleGeneratePDF}
          onReset={handleReset}
        />
      )}

      {currentStep === 'pdf' && currentQuote && (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Cotización Generada</h2>
          <p className="text-gray-600">
            Tu PDF ha sido generado exitosamente.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Nueva Cotización
            </button>
          </div>
        </div>
      )}

      <QuoteHistory />
    </div>
  );
}