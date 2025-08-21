import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Replit's DATABASE_URL or fallback for development
const databaseUrl = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/nacs_consortium";

// Create PostgreSQL connection
const connection = postgres(databaseUrl);

export const db = drizzle(connection, { schema });