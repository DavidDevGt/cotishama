import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ProductService } from "../../../apps/backend/src/services/ProductService";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../apps/backend/src/types/errors";
import { ProductFactory } from "../../factories";
import { setupTestDB, teardownTestDB } from "../../setup";

describe("ProductService", () => {
  let productService: ProductService;

  beforeEach(async () => {
    await setupTestDB();
    productService = new ProductService();
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("#createProduct", () => {
    it("should create product with valid data", async () => {
      const productData = ProductFactory.create();

      const result = await productService.createProduct(productData);

      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      expect(result.sku).toBe(productData.sku);
      expect(result.name).toBe(productData.name);
    });

    it("should throw ConflictError for duplicate SKU", async () => {
      const productData = ProductFactory.create();

      await productService.createProduct(productData);

      try {
        await productService.createProduct(productData);
        expect.unreachable("Should throw ConflictError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
      }
    });

    it("should handle various price formats", async () => {
      const product1 = ProductFactory.create({ unitPrice: "0.01" });
      const product2 = ProductFactory.create({ unitPrice: "9999.99" });
      const product3 = ProductFactory.create({ unitPrice: "123.45" });

      const result1 = await productService.createProduct(product1);
      const result2 = await productService.createProduct(product2);
      const result3 = await productService.createProduct(product3);

      expect(result1.unitPrice).toBe("0.01");
      expect(result2.unitPrice).toBe("9999.99");
      expect(result3.unitPrice).toBe("123.45");
    });
  });

  describe("#searchProducts", () => {
    beforeEach(async () => {
      const products = [
        ProductFactory.create({ name: "iPhone 15 Pro" }),
        ProductFactory.create({ name: "Samsung Galaxy S24" }),
        ProductFactory.create({ name: "Apple iPad Air" }),
      ];

      for (const product of products) {
        await productService.createProduct(product);
      }
    });

    it("should search by name", async () => {
      const results = await productService.searchProducts("iPhone");

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((p) => p.name.includes("iPhone"))).toBe(true);
    });

    it("should respect search limit", async () => {
      const results = await productService.searchProducts("", 1);

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it("should only return active products in search", async () => {
      const inactiveProduct = ProductFactory.createInactive({
        name: "Inactive iPhone",
      });
      await productService.createProduct(inactiveProduct);

      const results = await productService.searchProducts("iPhone");

      expect(results.some((p) => p.name === "Inactive iPhone")).toBe(false);
    });
  });

  describe("#updateStock", () => {
    let productId: number;

    beforeEach(async () => {
      const product = await productService.createProduct(ProductFactory.create({ quantity: 100 }));
      productId = product.id;
    });

    it("should increase stock", async () => {
      const result = await productService.updateStock(productId, 50);

      expect(result.quantity).toBe(150);
    });

    it("should decrease stock", async () => {
      const result = await productService.updateStock(productId, -30);

      expect(result.quantity).toBe(70);
    });

    it("should throw ValidationError for insufficient stock", async () => {
      try {
        await productService.updateStock(productId, -150);
        expect.unreachable("Should throw ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as Error).message).toContain("Insufficient stock");
      }
    });

    it("should handle zero quantity update", async () => {
      const result = await productService.updateStock(productId, 0);

      expect(result.quantity).toBe(100);
    });

    it("should throw NotFoundError for non-existent product", async () => {
      try {
        await productService.updateStock(99999, 10);
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("#listProducts", () => {
    beforeEach(async () => {
      const products = [
        ProductFactory.create({ category: "Electronics", unitPrice: "500.00" }),
        ProductFactory.create({ category: "Electronics", unitPrice: "300.00" }),
        ProductFactory.create({ category: "Software", unitPrice: "100.00" }),
      ];

      for (const product of products) {
        await productService.createProduct(product);
      }
    });

    it("should list all products", async () => {
      const results = await productService.listProducts();

      expect(results.length).toBe(3);
    });

    it("should filter by category", async () => {
      const results = await productService.listProducts({
        category: "Electronics",
      });

      expect(results.length).toBe(2);
      expect(results.every((p) => p.category === "Electronics")).toBe(true);
    });

    it("should filter by price range", async () => {
      const results = await productService.listProducts({
        minPrice: 200,
        maxPrice: 400,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((p) => Number.parseFloat(p.unitPrice) >= 200 && Number.parseFloat(p.unitPrice) <= 400),
      ).toBe(true);
    });

    it("should respect pagination", async () => {
      const results = await productService.listProducts({ limit: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe("#deleteProduct", () => {
    let productId: number;

    beforeEach(async () => {
      const product = await productService.createProduct(ProductFactory.create());
      productId = product.id;
    });

    it("should delete product", async () => {
      await productService.deleteProduct(productId);

      try {
        await productService.getProduct(productId);
        expect.unreachable("Product should be deleted");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("inventory scenarios", () => {
    it("should handle low stock product creation", async () => {
      const lowStockProduct = ProductFactory.createLowStock();
      const result = await productService.createProduct(lowStockProduct);

      expect(result.quantity).toBeLessThan(result.minQuantity);
    });

    it("should handle out of stock products", async () => {
      const outOfStock = ProductFactory.createOutOfStock();
      const result = await productService.createProduct(outOfStock);

      expect(result.quantity).toBe(0);
    });

    it("should handle expensive products", async () => {
      const expensive = ProductFactory.createExpensive();
      const result = await productService.createProduct(expensive);

      expect(Number.parseFloat(result.unitPrice)).toBe(9999.99);
    });

    it("should allow multiple stock updates", async () => {
      const product = await productService.createProduct(ProductFactory.create({ quantity: 100 }));

      let result = await productService.updateStock(product.id, 10);
      expect(result.quantity).toBe(110);

      result = await productService.updateStock(product.id, -20);
      expect(result.quantity).toBe(90);

      result = await productService.updateStock(product.id, 5);
      expect(result.quantity).toBe(95);
    });
  });
});
