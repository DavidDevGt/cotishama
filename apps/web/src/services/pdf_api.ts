/**
 * PDF API Client
 * Handles PDF download functionality
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Download PDF for a saved quotation
 */
export async function downloadPDF(quotationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/quotations/${quotationId}/pdf`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to download PDF');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cotizacion-${quotationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}