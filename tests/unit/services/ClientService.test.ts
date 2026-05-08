import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ClientService } from "../../../apps/backend/src/services/ClientService";
import { ConflictError, NotFoundError } from "../../../apps/backend/src/types/errors";
import { ClientFactory } from "../../factories";
import { setupTestDB, teardownTestDB } from "../../setup";

describe("ClientService", () => {
  let clientService: ClientService;

  beforeEach(async () => {
    await setupTestDB();
    clientService = new ClientService();
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("#createClient", () => {
    it("should create client with valid data", async () => {
      const clientData = ClientFactory.create();

      const result = await clientService.createClient(clientData);

      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      expect(result.name).toBe(clientData.name);
      expect(result.email).toBe(clientData.email);
      expect(result.isActive).toBe(1);
    });

    it("should throw ConflictError for duplicate email", async () => {
      const clientData = ClientFactory.create();

      await clientService.createClient(clientData);

      try {
        await clientService.createClient(clientData);
        expect.unreachable("Should throw ConflictError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
      }
    });

    it("should throw ConflictError for duplicate tax ID", async () => {
      const taxId = "TAX-999999";
      const client1 = ClientFactory.create({ taxId });
      const client2 = ClientFactory.create({ email: "other@test.com", taxId });

      await clientService.createClient(client1);

      try {
        await clientService.createClient(client2);
        expect.unreachable("Should throw ConflictError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
      }
    });
  });

  describe("#getClient", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should retrieve client by ID", async () => {
      const result = await clientService.getClient(clientId);

      expect(result).toBeDefined();
      expect(result.id).toBe(clientId);
    });

    it("should throw NotFoundError for non-existent client", async () => {
      try {
        await clientService.getClient(99999);
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("#listClients", () => {
    beforeEach(async () => {
      const clients = ClientFactory.createBatch(5);
      for (const client of clients) {
        await clientService.createClient(client);
      }
    });

    it("should list all clients", async () => {
      const results = await clientService.listClients();

      expect(results.length).toBe(5);
    });

    it("should filter by name", async () => {
      const results = await clientService.listClients({
        name: "Test Client 1",
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.name.includes("Test Client 1"))).toBe(true);
    });

    it("should respect pagination limit", async () => {
      const results = await clientService.listClients({ limit: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it("should filter by active status", async () => {
      const inactiveClient = ClientFactory.createInactive();
      await clientService.createClient(inactiveClient);

      const activeResults = await clientService.listClients({ isActive: true });
      const inactiveResults = await clientService.listClients({
        isActive: false,
      });

      expect(activeResults.length).toBe(5);
      expect(inactiveResults.length).toBe(1);
    });
  });

  describe("#updateClient", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should update client data", async () => {
      const result = await clientService.updateClient(clientId, {
        phone: "+1-555-9999",
        notes: "Updated notes",
      });

      expect(result.phone).toBe("+1-555-9999");
      expect(result.notes).toBe("Updated notes");
    });

    it("should throw NotFoundError for non-existent client", async () => {
      try {
        await clientService.updateClient(99999, { phone: "+1-555-1234" });
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it("should throw ConflictError when updating to duplicate email", async () => {
      const otherClient = await clientService.createClient(ClientFactory.create());

      try {
        await clientService.updateClient(clientId, {
          email: otherClient.email,
        });
        expect.unreachable("Should throw ConflictError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
      }
    });

    it("should allow updating to same email", async () => {
      const originalEmail = (await clientService.getClient(clientId)).email;

      const result = await clientService.updateClient(clientId, {
        email: originalEmail,
      });

      expect(result.email).toBe(originalEmail);
    });
  });

  describe("#deleteClient", () => {
    let clientId: number;

    beforeEach(async () => {
      const client = await clientService.createClient(ClientFactory.create());
      clientId = client.id;
    });

    it("should delete client", async () => {
      await clientService.deleteClient(clientId);

      try {
        await clientService.getClient(clientId);
        expect.unreachable("Client should be deleted");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it("should throw NotFoundError when deleting non-existent client", async () => {
      try {
        await clientService.deleteClient(99999);
        expect.unreachable("Should throw NotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle clients with special characters in name", async () => {
      const specialName = "O'Reilly & Associates Ñoño";
      const clientData = ClientFactory.create({ name: specialName });

      const result = await clientService.createClient(clientData);

      expect(result.name).toBe(specialName);
    });

    it("should handle international phone numbers", async () => {
      const internationalPhone = "+34-91-123-4567"; // Spain
      const clientData = ClientFactory.create({ phone: internationalPhone });

      const result = await clientService.createClient(clientData);

      expect(result.phone).toBe(internationalPhone);
    });

    it("should handle nullable optional fields", async () => {
      const clientData = ClientFactory.createWithoutTaxId();

      const result = await clientService.createClient(clientData);

      expect(result.taxId).toBeUndefined();
    });
  });
});
