import { pgTable, serial, integer, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { quotes } from './quotes';
import { users } from './users';

export const changeTypeEnum = pgEnum('change_type', [
  'CREATED',
  'STATUS_CHANGED',
  'DETAILS_MODIFIED',
  'NOTES_UPDATED',
  'DELETED',
]);

export const quoteHistory = pgTable('quote_history', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id')
    .references(() => quotes.id)
    .notNull(),
  changedBy: integer('changed_by')
    .references(() => users.id)
    .notNull(),
  changeType: changeTypeEnum('change_type').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type QuoteHistory = typeof quoteHistory.$inferSelect;
export type InsertQuoteHistory = typeof quoteHistory.$inferInsert;
