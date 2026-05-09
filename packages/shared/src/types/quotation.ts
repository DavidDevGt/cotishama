/**
 * Quotation type definitions for the Sistema de Cotizaciones
 */

export type QuotationStatus = 'draft' | 'saved' | 'void';

export interface PriceSnapshotItem {
  productId: string;
  productName: string;
  unitPrice: number;
}

export interface PriceSnapshot {
  createdAt: string;
  items: PriceSnapshotItem[];
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  clientName: string;
  clientAddress?: string;
  status: QuotationStatus;
  items: QuotationItem[];
  total: number;
  pricesSnapshot: PriceSnapshot;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateQuotationRequest {
  clientName: string;
  clientAddress?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  observations?: string;
}

export interface UpdateQuotationItemsRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface QuotationListParams {
  status?: QuotationStatus;
  limit?: number;
  offset?: number;
}

export interface QuotationListResponse {
  quotations: Quotation[];
  total: number;
  limit: number;
  offset: number;
}