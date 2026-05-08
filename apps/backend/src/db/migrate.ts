import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import postgres from "postgres";
import { getEnv } from "../config/env";

export async function runMigrations() {
  const dbUrl = getEnv("DATABASE_URL");
  const migrationDir = join(import.meta.dir, "migrations");

  console.log("🗄️  Running database migrations...");

  const client = postgres(dbUrl, { prepare: false });

  try {
    const migrationFiles = readdirSync(migrationDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      const filePath = join(migrationDir, file);
      const sql = readFileSync(filePath, "utf-8");

      console.log(`  → ${file}`);
      await client.query(sql);
    }

    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migrations if called directly
if (import.meta.main) {
  runMigrations().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
