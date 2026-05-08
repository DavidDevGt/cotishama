import type { InsertQuote } from "../../apps/backend/src/db/schema";

let quoteCounter = 0;

export class QuoteFactory {
  static create(overrides?: Partial<InsertQuote>): InsertQuote {
    quoteCounter++;
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return {
      quoteNumber: `QT-${now.getFullYear()}-${String(quoteCounter).padStart(6, "0")}`,
      clientId: 1,
      createdBy: 1,
      status: "DRAFT",
      validUntil,
      notes: "Test quote",
      subtotal: "1000.00",
      tax: "150.00",
      total: "1150.00",
      ...overrides,
    };
  }

  static createBatch(count: number, overrides?: Partial<InsertQuote>): InsertQuote[] {
    const quotes: InsertQuote[] = [];
    for (let i = 0; i < count; i++) {
      quotes.push(this.create(overrides));
    }
    return quotes;
  }

  static createSent(overrides?: Partial<InsertQuote>): InsertQuote {
    return this.create({
      status: "SENT",
      ...overrides,
    });
  }

  static createAccepted(overrides?: Partial<InsertQuote>): InsertQuote {
    return this.create({
      status: "ACCEPTED",
      ...overrides,
    });
  }

  static createRejected(overrides?: Partial<InsertQuote>): InsertQuote {
    return this.create({
      status: "REJECTED",
      ...overrides,
    });
  }

  static createExpired(overrides?: Partial<InsertQuote>): InsertQuote {
    const now = new Date();
    const validUntil = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // yesterday

    return this.create({
      status: "EXPIRED",
      validUntil,
      ...overrides,
    });
  }

  static createArchived(overrides?: Partial<InsertQuote>): InsertQuote {
    return this.create({
      status: "ARCHIVED",
      ...overrides,
    });
  }

  static createHighValue(overrides?: Partial<InsertQuote>): InsertQuote {
    return this.create({
      subtotal: "50000.00",
      tax: "7500.00",
      total: "57500.00",
      ...overrides,
    });
  }
}
