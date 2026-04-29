import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * The Neon HTTP driver only validates the URL format at construction;
 * actual queries fail at request time if DATABASE_URL is not set or invalid.
 * The public site falls back gracefully via lib/db/publicReads.ts; admin
 * routes surface a clear error.
 */
const url = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@example.neon.tech/db";
const sql = neon(url);

export const db = drizzle(sql, { schema });
export { schema };
