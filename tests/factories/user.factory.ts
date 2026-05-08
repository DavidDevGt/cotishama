import { hashPassword } from '../../apps/backend/src/utils/password';
import type { User, InsertUser } from '../../apps/backend/src/db/schema';

let userCounter = 0;

export class UserFactory {
  static async create(overrides?: Partial<InsertUser>): Promise<InsertUser> {
    userCounter++;
    const password = 'TestPassword123';
    const hashedPassword = await hashPassword(password);

    return {
      email: `user${userCounter}@test.local`,
      passwordHash: hashedPassword,
      firstName: `User${userCounter}`,
      lastName: 'Test',
      role: 'VIEWER',
      isActive: 1,
      ...overrides,
    };
  }

  static async createAdmin(overrides?: Partial<InsertUser>): Promise<InsertUser> {
    return this.create({
      role: 'ADMIN',
      ...overrides,
    });
  }

  static async createOperator(overrides?: Partial<InsertUser>): Promise<InsertUser> {
    return this.create({
      role: 'OPERATOR',
      ...overrides,
    });
  }

  static async createInactive(overrides?: Partial<InsertUser>): Promise<InsertUser> {
    return this.create({
      isActive: 0,
      ...overrides,
    });
  }

  static async createBatch(count: number, overrides?: Partial<InsertUser>): Promise<InsertUser[]> {
    const users: InsertUser[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }
}
