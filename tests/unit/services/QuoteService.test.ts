import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { QuoteService } from "../../../apps/backend/src/services/QuoteService";
import { ClientService } from "../../../apps/backend/src/services/ClientService";
import { ProductService } from "../../../apps/backend/src/services/ProductService";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../apps/backend/src/types/errors";
import { ClientFactory, ProductFactory, QuoteFactory } from "../../factories";
import { setupTestDB, teardownTestDB } from "../../setup";

describe("QuoteService", () => {
  let quoteService: QuoteService;
  let clientService: ClientService;
  let productService: ProductService;
  let clientId: number;
  let productId: number;
  const userId = 1;

  beforeEach(async () => {
    await setupTestDB();
    quoteService = new QuoteService();
    clientService = new ClientService();
    productService = new ProductService();

    // Create test client and product
    const client = await clientService.createClient(ClientFactory.create());
    clientId = client.id;

    const product = await productService.createProduct(ProductFactory.create());
    productId = product.id;
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("#createQuote", () => {
    it("should create quote with valid details", async () => {
      const input = {
        quoteNumber: "QT-2024-000001",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Test quote",
        details: [
          {
            productId,
            quantity: 5,
            unitPrice: 100,
          },
        ],
      };

      const result = await quoteService.createQuote(input, userId);

      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      expect(result.quoteNumber).toBe("QT-2024-000001");
      expect(result.clientId).toBe(clientId);
      expect(result.status).toBe("DRAFT");
      expect(result.details.length).toBe(1);
      expect(result.details[0].quantity).toBe(5);
    });

    it("should calculate total correctly", async () => {
      const input = {
        quoteNumber: "QT-2024-000002",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [
          {
            productId,
            quantity: 10,
            unitPrice: 100,
          },
          {
            productId,
            quantity: 5,
            unitPrice: 200,
          },
        ],
      };

      const result = await quoteService.createQuote(input, userId);

      // 10*100 + 5*200 = 1000 + 1000 = 2000
      expect(Number.parseFloat(result.subtotal)).toBe(2000);
    });

    it("should apply discount to line items", async () => {
      const input = {
        quoteNumber: "QT-2024-000003",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [
          {
            productId,
            quantity: 10,
            unitPrice: 100,
            discount: 10, // 10% discount
          },
        ],
      };

      const result = await quoteService.createQuote(input, userId);

      // 10*100 = 1000, with 10% discount = 900
      expect(Number.parseFloat(result.subtotal)).toBe(900);
      expect(result.details[0].discount).toBe(10);
    });

    it("should throw ConflictError for duplicate quote number", async () => {
      const input = {
        quoteNumber: "QT-2024-DUP",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 1 }],
      };

      await quoteService.createQuote(input, userId);

      try {
        await quoteService.createQuote(input, userId);
        expect.unreachable("Should throw ConflictError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
      }
    });

    it("should throw NotFoundError for non-existent client", async () => {
      const input = {
        quoteNumber: "QT-2024-NOTFOUND",
        clientId: 99999,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 1 }],
      };

      try {
        await quoteService.createQuote(input, userId);
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it("should throw NotFoundError for non-existent product", async () => {
      const input = {
        quoteNumber: "QT-2024-NOPROD",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId: 99999, quantity: 1 }],
      };

      try {
        await quoteService.createQuote(input, userId);
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it("should throw ValidationError for empty details", async () => {
      const input = {
        quoteNumber: "QT-2024-EMPTY",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [],
      };

      try {
        await quoteService.createQuote(input, userId);
        expect.unreachable("Should throw ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe("#getQuote", () => {
    let quoteId: number;

    beforeEach(async () => {
      const input = {
        quoteNumber: "QT-2024-GET",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 5 }],
      };

      const quote = await quoteService.createQuote(input, userId);
      quoteId = quote.id;
    });

    it("should retrieve quote with details", async () => {
      const result = await quoteService.getQuote(quoteId);

      expect(result).toBeDefined();
      expect(result.id).toBe(quoteId);
      expect(result.details.length).toBe(1);
    });

    it("should throw NotFoundError for non-existent quote", async () => {
      try {
        await quoteService.getQuote(99999);
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("#updateQuote", () => {
    let quoteId: number;

    beforeEach(async () => {
      const input = {
        quoteNumber: "QT-2024-UPDATE",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 5 }],
      };

      const quote = await quoteService.createQuote(input, userId);
      quoteId = quote.id;
    });

    it("should update draft quote", async () => {
      const result = await quoteService.updateQuote(quoteId, { notes: "Updated notes" }, userId);

      expect(result.notes).toBe("Updated notes");
    });

    it("should throw ValidationError when updating non-draft quote", async () => {
      await quoteService.changeStatus(quoteId, "SENT", userId);

      try {
        await quoteService.updateQuote(quoteId, { notes: "Update attempt" }, userId);
        expect.unreachable("Should throw ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe("#changeStatus", () => {
    let quoteId: number;

    beforeEach(async () => {
      const input = {
        quoteNumber: "QT-2024-STATUS",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 5 }],
      };

      const quote = await quoteService.createQuote(input, userId);
      quoteId = quote.id;
    });

    it("should change quote status", async () => {
      const result = await quoteService.changeStatus(quoteId, "SENT", userId);

      expect(result.status).toBe("SENT");
    });

    it("should handle all valid statuses", async () => {
      const statuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "ARCHIVED"];

      for (const status of statuses) {
        if (status !== "DRAFT") {
          // Start from draft for each
          // Reset to draft for new quote
          const input = {
            quoteNumber: `QT-2024-${status}`,
            clientId,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            details: [{ productId, quantity: 1 }],
          };
          const quote = await quoteService.createQuote(input, userId);
          const result = await quoteService.changeStatus(quote.id, status, userId);
          expect(result.status).toBe(status);
        }
      }
    });

    it("should throw ValidationError for invalid status", async () => {
      try {
        await quoteService.changeStatus(quoteId, "INVALID", userId);
        expect.unreachable("Should throw ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe("#deleteQuote", () => {
    let quoteId: number;

    beforeEach(async () => {
      const input = {
        quoteNumber: "QT-2024-DELETE",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 5 }],
      };

      const quote = await quoteService.createQuote(input, userId);
      quoteId = quote.id;
    });

    it("should delete draft quote", async () => {
      await quoteService.deleteQuote(quoteId);

      try {
        await quoteService.getQuote(quoteId);
        expect.unreachable("Quote should be deleted");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it("should throw ValidationError when deleting non-draft quote", async () => {
      await quoteService.changeStatus(quoteId, "SENT", userId);

      try {
        await quoteService.deleteQuote(quoteId);
        expect.unreachable("Should throw ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe("complex scenarios", () => {
    it("should handle quote with multiple products", async () => {
      const product2 = await productService.createProduct(ProductFactory.create());

      const input = {
        quoteNumber: "QT-2024-MULTI",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [
          { productId, quantity: 5, unitPrice: 100 },
          { productId: product2.id, quantity: 3, unitPrice: 200 },
          { productId, quantity: 2, unitPrice: 150 },
        ],
      };

      const result = await quoteService.createQuote(input, userId);

      expect(result.details.length).toBe(3);
      expect(Number.parseFloat(result.subtotal)).toBe(1400); // 500 + 600 + 300
    });

    it("should preserve quote history through status changes", async () => {
      const input = {
        quoteNumber: "QT-2024-HISTORY",
        clientId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        details: [{ productId, quantity: 5 }],
      };

      const quote = await quoteService.createQuote(input, userId);

      // Simulate workflow
      await quoteService.changeStatus(quote.id, "SENT", userId);
      const sentQuote = await quoteService.getQuote(quote.id);
      expect(sentQuote.status).toBe("SENT");

      await quoteService.changeStatus(quote.id, "ACCEPTED", userId);
      const acceptedQuote = await quoteService.getQuote(quote.id);
      expect(acceptedQuote.status).toBe("ACCEPTED");
    });
  });
});
