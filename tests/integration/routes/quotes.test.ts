import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import app from '../../../apps/backend/src/index';
import { setupTestDB, teardownTestDB, responseValidation } from '../../setup';
import { AuthService } from '../../../apps/backend/src/services/AuthService';
import { ClientService } from '../../../apps/backend/src/services/ClientService';
import { ProductService } from '../../../apps/backend/src/services/ProductService';
import { QuoteService } from '../../../apps/backend/src/services/QuoteService';
import { ClientFactory, ProductFactory } from '../../factories';

describe('Quote Routes - Integration', () => {
  let authToken: string;
  let userId: number;
  let clientId: number;
  let productId: number;
  let quoteService: QuoteService;

  beforeEach(async () => {
    await setupTestDB();

    const authService = new AuthService();
    const clientService = new ClientService();
    const productService = new ProductService();
    quoteService = new QuoteService();

    // Create user
    const user = await authService.register('user@test.com', 'Password123');
    userId = user.id;
    const loginResult = await authService.login({
      email: user.email,
      password: 'Password123',
    });
    authToken = loginResult.accessToken;

    // Create client
    const client = await clientService.createClient(ClientFactory.create());
    clientId = client.id;

    // Create product
    const product = await productService.createProduct(ProductFactory.create());
    productId = product.id;
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe('GET /api/v1/quotes', () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i++) {
        await quoteService.createQuote(
          {
            quoteNumber: `QT-2024-${String(i).padStart(6, '0')}`,
            clientId,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            details: [{ productId, quantity: 5 }],
          },
          userId
        );
      }
    });

    it('should list quotes with 200', async () => {
      const response = await app.request('/api/v1/quotes', {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const response = await app.request(
        '/api/v1/quotes?status=DRAFT',
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((q: any) => q.status === 'DRAFT')).toBe(true);
    });

    it('should respect pagination', async () => {
      const response = await app.request(
        '/api/v1/quotes?limit=1',
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await response.json();

      expect(data.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('POST /api/v1/quotes', () => {
    it('should create quote with 201', async () => {
      const response = await app.request('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify({
          quoteNumber: 'QT-2024-NEW',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          details: [
            {
              productId,
              quantity: 10,
              unitPrice: 100,
            },
          ],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(data.data.quoteNumber).toBe('QT-2024-NEW');
      expect(data.data.status).toBe('DRAFT');
      expect(data.data.details.length).toBe(1);
    });

    it('should return 404 for non-existent client', async () => {
      const response = await app.request('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify({
          quoteNumber: 'QT-2024-NOTFOUND',
          clientId: 99999,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          details: [{ productId, quantity: 1 }],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it('should return 409 for duplicate quote number', async () => {
      await quoteService.createQuote(
        {
          quoteNumber: 'QT-2024-DUP',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          details: [{ productId, quantity: 1 }],
        },
        userId
      );

      const response = await app.request('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify({
          quoteNumber: 'QT-2024-DUP',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          details: [{ productId, quantity: 1 }],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/v1/quotes/:id', () => {
    let quoteId: number;

    beforeEach(async () => {
      const quote = await quoteService.createQuote(
        {
          quoteNumber: 'QT-2024-GET',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          details: [{ productId, quantity: 5 }],
        },
        userId
      );
      quoteId = quote.id;
    });

    it('should retrieve quote with 200', async () => {
      const response = await app.request(`/api/v1/quotes/${quoteId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(data.data.id).toBe(quoteId);
      expect(data.data.details.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent quote', async () => {
      const response = await app.request('/api/v1/quotes/99999', {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/quotes/:id/status', () => {
    let quoteId: number;

    beforeEach(async () => {
      const quote = await quoteService.createQuote(
        {
          quoteNumber: 'QT-2024-STATUS',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          details: [{ productId, quantity: 5 }],
        },
        userId
      );
      quoteId = quote.id;
    });

    it('should change quote status', async () => {
      const response = await app.request(
        `/api/v1/quotes/${quoteId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'SENT' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('SENT');
    });

    it('should return 400 for invalid status', async () => {
      const response = await app.request(
        `/api/v1/quotes/${quoteId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'INVALID' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/quotes/:id', () => {
    let quoteId: number;

    beforeEach(async () => {
      const quote = await quoteService.createQuote(
        {
          quoteNumber: 'QT-2024-DELETE',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          details: [{ productId, quantity: 5 }],
        },
        userId
      );
      quoteId = quote.id;
    });

    it('should delete draft quote', async () => {
      const response = await app.request(`/api/v1/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await app.request(`/api/v1/quotes/${quoteId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(getResponse.status).toBe(404);
    });

    it('should return 400 when deleting non-draft quote', async () => {
      await quoteService.changeStatus(quoteId, 'SENT', userId);

      const response = await app.request(`/api/v1/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(400);
    });
  });

  describe('complex scenarios', () => {
    it('should handle complete quote workflow', async () => {
      // Create
      const createResponse = await app.request('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify({
          quoteNumber: 'QT-2024-WORKFLOW',
          clientId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          details: [
            { productId, quantity: 5, unitPrice: 100 },
            { productId, quantity: 3, unitPrice: 200 },
          ],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      const createData = await createResponse.json();
      const quoteId = createData.data.id;

      // Verify creation
      expect(createData.data.status).toBe('DRAFT');
      expect(createData.data.details.length).toBe(2);

      // Send
      const sendResponse = await app.request(
        `/api/v1/quotes/${quoteId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'SENT' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const sendData = await sendResponse.json();
      expect(sendData.data.status).toBe('SENT');

      // Accept
      const acceptResponse = await app.request(
        `/api/v1/quotes/${quoteId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'ACCEPTED' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const acceptData = await acceptResponse.json();
      expect(acceptData.data.status).toBe('ACCEPTED');
    });
  });
});
