import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { conversations, messages } from "./models/chat";

// Re-export auth and chat models
export * from "./models/chat";
export * from "./models/auth";

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Uploads for the dashboard demo
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Prompt logs for admin/billing
export const promptLogs = pgTable("prompt_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  productName: text("product_name").notNull(),
  prompt: text("prompt").notNull(),
  style: text("style").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Payment & Order System ---

// Products (Service definitions)
export const products = pgTable("products", {
  id: text("id").primaryKey(), // 'ai-single', 'branding-pack', etc.
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  type: text("type").notNull(), // 'digital', 'service'
  active: boolean("active").default(true).notNull(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  totalAmountCents: integer("total_amount_cents").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, failed, fulfilled
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  priceCents: integer("price_cents").notNull(), // Snapshot price at time of purchase
  metadata: jsonb("metadata"), // For associating with specific imageId or form data
});

// Transactions (Audit log)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  provider: text("provider").notNull(), // 'stripe', 'paypal'
  providerTransactionId: text("provider_transaction_id"),
  status: text("status").notNull(),
  amountCents: integer("amount_cents").notNull(),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true, status: true });
export const insertPromptLogSchema = createInsertSchema(promptLogs).omit({ id: true, createdAt: true });

export const insertProductSchema = createInsertSchema(products);
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });

// Types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;

export type PromptLog = typeof promptLogs.$inferSelect;
export type InsertPromptLog = z.infer<typeof insertPromptLogSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
