// src/lib/db.ts
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://brx:Qw3RtY77%24@localhost:5432/figtor?schema=public";

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query<T>(text, params);
  return res;
}

// Opcional: fecho gracioso em dev (evita pools zumbis em HMR)
if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  global.__PG_POOL__ = global.__PG_POOL__ ?? pool;
}
