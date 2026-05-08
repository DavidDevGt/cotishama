import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, type User, type InsertUser } from "../db/schema";

export class UserRepository {
  async create(data: InsertUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }

  async getById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async update(id: number, data: Partial<InsertUser>): Promise<User | null> {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async list(limit = 50, offset = 0): Promise<User[]> {
    return db.select().from(users).limit(limit).offset(offset);
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }
}

export const userRepository = new UserRepository();
