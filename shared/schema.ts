import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  serial, 
  timestamp, 
  integer,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pastPapers = pgTable("past_papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  price: integer("price").notNull(), // Price in KSh
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  paperIds: jsonb("paper_ids").$type<number[]>().notNull(),
  totalAmount: integer("total_amount").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

// Users table for regular authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User purchases table to track what papers a user has bought
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  paperId: integer("paper_id").references(() => pastPapers.id),
  saleId: integer("sale_id").references(() => sales.id),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertPastPaperSchema = createInsertSchema(pastPapers).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertAdminSchema = createInsertSchema(admin).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPurchaseSchema = createInsertSchema(userPurchases).omit({
  id: true,
  purchasedAt: true,
});

// Login schema for authentication
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertPastPaper = z.infer<typeof insertPastPaperSchema>;
export type PastPaper = typeof pastPapers.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admin.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertUserPurchase = z.infer<typeof insertUserPurchaseSchema>;
export type UserPurchase = typeof userPurchases.$inferSelect;