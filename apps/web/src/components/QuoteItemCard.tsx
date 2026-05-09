'use client';

/**
 * QuoteItemCard Component
 * Displays a single item in a quotation with quantity controls
 */

interface QuoteItemCardProps {
  item: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

export function QuoteItemCard({ item, onUpdateQuantity, onRemove, readOnly = false }: QuoteItemCardProps) {
  const subtotal = item.quantity * item.unitPrice;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.productName}</p>
        <p className="text-sm text-gray-500">Q{item.unitPrice.toFixed(2)} c/u</p>
      </div>

      {!readOnly && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100"
          >
            -
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100"
          >
            +
          </button>
        </div>
      )}

      {readOnly && (
        <div className="text-gray-500 mx-4">x{item.quantity}</div>
      )}

      <div className="text-right w-20">
        <p className="font-medium text-gray-900">Q{subtotal.toFixed(2)}</p>
      </div>

      {!readOnly && (
        <button
          onClick={onRemove}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
}