import { clientRepository, type ClientFilters } from '../repositories/ClientRepository';
import { ConflictError, NotFoundError } from '../types/errors';
import type { Client, InsertClient } from '../db/schema';

export class ClientService {
  async createClient(data: InsertClient): Promise<Client> {
    const existing = await clientRepository.getByEmail(data.email);

    if (existing) {
      throw new ConflictError('Client with this email already exists');
    }

    if (data.taxId) {
      const existingTax = await clientRepository.list({ limit: 1000 });
      if (existingTax.some((c) => c.taxId === data.taxId)) {
        throw new ConflictError('Client with this tax ID already exists');
      }
    }

    return clientRepository.create(data);
  }

  async getClient(id: number): Promise<Client> {
    const client = await clientRepository.getById(id);

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    return client;
  }

  async listClients(filters?: ClientFilters): Promise<Client[]> {
    return clientRepository.list(filters);
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client> {
    const client = await clientRepository.getById(id);

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    if (data.email && data.email !== client.email) {
      const existing = await clientRepository.getByEmail(data.email);
      if (existing) {
        throw new ConflictError('Email already in use');
      }
    }

    const updated = await clientRepository.update(id, data);

    if (!updated) {
      throw new NotFoundError('Client not found');
    }

    return updated;
  }

  async deleteClient(id: number): Promise<void> {
    const client = await clientRepository.getById(id);

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    await clientRepository.delete(id);
  }
}

export const clientService = new ClientService();
