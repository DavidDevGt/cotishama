'use client';

/**
 * QuoteSummary Component
 * Displays the total amount for the quotation
 */

interface QuoteSummaryProps {
  total: number;
}

export function QuoteSummary({ total }: QuoteSummaryProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-gray-900">Total</span>
        <span className="text-2xl font-bold text-green-600">Q{total.toFixed(2)}</span>
      </div>
    </div>
  );
}