/**
 * Drizzle ORM Schema for Sistema de Cotizaciones
 * Implements: products, quotations, quotation_items tables
 */

import { pgTable, uuid, varchar, decimal, boolean, timestamp, text, jsonb, integer } from 'drizzle-orm/pg-core';

// Products table
export const products = pgTable('products', {
  id: uuid('id').default({} as any).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Quotations table
export const quotations = pgTable('quotations', {
  id: uuid('id').default({} as any).primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientAddress: varchar('client_address', { length: 500 }),
  status: varchar('status', { length: 20 }).default('draft'),
  pricesSnapshot: jsonb('prices_snapshot').notNull(),
  observations: text('observations'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Quotation Items table
export const quotationItems = pgTable('quotation_items', {
  id: uuid('id').default({} as any).primaryKey(),
  quotationId: uuid('quotation_id').references(() => quotations.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type exports for use throughout the application
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type NewQuotation = typeof quotations.$inferInsert;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type NewQuotationItem = typeof quotationItems.$inferInsert;