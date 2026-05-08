/**
 * Shared API Types
 * Used by both backend (HonoJS) and frontend (Vanilla JS)
 */

// ===== RESPONSE ENVELOPE =====

export interface APIResponse<T> {
  success: boolean;
  status_code: number;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata: {
    timestamp: string;
    request_id: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ===== AUTH TYPES =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  };
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ===== QUOTE TYPES =====

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export interface QuoteDetailInput {
  product_id: string;
  quantity: number;
}

export interface CreateQuoteRequest {
  client_id: string;
  details: QuoteDetailInput[];
  notes?: string;
  valid_until?: string;
}

export interface UpdateQuoteRequest {
  notes?: string;
  valid_until?: string;
}

export interface ChangeQuoteStatusRequest {
  new_status: QuoteStatus;
  reason?: string;
}

export interface QuoteDetail {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  line_number: number;
}

export interface QuoteResponse {
  id: string;
  quote_number: string;
  client_id: string;
  user_id: string;
  status: QuoteStatus;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  notes?: string;
  valid_until?: string;
  details: QuoteDetail[];
  created_at: string;
  updated_at: string;
  approved_at?: string;
  sent_at?: string;
}

// ===== CLIENT TYPES =====

export interface CreateClientRequest {
  business_name: string;
  contact_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
}

export interface UpdateClientRequest {
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  credit_limit?: number;
}

export interface ClientResponse {
  id: string;
  business_name: string;
  contact_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  credit_limit: number;
  total_quoted: number;
  num_quotes: number;
  last_quote_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== PRODUCT TYPES =====

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  min_stock?: number;
  max_stock?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  unit_price?: number;
  min_stock?: number;
  max_stock?: number;
}

export interface AdjustStockRequest {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== REPORT TYPES =====

export interface QuoteSummary {
  total_quotes: number;
  total_value: number;
  by_status: {
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    cancelled: number;
    expired: number;
  };
}

export interface ClientMetrics {
  total_quotes: number;
  total_value: number;
  avg_quote: number;
  last_quote_at?: string;
  top_products: Array<{
    product_id: string;
    product_name: string;
    times_quoted: number;
    total_quantity: number;
  }>;
}

// ===== FILTER TYPES =====

export interface QuoteFilters {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
  client_id?: string;
  user_id?: string;
  sort?: 'created_at' | 'total' | 'status';
  sort_dir?: 'asc' | 'desc';
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  is_active?: boolean;
  show_low_stock?: boolean;
}
