/**
 * Quotation Service for quote management
 * Implements User Story 2: Crear Cotización con Múltiples Ítems
 * Implements User Story 3: Guardar Cotización con Snapshot de Precios
 */

import { supabase } from '@cotishama/db';
import type { Quotation, QuotationItem, CreateQuotationRequest, UpdateQuotationItemsRequest, PriceSnapshot } from '@cotishama/shared/types/quotation';
import { getProductById } from './product_service.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new quotation (draft)
 */
export async function createQuotation(data: CreateQuotationRequest): Promise<Quotation> {
  logger.logOperation('quotation.create', { clientName: data.clientName, itemCount: data.items.length });

  try {
    // Get product prices and build price snapshot
    const snapshotItems: PriceSnapshot['items'] = [];
    const quotationItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    let total = 0;

    for (const item of data.items) {
      const product = await getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const unitPrice = product.price;
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      snapshotItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
      });

      quotationItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Create price snapshot
    const pricesSnapshot: PriceSnapshot = {
      createdAt: new Date().toISOString(),
      items: snapshotItems,
    };

    // Insert quotation
    const { data: quotation, error: qError } = await supabase
      .from('quotations')
      .insert({
        client_name: data.clientName,
        client_address: data.clientAddress || null,
        status: 'draft',
        prices_snapshot: pricesSnapshot,
        observations: data.observations || null,
      })
      .select()
      .single();

    if (qError) {
      logger.error('Create quotation failed', { error: qError.message });
      throw new Error(`Create quotation failed: ${qError.message}`);
    }

    // Insert quotation items
    const itemInserts = quotationItems.map((item) => ({
      quotation_id: quotation.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemInserts);

    if (itemsError) {
      logger.error('Create quotation items failed', { error: itemsError.message });
      throw new Error(`Create quotation items failed: ${itemsError.message}`);
    }

    logger.info(`Created quotation: ${quotation.id}`);

    return buildQuotationResponse(quotation.id);
  } catch (err) {
    logger.error('Create quotation error', { error: err instanceof Error ? err.message : 'Unknown' });
    throw err;
  }
}

/**
 * Get a quotation by ID
 */
export async function getQuotationById(id: string): Promise<Quotation | null> {
  logger.logOperation('quotation.getById', { id });
  return buildQuotationResponse(id);
}

/**
 * Update quotation items
 */
export async function updateQuotationItems(quotationId: string, data: UpdateQuotationItemsRequest): Promise<Quotation> {
  logger.logOperation('quotation.updateItems', { quotationId, itemCount: data.items.length });

  // Get current quotation to check status
  const current = await getQuotationById(quotationId);
  if (!current) {
    throw new Error('Quotation not found');
  }

  if (current.status !== 'draft') {
    throw new Error('Cannot update items on a saved quotation');
  }

  try {
    // Get snapshot items for reference
    const snapshotItemMap = new Map(current.pricesSnapshot.items.map((i) => [i.productId, i]));

    // Build new items
    const quotationItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    let total = 0;

    for (const item of data.items) {
      const product = await getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Use snapshot price if available, otherwise current price
      const snapshotItem = snapshotItemMap.get(item.productId);
      const unitPrice = snapshotItem?.unitPrice ?? product.price;
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      quotationItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Delete existing items and insert new ones
    await supabase.from('quotation_items').delete().eq('quotation_id', quotationId);

    const itemInserts = quotationItems.map((item) => ({
      quotation_id: quotationId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemInserts);

    if (itemsError) {
      throw new Error(`Update items failed: ${itemsError.message}`);
    }

    // Update timestamp
    await supabase
      .from('quotations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', quotationId);

    logger.info(`Updated quotation items: ${quotationId}`);

    return buildQuotationResponse(quotationId);
  } catch (err) {
    logger.error('Update quotation items error', { error: err instanceof Error ? err.message : 'Unknown' });
    throw err;
  }
}

/**
 * Save a quotation (lock prices in snapshot)
 */
export async function saveQuotation(quotationId: string): Promise<Quotation> {
  logger.logOperation('quotation.save', { quotationId });

  const current = await getQuotationById(quotationId);
  if (!current) {
    throw new Error('Quotation not found');
  }

  if (current.status !== 'draft') {
    throw new Error('Quotation is already saved');
  }

  const { error } = await supabase
    .from('quotations')
    .update({
      status: 'saved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', quotationId);

  if (error) {
    logger.error('Save quotation failed', { error: error.message });
    throw new Error(`Save quotation failed: ${error.message}`);
  }

  logger.info(`Saved quotation: ${quotationId}`);

  return buildQuotationResponse(quotationId);
}

/**
 * List quotations
 */
export async function listQuotations(status?: string, limit: number = 50, offset: number = 0): Promise<{ quotations: Quotation[]; total: number }> {
  logger.logOperation('quotation.list', { status, limit, offset });

  let query = supabase
    .from('quotations')
    .select('id', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('List quotations failed', { error: error.message });
    throw new Error(`List quotations failed: ${error.message}`);
  }

  const quotations: Quotation[] = [];
  for (const q of data || []) {
    quotations.push(await buildQuotationResponse(q.id));
  }

  return { quotations, total: count || 0 };
}

/**
 * Duplicate a quotation
 */
export async function duplicateQuotation(quotationId: string): Promise<Quotation> {
  logger.logOperation('quotation.duplicate', { quotationId });

  const original = await getQuotationById(quotationId);
  if (!original) {
    throw new Error('Quotation not found');
  }

  const items = original.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  return createQuotation({
    clientName: `${original.clientName} (copia)`,
    clientAddress: original.clientAddress,
    items,
    observations: original.observations,
  });
}

/**
 * Build a complete quotation response with items
 */
async function buildQuotationResponse(quotationId: string): Promise<Quotation> {
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', quotationId)
    .single();

  if (qError || !quotation) {
    throw new Error('Quotation not found');
  }

  const { data: items, error: iError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotationId);

  if (iError) {
    throw new Error(`Failed to load items: ${iError.message}`);
  }

  const quotationItems: QuotationItem[] = (items || []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: '', // Will be populated from products
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price),
    subtotal: parseFloat(item.unit_price) * item.quantity,
  }));

  // Get product names
  const productIds = [...new Set(items?.map((i) => i.product_id) || [])];
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productMap = new Map(products?.map((p) => [p.id, p.name]) || []);

    for (const item of quotationItems) {
      item.productName = productMap.get(item.productId) || 'Unknown';
    }
  }

  const total = quotationItems.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    id: quotation.id,
    clientName: quotation.client_name,
    clientAddress: quotation.client_address || undefined,
    status: quotation.status as 'draft' | 'saved' | 'void',
    items: quotationItems,
    total,
    pricesSnapshot: quotation.prices_snapshot as PriceSnapshot,
    observations: quotation.observations || undefined,
    createdAt: quotation.created_at,
    updatedAt: quotation.updated_at || undefined,
  };
}