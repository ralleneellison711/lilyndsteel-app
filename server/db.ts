import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === 'production';

// Log which database host we're connecting to (without exposing password)
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log(`Connecting to database host: ${url.hostname}:${url.port || 5432}`);
} catch {
  console.log('DATABASE_URL is set (could not parse host)');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });
