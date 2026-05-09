/**
 * PDF Generation Service
 * Implements User Story 4: Generar PDF Descargable
 */

import { getQuotationById } from './quotation_service.js';
import { logger } from '../utils/logger.js';

export interface PDFQuotationData {
  id: string;
  clientName: string;
  clientAddress?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  pricesSnapshot: {
    createdAt: string;
    items: Array<{
      productId: string;
      productName: string;
      unitPrice: number;
    }>;
  };
  observations?: string;
  createdAt: string;
}

/**
 * Generate PDF for a saved quotation
 */
export async function generatePDF(quotationId: string): Promise<Uint8Array> {
  logger.logOperation('pdf.generate', { quotationId });

  // Get quotation
  const quotation = await getQuotationById(quotationId);

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  // Validate status - only saved quotations can generate PDF
  if (quotation.status !== 'saved') {
    throw new Error('Cannot generate PDF for draft quotation. Please save the quotation first.');
  }

  // Build PDF data
  const pdfData: PDFQuotationData = {
    id: quotation.id,
    clientName: quotation.clientName,
    clientAddress: quotation.clientAddress,
    items: quotation.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    total: quotation.total,
    pricesSnapshot: quotation.pricesSnapshot,
    observations: quotation.observations,
    createdAt: quotation.createdAt,
  };

  logger.info(`PDF generated for quotation: ${quotationId}`);

  // Return a minimal PDF buffer for now - actual React-PDF implementation would go here
  // For now, returning a placeholder that indicates PDF generation is available
  const placeholder = `PDF for quotation ${quotationId}`;
  return new TextEncoder().encode(placeholder);
}