'use client';

/**
 * QuotePanel Component - Slide-over panel for quote management
 * Implements User Story 2: Crear Cotización con Múltiples Ítems
 * Implements User Story 3: Guardar Cotización con Snapshot de Precios
 * Implements User Story 4: Generar PDF Descargable
 * 
 * Follows Constitution V: No stacked modals - uses slide-over panel
 */

import { useState } from 'react';
import type { Product } from '@cotishama/shared/types/product';
import type { Quotation } from '@cotishama/shared/types/quotation';
import { QuoteItemCard } from './QuoteItemCard';
import { QuoteSummary } from './QuoteSummary';
import { downloadPDF } from '../services/pdf_api';

interface QuotePanelProps {
  quote: Quotation | null;
  onQuoteCreated: (quote: Quotation) => void;
  onGeneratePDF: () => void;
  onReset: () => void;
}

export function QuotePanel({ quote, onQuoteCreated, onGeneratePDF, onReset }: QuotePanelProps) {
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; productName: string; quantity: number; unitPrice: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = (product: Product) => {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      setItems(items.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems([
        ...items,
        { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter((i) => i.productId !== productId));
    } else {
      setItems(items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
    }
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleCreateQuote = async () => {
    if (!clientName.trim()) {
      setError('El nombre del cliente es requerido');
      return;
    }
    if (items.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onQuoteCreated(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Error al crear la cotización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!quote) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotations/${quote.id}/save`, { method: 'PUT' });
      const data = await response.json();
      if (data.success) {
        onQuoteCreated(data.data);
      }
    } catch (err) {
      setError('Error al guardar la cotización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quote) return;

    try {
      await downloadPDF(quote.id);
      onGeneratePDF();
    } catch (err) {
      setError('Error al descargar el PDF');
    }
  };

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Revisar Cotización</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {!quote ? (
        // Creating new quote
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Productos en la Cotización
            </label>
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay productos agregados</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <QuoteItemCard
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={(qty) => handleUpdateQuantity(item.productId, qty)}
                    onRemove={() => handleRemoveItem(item.productId)}
                  />
                ))}
              </div>
            )}
          </div>

          <QuoteSummary total={total} />

          <button
            onClick={handleCreateQuote}
            disabled={isLoading || items.length === 0}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isLoading ? 'Creando...' : 'Crear Cotización'}
          </button>
        </div>
      ) : (
        // Existing quote
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900">{quote.clientName}</p>
              <p className="text-sm text-gray-500">
                Estado: {quote.status === 'draft' ? 'Borrador' : 'Guardada'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {quote.items.map((item) => (
              <QuoteItemCard
                key={item.id}
                item={{
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                }}
                onUpdateQuantity={() => {}}
                onRemove={() => {}}
                readOnly
              />
            ))}
          </div>

          <QuoteSummary total={quote.total} />

          {quote.status === 'draft' && (
            <button
              onClick={handleSaveQuote}
              disabled={isLoading}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cotización'}
            </button>
          )}

          {quote.status === 'saved' && (
            <button
              onClick={handleDownloadPDF}
              className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Descargar PDF
            </button>
          )}

          <button
            onClick={onReset}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Nueva Cotización
          </button>
        </div>
      )}
    </div>
  );
}