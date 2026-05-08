import { pgTable, serial, integer, numeric, varchar, timestamp } from "drizzle-orm/pg-core";
import { quotes } from "./quotes";
import { products } from "./products";

export const quoteDetails = pgTable("quote_details", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id")
    .references(() => quotes.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 5, scale: 2 }).default("0"),
  notes: varchar("notes", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type QuoteDetail = typeof quoteDetails.$inferSelect;
export type InsertQuoteDetail = typeof quoteDetails.$inferInsert;
