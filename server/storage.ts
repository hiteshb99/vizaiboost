import { db } from "./db";
import {
  contacts, uploads, promptLogs, products, orders, orderItems, transactions, users,
  type InsertContact, type InsertUpload, type Upload, type Contact,
  type InsertPromptLog, type PromptLog,
  type InsertProduct, type Product,
  type InsertOrder, type Order,
  type InsertTransaction, type Transaction,
  type User
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
  createProduct(product: InsertProduct): Promise<Product>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByStripeSession(stripeSessionId: string): Promise<Order | undefined>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;

  // User & Credits
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  upsertUser(user: any): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllOrders(): Promise<Order[]>;
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

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByStripeSession(stripeSessionId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, stripeSessionId));
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

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    // Determine conflict target based on provided IDs
    let target: any = users.id;
    if (userData.googleId) target = users.googleId;
    else if (userData.appleId) target = users.appleId;
    else if (userData.email) target = users.email;

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: target,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    // This sets the absolute value. For increment/decrement, calculate before calling.
    const [updated] = await db.update(users)
      .set({ credits: credits })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ role: role })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
}

export const storage = new DatabaseStorage();
