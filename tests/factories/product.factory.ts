import type { InsertProduct } from "../../apps/backend/src/db/schema";

let productCounter = 0;

export class ProductFactory {
  static create(overrides?: Partial<InsertProduct>): InsertProduct {
    productCounter++;

    return {
      sku: `SKU-${productCounter.toString().padStart(6, "0")}`,
      name: `Test Product ${productCounter}`,
      description: `Description for test product ${productCounter}`,
      category: "Electronics",
      unitPrice: (Math.floor(Math.random() * 900) + 100).toString(),
      quantity: 100,
      minQuantity: 10,
      supplier: "Test Supplier",
      isActive: 1,
      createdBy: 1,
      ...overrides,
    };
  }

  static createBatch(count: number, overrides?: Partial<InsertProduct>): InsertProduct[] {
    const products: InsertProduct[] = [];
    for (let i = 0; i < count; i++) {
      products.push(this.create(overrides));
    }
    return products;
  }

  static createLowStock(overrides?: Partial<InsertProduct>): InsertProduct {
    return this.create({
      quantity: 5,
      minQuantity: 10,
      ...overrides,
    });
  }

  static createOutOfStock(overrides?: Partial<InsertProduct>): InsertProduct {
    return this.create({
      quantity: 0,
      minQuantity: 1,
      ...overrides,
    });
  }

  static createExpensive(overrides?: Partial<InsertProduct>): InsertProduct {
    return this.create({
      unitPrice: "9999.99",
      ...overrides,
    });
  }

  static createCheap(overrides?: Partial<InsertProduct>): InsertProduct {
    return this.create({
      unitPrice: "0.99",
      ...overrides,
    });
  }

  static createInactive(overrides?: Partial<InsertProduct>): InsertProduct {
    return this.create({
      isActive: 0,
      ...overrides,
    });
  }
}
