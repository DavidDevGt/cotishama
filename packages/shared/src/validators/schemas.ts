/**
 * Zod Validation Schemas
 * Shared between backend and frontend
 */

import { z } from "zod";

// ===== COMMON VALIDATORS =====

export const EmailSchema = z.string().email("Email inválido").toLowerCase().trim();

export const PhoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Teléfono inválido")
  .optional();

export const URLSchema = z.string().url("URL inválida").optional();

export const PositiveNumberSchema = z.number().int().positive("Debe ser un número positivo");

export const DecimalSchema = z.number().positive("Debe ser un número positivo");

// ===== AUTH SCHEMAS =====

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z
    .string()
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

export type Login = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Token requerido"),
});

// ===== QUOTE SCHEMAS =====

export const QuoteDetailInputSchema = z.object({
  product_id: z.string().uuid("Product ID inválido"),
  quantity: PositiveNumberSchema,
});

export const CreateQuoteSchema = z.object({
  client_id: z.string().uuid("Client ID inválido"),
  details: z.array(QuoteDetailInputSchema).min(1, "Debe agregar al menos un producto"),
  notes: z.string().optional(),
  valid_until: z.string().datetime().optional(),
});

export type CreateQuote = z.infer<typeof CreateQuoteSchema>;

export const UpdateQuoteSchema = z.object({
  notes: z.string().optional(),
  valid_until: z.string().datetime().optional(),
});

export type UpdateQuote = z.infer<typeof UpdateQuoteSchema>;

export const ChangeQuoteStatusSchema = z.object({
  new_status: z.enum(["draft", "sent", "approved", "rejected", "cancelled", "expired"]),
  reason: z.string().optional(),
});

export type ChangeQuoteStatus = z.infer<typeof ChangeQuoteStatusSchema>;

// ===== CLIENT SCHEMAS =====

export const CreateClientSchema = z.object({
  business_name: z.string().min(1, "Nombre de empresa requerido").max(255),
  contact_name: z.string().min(1, "Nombre de contacto requerido").max(255),
  email: EmailSchema.optional(),
  phone: PhoneSchema,
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  tax_id: z.string().max(50).optional(),
});

export type CreateClient = z.infer<typeof CreateClientSchema>;

export const UpdateClientSchema = CreateClientSchema.partial();

export type UpdateClient = z.infer<typeof UpdateClientSchema>;

// ===== PRODUCT SCHEMAS =====

export const CreateProductSchema = z.object({
  sku: z
    .string()
    .min(1, "SKU requerido")
    .max(50, "SKU muy largo")
    .regex(/^[A-Z0-9-]+$/, "SKU inválido"),
  name: z.string().min(1, "Nombre requerido").max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  unit_price: DecimalSchema.min(0.01, "Precio debe ser mayor a 0"),
  min_stock: PositiveNumberSchema.default(5).optional(),
  max_stock: PositiveNumberSchema.default(999).optional(),
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export const AdjustStockSchema = z.object({
  quantity: z.number().int(),
  operation: z.enum(["set", "add", "subtract"]),
  reason: z.string().optional(),
});

export type AdjustStock = z.infer<typeof AdjustStockSchema>;

// ===== FILTER SCHEMAS =====

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

export const QuoteFiltersSchema = PaginationSchema.extend({
  status: z.enum(["draft", "sent", "approved", "rejected", "cancelled", "expired"]).optional(),
  client_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  sort: z.enum(["created_at", "total", "status"]).optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
});

export type QuoteFilters = z.infer<typeof QuoteFiltersSchema>;

export const ClientFiltersSchema = PaginationSchema.extend({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type ClientFilters = z.infer<typeof ClientFiltersSchema>;

export const ProductFiltersSchema = PaginationSchema.extend({
  category: z.string().optional(),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  show_low_stock: z.boolean().optional(),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
