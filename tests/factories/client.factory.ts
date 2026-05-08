import type { InsertClient } from "../../apps/backend/src/db/schema";

let clientCounter = 0;

export class ClientFactory {
  static create(overrides?: Partial<InsertClient>): InsertClient {
    clientCounter++;

    return {
      name: `Test Client ${clientCounter}`,
      email: `client${clientCounter}@test.local`,
      phone: "+1-555-000" + String(clientCounter).padStart(4, "0"),
      address: `123 Test Street ${clientCounter}`,
      city: "Test City",
      country: "Test Country",
      postalCode: "12345",
      taxId: `TAX-${clientCounter.toString().padStart(6, "0")}`,
      contactPerson: `Contact ${clientCounter}`,
      notes: "Test client",
      isActive: 1,
      createdBy: 1,
      ...overrides,
    };
  }

  static createBatch(count: number, overrides?: Partial<InsertClient>): InsertClient[] {
    const clients: InsertClient[] = [];
    for (let i = 0; i < count; i++) {
      clients.push(this.create(overrides));
    }
    return clients;
  }

  static createInactive(overrides?: Partial<InsertClient>): InsertClient {
    return this.create({
      isActive: 0,
      ...overrides,
    });
  }

  static createWithoutTaxId(overrides?: Partial<InsertClient>): InsertClient {
    const client = this.create(overrides);
    return {
      ...client,
      taxId: undefined,
    };
  }
}
