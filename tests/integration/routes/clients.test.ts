import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import app from "../../../apps/backend/src/index";
import { setupTestDB, teardownTestDB, responseValidation } from "../../setup";
import { AuthService } from "../../../apps/backend/src/services/AuthService";
import { ClientService } from "../../../apps/backend/src/services/ClientService";
import { ClientFactory } from "../../factories";

describe("Client Routes - Integration", () => {
  let authToken: string;
  let clientService: ClientService;

  beforeEach(async () => {
    await setupTestDB();
    clientService = new ClientService();

    const authService = new AuthService();
    const loginResult = await authService.login({
      email: (await authService.register("user@test.com", "Password123")).email,
      password: "Password123",
    });
    authToken = loginResult.accessToken;
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("GET /api/v1/clients", () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i++) {
        await clientService.createClient(ClientFactory.create());
      }
    });

    it("should list all clients with 200", async () => {
      const response = await app.request("/api/v1/clients", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it("should respect pagination", async () => {
      const response = await app.request("/api/v1/clients?limit=1", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(data.data.length).toBeLessThanOrEqual(1);
    });

    it("should return 401 without auth token", async () => {
      const response = await app.request("/api/v1/clients", {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/clients", () => {
    it("should create client with 201", async () => {
      const clientData = ClientFactory.create();

      const response = await app.request("/api/v1/clients", {
        method: "POST",
        body: JSON.stringify(clientData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(data.data.name).toBe(clientData.name);
      expect(data.data.email).toBe(clientData.email);
    });

    it("should return 409 for duplicate email", async () => {
      const clientData = ClientFactory.create();
      await clientService.createClient(clientData);

      const response = await app.request("/api/v1/clients", {
        method: "POST",
        body: JSON.stringify(clientData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(409);
    });
  });

  describe("GET /api/v1/clients/:id", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should retrieve client by id", async () => {
      const response = await app.request(`/api/v1/clients/${clientId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(data.data.id).toBe(clientId);
    });

    it("should return 404 for non-existent client", async () => {
      const response = await app.request("/api/v1/clients/99999", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/v1/clients/:id", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should update client", async () => {
      const response = await app.request(`/api/v1/clients/${clientId}`, {
        method: "PUT",
        body: JSON.stringify({ phone: "+1-555-9999" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.phone).toBe("+1-555-9999");
    });
  });

  describe("GET /api/v1/clients/:id/quotes", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should return client quotes", async () => {
      const response = await app.request(`/api/v1/clients/${clientId}/quotes`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should return 404 for non-existent client", async () => {
      const response = await app.request("/api/v1/clients/99999/quotes", {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/clients/:id", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should delete client", async () => {
      const response = await app.request(`/api/v1/clients/${clientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await app.request(`/api/v1/clients/${clientId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(getResponse.status).toBe(404);
    });
  });
});
