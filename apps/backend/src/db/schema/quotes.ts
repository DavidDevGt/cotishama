import { pgTable, serial, varchar, text, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { clients } from './clients';

export const quoteStatusEnum = pgEnum('quote_status', [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'ARCHIVED',
]);

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  quoteNumber: varchar('quote_number', { length: 50 }).unique().notNull(),
  clientId: integer('client_id')
    .references(() => clients.id)
    .notNull(),
  createdBy: integer('created_by')
    .references(() => users.id)
    .notNull(),
  status: quoteStatusEnum('status').default('DRAFT').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  notes: text('notes'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 12, scale: 2 }).default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
