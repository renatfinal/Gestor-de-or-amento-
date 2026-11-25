import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      const isRemote =
        process.env.SQL_HOST && !process.env.SQL_HOST.startsWith('/app/cloudsql');
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        ssl: isRemote ? { rejectUnauthorized: false } : undefined,
        max: 5,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 10000,
      });
    }

    // Force search_path to public and ensure avatar_url column exists
    global._postgresPool.on('connect', (client) => {
      client.query('SET search_path TO public;').catch(() => {});
      client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;').catch(() => {});
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
export { schema };
