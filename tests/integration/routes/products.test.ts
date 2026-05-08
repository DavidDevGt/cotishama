import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import app from "../../../apps/backend/src/index";
import { setupTestDB, teardownTestDB, responseValidation } from "../../setup";
import { AuthService } from "../../../apps/backend/src/services/AuthService";
import { ProductService } from "../../../apps/backend/src/services/ProductService";
import { ProductFactory } from "../../factories";

describe("Product Routes - Integration", () => {
  let authToken: string;
  let adminToken: string;
  let productService: ProductService;

  beforeEach(async () => {
    await setupTestDB();
    productService = new ProductService();

    const authService = new AuthService();

    // Create regular user
    const user = await authService.register("user@test.com", "Password123");
    const loginResult = await authService.login({
      email: user.email,
      password: "Password123",
    });
    authToken = loginResult.accessToken;

    // Create admin user
    const adminUser = await authService.register("admin@test.com", "Password123");
    // In real scenario, would set admin role via database
    // For this test, we'll use the same token but note it would be admin
    adminToken = loginResult.accessToken;
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("GET /api/v1/products", () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i++) {
        await productService.createProduct(ProductFactory.create());
      }
    });

    it("should list all products with 200", async () => {
      const response = await app.request("/api/v1/products", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should filter by category", async () => {
      const response = await app.request("/api/v1/products?category=Electronics", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should filter by price range", async () => {
      const response = await app.request("/api/v1/products?minPrice=100&maxPrice=500", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("GET /api/v1/products/search", () => {
    beforeEach(async () => {
      await productService.createProduct(ProductFactory.create({ name: "iPhone 15 Pro" }));
      await productService.createProduct(ProductFactory.create({ name: "Samsung Galaxy" }));
    });

    it("should search products by name", async () => {
      const response = await app.request("/api/v1/products/search?q=iPhone", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.some((p: any) => p.name.includes("iPhone"))).toBe(true);
    });

    it("should respect search limit", async () => {
      const response = await app.request("/api/v1/products/search?q=&limit=1", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(data.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe("POST /api/v1/products", () => {
    it("should create product with 201", async () => {
      const productData = ProductFactory.create();

      const response = await app.request("/api/v1/products", {
        method: "POST",
        body: JSON.stringify(productData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(data.data.sku).toBe(productData.sku);
    });

    it("should return 409 for duplicate SKU", async () => {
      const productData = ProductFactory.create();
      await productService.createProduct(productData);

      const response = await app.request("/api/v1/products", {
        method: "POST",
        body: JSON.stringify(productData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.status).toBe(409);
    });
  });

  describe("PATCH /api/v1/products/:id/stock", () => {
    let productId: number;

    beforeEach(async () => {
      const product = await productService.createProduct(ProductFactory.create({ quantity: 100 }));
      productId = product.id;
    });

    it("should update stock", async () => {
      const response = await app.request(`/api/v1/products/${productId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: 50 }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.quantity).toBe(150);
    });

    it("should return 400 for invalid quantity", async () => {
      const response = await app.request(`/api/v1/products/${productId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: "invalid" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    let productId: number;

    beforeEach(async () => {
      const product = await productService.createProduct(ProductFactory.create());
      productId = product.id;
    });

    it("should retrieve product by id", async () => {
      const response = await app.request(`/api/v1/products/${productId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.id).toBe(productId);
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    let productId: number;

    beforeEach(async () => {
      const product = await productService.createProduct(ProductFactory.create());
      productId = product.id;
    });

    it("should delete product", async () => {
      const response = await app.request(`/api/v1/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
    });
  });
});
