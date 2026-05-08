import { productRepository, type ProductFilters } from '../repositories/ProductRepository';
import { ConflictError, NotFoundError, ValidationError } from '../types/errors';
import type { Product, InsertProduct } from '../db/schema';

export class ProductService {
  async createProduct(data: InsertProduct): Promise<Product> {
    const existing = await productRepository.getBySku(data.sku);

    if (existing) {
      throw new ConflictError('Product with this SKU already exists');
    }

    return productRepository.create(data);
  }

  async getProduct(id: number): Promise<Product> {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async listProducts(filters?: ProductFilters): Promise<Product[]> {
    return productRepository.list(filters);
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    return productRepository.list({
      name: query,
      isActive: true,
      limit,
    });
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (data.sku && data.sku !== product.sku) {
      const existing = await productRepository.getBySku(data.sku);
      if (existing) {
        throw new ConflictError('SKU already in use');
      }
    }

    const updated = await productRepository.update(id, data);

    if (!updated) {
      throw new NotFoundError('Product not found');
    }

    return updated;
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const newQuantity = product.quantity + quantity;

    if (newQuantity < 0) {
      throw new ValidationError('Insufficient stock');
    }

    const updated = await productRepository.updateStock(id, quantity);

    if (!updated) {
      throw new NotFoundError('Product not found');
    }

    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await productRepository.delete(id);
  }
}

export const productService = new ProductService();
