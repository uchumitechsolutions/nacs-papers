import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '',
  database: 'nacs_consortium',
  multipleStatements: true
});

export const db = drizzle(await connection, { schema, mode: "default" });