import { db } from "./db";
import {
  contacts, uploads, promptLogs, products, orders, orderItems, transactions,
  type InsertContact, type InsertUpload, type Upload, type Contact,
  type InsertPromptLog, type PromptLog,
  type InsertProduct, type Product,
  type InsertOrder, type Order,
  type InsertTransaction, type Transaction
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createContact(contact: InsertContact): Promise<Contact>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUploadsByUserId(userId: string): Promise<Upload[]>;
  logPrompt(log: InsertPromptLog): Promise<PromptLog>;
  getPromptLogsByUserId(userId: string): Promise<PromptLog[]>;
  getAllPromptLogs(): Promise<PromptLog[]>;

  // Payment & Product
  getProduct(id: string): Promise<Product | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [newUpload] = await db.insert(uploads).values(upload).returning();
    return newUpload;
  }

  async getUploadsByUserId(userId: string): Promise<Upload[]> {
    return await db.select().from(uploads).where(eq(uploads.userId, userId));
  }

  async logPrompt(log: InsertPromptLog): Promise<PromptLog> {
    const [newLog] = await db.insert(promptLogs).values(log).returning();
    return newLog;
  }

  async getPromptLogsByUserId(userId: string): Promise<PromptLog[]> {
    return await db.select().from(promptLogs).where(eq(promptLogs.userId, userId)).orderBy(desc(promptLogs.createdAt));
  }

  async getAllPromptLogs(): Promise<PromptLog[]> {
    return await db.select().from(promptLogs).orderBy(desc(promptLogs.createdAt));
  }

  // Payment Implementation
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated;
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [newTx] = await db.insert(transactions).values(tx).returning();
    return newTx;
  }
}

export const storage = new DatabaseStorage();
