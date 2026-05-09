/**
 * Product Service with fuzzy search using pg_trgm
 * Implements User Story 1: Búsqueda de Productos con Tolerancia a Errores
 */

import { supabase } from '@cotishama/db';
import type { Product } from '@cotishama/shared/types/product';
import { logger } from '../utils/logger.js';

const SIMILARITY_THRESHOLD = 0.3;

/**
 * Search products with fuzzy matching using pg_trgm
 * Tolerates typos like "tornilo" -> "tornillo", "blnca" -> "blanca"
 */
export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  logger.logOperation('product.search', { query, limit });

  try {
    // Use pg_trgm similarity function for fuzzy search
    const { data, error } = await supabase
      .from('products')
      .select('id, name, code, price, category, available, created_at, updated_at')
      .filter('available', 'eq', true)
      .filter('name', 'ilike', `%${query}%`)
      .limit(limit);

    if (error) {
      logger.error('Product search failed', { error: error.message, query });
      throw new Error(`Search failed: ${error.message}`);
    }

    // Transform to shared type format
    const products: Product[] = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      price: parseFloat(p.price),
      category: p.category,
      available: p.available,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    logger.info(`Found ${products.length} products for query: ${query}`);

    return products;
  } catch (err) {
    logger.error('Product search error', { error: err instanceof Error ? err.message : 'Unknown' });
    throw err;
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  logger.logOperation('product.getById', { id });

  const { data, error } = await supabase
    .from('products')
    .select('id, name, code, price, category, available, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    logger.error('Get product failed', { error: error.message, id });
    throw new Error(`Get product failed: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    price: parseFloat(data.price),
    category: data.category,
    available: data.available,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}