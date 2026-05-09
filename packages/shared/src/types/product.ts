/**
 * Product type definitions for the Sistema de Cotizaciones
 */

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  category: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSearchParams {
  q: string;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
}