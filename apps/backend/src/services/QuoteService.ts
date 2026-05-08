import { db, closeDb } from "../db/client";
import {
  quoteRepository,
  quoteDetailRepository,
  type QuoteFilters,
} from "../repositories/QuoteRepository";
import { productRepository } from "../repositories/ProductRepository";
import { clientRepository } from "../repositories/ClientRepository";
import { ConflictError, NotFoundError, ValidationError } from "../types/errors";
import type { Quote, InsertQuote, InsertQuoteDetail, QuoteDetail } from "../db/schema";
import { quotes, quoteDetails } from "../db/schema";

export interface CreateQuoteInput {
  quoteNumber: string;
  clientId: number;
  validUntil: Date;
  notes?: string;
  details: Array<{
    productId: number;
    quantity: number;
    unitPrice?: number;
    discount?: number;
    notes?: string;
  }>;
}

export interface QuoteWithDetails extends Quote {
  details: QuoteDetail[];
}

export class QuoteService {
  async createQuote(input: CreateQuoteInput, userId: number): Promise<QuoteWithDetails> {
    // Validate client exists
    const client = await clientRepository.getById(input.clientId);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    // Validate quote number is unique
    const existing = await quoteRepository.getByNumber(input.quoteNumber);
    if (existing) {
      throw new ConflictError("Quote number already exists");
    }

    // Validate and prepare details
    if (!input.details || input.details.length === 0) {
      throw new ValidationError("Quote must contain at least one item");
    }

    let subtotal = 0;
    const detailsToCreate: InsertQuoteDetail[] = [];

    for (const detail of input.details) {
      const product = await productRepository.getById(detail.productId);
      if (!product) {
        throw new NotFoundError(`Product ${detail.productId} not found`);
      }

      const unitPrice = detail.unitPrice || Number.parseFloat(product.unitPrice);
      const lineTotal = unitPrice * detail.quantity;
      const discount = detail.discount || 0;
      const finalLineTotal = lineTotal - (lineTotal * discount) / 100;

      detailsToCreate.push({
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: unitPrice,
        lineTotal: finalLineTotal,
        discount: discount,
        notes: detail.notes,
      } as InsertQuoteDetail);

      subtotal += finalLineTotal;
    }

    // Create quote with transaction
    const quote = await quoteRepository.create({
      quoteNumber: input.quoteNumber,
      clientId: input.clientId,
      createdBy: userId,
      validUntil: input.validUntil,
      notes: input.notes,
      subtotal: subtotal,
      tax: 0, // Default no tax
      total: subtotal,
      status: "DRAFT",
    } as InsertQuote);

    // Add quote ID to details and create them
    const detailsWithQuoteId = detailsToCreate.map((d) => ({
      ...d,
      quoteId: quote.id,
    }));

    const details = await quoteDetailRepository.createBatch(detailsWithQuoteId);

    return {
      ...quote,
      details,
    };
  }

  async getQuote(id: number): Promise<QuoteWithDetails> {
    const quote = await quoteRepository.getById(id);

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    const details = await quoteDetailRepository.getByQuoteId(id);

    return {
      ...quote,
      details,
    };
  }

  async listQuotes(filters?: QuoteFilters): Promise<Quote[]> {
    return quoteRepository.list(filters);
  }

  async updateQuote(
    id: number,
    updates: Partial<InsertQuote>,
    userId: number,
  ): Promise<QuoteWithDetails> {
    const quote = await quoteRepository.getById(id);

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    if (quote.status !== "DRAFT") {
      throw new ValidationError("Can only update quotes in DRAFT status");
    }

    const updated = await quoteRepository.update(id, updates);

    if (!updated) {
      throw new NotFoundError("Quote not found");
    }

    const details = await quoteDetailRepository.getByQuoteId(id);

    return {
      ...updated,
      details,
    };
  }

  async changeStatus(
    id: number,
    newStatus: string,
    userId: number,
    reason?: string,
  ): Promise<Quote> {
    const quote = await quoteRepository.getById(id);

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    const validStatuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "ARCHIVED"];
    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError("Invalid quote status");
    }

    return quoteRepository.updateStatus(id, newStatus);
  }

  async deleteQuote(id: number): Promise<void> {
    const quote = await quoteRepository.getById(id);

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    if (quote.status !== "DRAFT") {
      throw new ValidationError("Can only delete quotes in DRAFT status");
    }

    // Delete details first
    await quoteDetailRepository.deleteByQuoteId(id);

    // Then delete quote
    await quoteRepository.delete(id);
  }
}

export const quoteService = new QuoteService();
