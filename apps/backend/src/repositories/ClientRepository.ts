import { eq, and, like, ilike } from 'drizzle-orm';
import { db } from '../db/client';
import { clients, type Client, type InsertClient } from '../db/schema';

export interface ClientFilters {
  name?: string;
  email?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class ClientRepository {
  async create(data: InsertClient): Promise<Client> {
    const result = await db
      .insert(clients)
      .values(data)
      .returning();
    return result[0];
  }

  async getById(id: number): Promise<Client | null> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return result[0] || null;
  }

  async getByEmail(email: string): Promise<Client | null> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.email, email));
    return result[0] || null;
  }

  async list(filters: ClientFilters = {}): Promise<Client[]> {
    let query = db.select().from(clients);

    const whereConditions: (typeof clients)[] = [];

    if (filters.name) {
      whereConditions.push(ilike(clients.name, `%${filters.name}%`));
    }

    if (filters.email) {
      whereConditions.push(eq(clients.email, filters.email));
    }

    if (filters.isActive !== undefined) {
      whereConditions.push(eq(clients.isActive, filters.isActive ? 1 : 0));
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

  async update(id: number, data: Partial<InsertClient>): Promise<Client | null> {
    const result = await db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id));
    return !!result;
  }
}

export const clientRepository = new ClientRepository();
