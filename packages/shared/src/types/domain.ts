/**
 * Domain Entity Types
 * Core business entities
 */

// ===== USER =====

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  is_active: boolean;
}

// ===== CLIENT =====

export interface Client {
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
  last_quote_at?: Date;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ===== PRODUCT =====

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  currency: string;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ===== QUOTE =====

export interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  user_id: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  notes?: string;
  valid_until?: Date;
  sent_at?: Date;
  approved_at?: Date;
  approved_by?: string;
  rejected_at?: Date;
  rejected_by?: string;
  rejection_reason?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ===== QUOTE DETAIL =====

export interface QuoteDetail {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  line_number: number;
  product_name_snapshot?: string;
  created_at: Date;
}

// ===== QUOTE HISTORY =====

export interface QuoteHistory {
  id: string;
  quote_id: string;
  old_status?: string;
  new_status: string;
  changed_by: string;
  reason?: string;
  timestamp: Date;
  ip_address?: string;
}

// ===== AUDIT LOG =====

export interface AuditLog {
  id: number;
  table_name: string;
  record_id?: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  user_id?: string;
  timestamp: Date;
  ip_address?: string;
}

// ===== INVENTORY LOG =====

export interface InventoryLog {
  id: number;
  product_id: string;
  operation: string;
  quantity_change: number;
  old_quantity: number;
  new_quantity: number;
  reason?: string;
  quote_id?: string;
  user_id?: string;
  timestamp: Date;
}

// ===== JWT CLAIMS =====

export interface JWTPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  iat: number;
  exp: number;
}

// ===== CONTEXT =====

export interface AppContext {
  user: UserPublic;
  request_id: string;
  ip_address: string;
  timestamp: Date;
}
