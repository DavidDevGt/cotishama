import { db, closeDb } from '../client';
import { users, clients, products } from '../schema';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Hash password for demo user
    const hashedPassword = await bcrypt.hash('DemoPassword123', 10);

    // Create admin user
    await db.insert(users).values({
      email: 'admin@cotishama.local',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: 1,
    });

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

if (import.meta.main) {
  seedDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
