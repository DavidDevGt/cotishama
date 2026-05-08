import { eq, and, ilike, gte, lte } from 'drizzle-orm';
import { db } from '../db/client';
import { quotes, quoteDetails, type Quote, type InsertQuote } from '../db/schema';
import type { QuoteDetail, InsertQuoteDetail } from '../db/schema';

export interface QuoteFilters {
  status?: string;
  clientId?: number;
  createdBy?: number;
  minDate?: Date;
  maxDate?: Date;
  limit?: number;
  offset?: number;
}

export class QuoteRepository {
  async create(data: InsertQuote): Promise<Quote> {
    const result = await db
      .insert(quotes)
      .values(data)
      .returning();
    return result[0];
  }

  async getById(id: number): Promise<Quote | null> {
    const result = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    return result[0] || null;
  }

  async getByNumber(quoteNumber: string): Promise<Quote | null> {
    const result = await db
      .select()
      .from(quotes)
      .where(eq(quotes.quoteNumber, quoteNumber));
    return result[0] || null;
  }

  async list(filters: QuoteFilters = {}): Promise<Quote[]> {
    let query = db.select().from(quotes);

    const whereConditions: (typeof quotes)[] = [];

    if (filters.status) {
      whereConditions.push(eq(quotes.status, filters.status as any));
    }

    if (filters.clientId) {
      whereConditions.push(eq(quotes.clientId, filters.clientId));
    }

    if (filters.createdBy) {
      whereConditions.push(eq(quotes.createdBy, filters.createdBy));
    }

    if (filters.minDate) {
      whereConditions.push(gte(quotes.createdAt, filters.minDate));
    }

    if (filters.maxDate) {
      whereConditions.push(lte(quotes.createdAt, filters.maxDate));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return query;
  }

  async update(id: number, data: Partial<InsertQuote>): Promise<Quote | null> {
    const result = await db
      .update(quotes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id))
      .returning();
    return result[0] || null;
  }

  async updateStatus(id: number, status: string): Promise<Quote | null> {
    return this.update(id, { status: status as any });
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(quotes)
      .where(eq(quotes.id, id));
    return !!result;
  }
}

export class QuoteDetailRepository {
  async create(data: InsertQuoteDetail): Promise<QuoteDetail> {
    const result = await db
      .insert(quoteDetails)
      .values(data)
      .returning();
    return result[0];
  }

  async createBatch(items: InsertQuoteDetail[]): Promise<QuoteDetail[]> {
    if (items.length === 0) return [];
    return db
      .insert(quoteDetails)
      .values(items)
      .returning();
  }

  async getByQuoteId(quoteId: number): Promise<QuoteDetail[]> {
    return db
      .select()
      .from(quoteDetails)
      .where(eq(quoteDetails.quoteId, quoteId));
  }

  async deleteByQuoteId(quoteId: number): Promise<boolean> {
    const result = await db
      .delete(quoteDetails)
      .where(eq(quoteDetails.quoteId, quoteId));
    return !!result;
  }
}

export const quoteRepository = new QuoteRepository();
export const quoteDetailRepository = new QuoteDetailRepository();
