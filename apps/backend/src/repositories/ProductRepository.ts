import { eq, and, ilike, gte, lte } from 'drizzle-orm';
import { db } from '../db/client';
import { products, type Product, type InsertProduct } from '../db/schema';

export interface ProductFilters {
  sku?: string;
  name?: string;
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export class ProductRepository {
  async create(data: InsertProduct): Promise<Product> {
    const result = await db
      .insert(products)
      .values(data)
      .returning();
    return result[0];
  }

  async getById(id: number): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return result[0] || null;
  }

  async getBySku(sku: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.sku, sku));
    return result[0] || null;
  }

  async list(filters: ProductFilters = {}): Promise<Product[]> {
    let query = db.select().from(products);

    const whereConditions: (typeof products)[] = [];

    if (filters.sku) {
      whereConditions.push(eq(products.sku, filters.sku));
    }

    if (filters.name) {
      whereConditions.push(ilike(products.name, `%${filters.name}%`));
    }

    if (filters.category) {
      whereConditions.push(eq(products.category, filters.category));
    }

    if (filters.isActive !== undefined) {
      whereConditions.push(eq(products.isActive, filters.isActive ? 1 : 0));
    }

    if (filters.minPrice) {
      whereConditions.push(gte(products.unitPrice, filters.minPrice.toString()));
    }

    if (filters.maxPrice) {
      whereConditions.push(lte(products.unitPrice, filters.maxPrice.toString()));
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

  async update(id: number, data: Partial<InsertProduct>): Promise<Product | null> {
    const result = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  async updateStock(id: number, quantity: number): Promise<Product | null> {
    const product = await this.getById(id);
    if (!product) return null;

    return this.update(id, {
      quantity: product.quantity + quantity,
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return !!result;
  }
}

export const productRepository = new ProductRepository();
