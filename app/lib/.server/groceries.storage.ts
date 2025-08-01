// @ts-nocheck
import { eq, desc, and, sql, lte, gte, ilike, or } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type GroceryItem, 
  type InsertGroceryItem,
  type ExpiryNotification,
  type InsertNotification,
  type ScanHistory,
  type InsertScanHistory,
  groceryItems,
  expiryNotifications,
  scanHistory
} from "~/drizzle/schema/schema.server";

export interface IGroceriesStorage {
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  getGroceryItems(userId: number, limit?: number): Promise<GroceryItem[]>;
  getExpiringItems(userId: number, days?: number): Promise<GroceryItem[]>;
  updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem | undefined>;
  deleteGroceryItem(id: number): Promise<boolean>;
  scanGroceryImage(userId: number, imageDescription: string): Promise<ScanHistory>;
  createNotification(notification: InsertNotification): Promise<ExpiryNotification>;
  getNotifications(userId: number, unreadOnly?: boolean): Promise<ExpiryNotification[]>;
  markNotificationRead(id: number): Promise<boolean>;
  scheduleExpiryNotifications(userId: number): Promise<void>;
  getGroceryStats(userId: number): Promise<any>;
  searchGroceryItems(userId: number, query: string): Promise<GroceryItem[]>;
  getItemsByCategory(userId: number, category: string): Promise<GroceryItem[]>;
  getItemsByLocation(userId: number, location: string): Promise<GroceryItem[]>;
  ensureInitialized(): Promise<void>;
}

export class GroceriesStorage implements IGroceriesStorage {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.client = db;
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[GroceriesStorage] Starting sample data initialization...");
      
      const existingItems = await this.client.select().from(groceryItems).limit(1);
      console.log("[GroceriesStorage] Found " + existingItems.length + " existing items");

      if (existingItems.length === 0) {
        console.log("[GroceriesStorage] Creating sample grocery data...");
        
        const sampleItems = [
          {
            userId: 1,
            name: "Organic Bananas",
            category: "Fruits",
            expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            quantity: 6,
            unit: "pieces",
            location: "Counter",
            imageUrl: "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=800",
            aiConfidence: "0.95",
            addedDate: new Date().toISOString().split('T')[0]
          },
          {
            userId: 1,
            name: "Fresh Spinach",
            category: "Vegetables",
            expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            quantity: 1,
            unit: "bunch",
            location: "Refrigerator",
            imageUrl: "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=800",
            aiConfidence: "0.92",
            addedDate: new Date().toISOString().split('T')[0]
          },
          {
            userId: 1,
            name: "Greek Yogurt",
            category: "Dairy",
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            quantity: 2,
            unit: "containers",
            location: "Refrigerator",
            imageUrl: "https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800",
            aiConfidence: "0.98",
            addedDate: new Date().toISOString().split('T')[0]
          },
          {
            userId: 1,
            name: "Whole Grain Bread",
            category: "Bakery",
            expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            quantity: 1,
            unit: "loaf",
            location: "Pantry",
            imageUrl: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800",
            aiConfidence: "0.89",
            addedDate: new Date().toISOString().split('T')[0]
          }
        ];

        for (const item of sampleItems) {
          await this.createGroceryItem(item);
        }
        
        console.log("[GroceriesStorage] Created " + sampleItems.length + " sample items");
      }

      this.initialized = true;
      console.log("[GroceriesStorage] Initialization completed successfully");
    } catch (error) {
      console.error("[GroceriesStorage] Failed to initialize:", error);
      this.initialized = true;
    }
  }

  async createGroceryItem(itemData: InsertGroceryItem): Promise<GroceryItem> {
    try {
      const result = await this.client.insert(groceryItems).values({
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      const item = result[0];
      
      // Schedule expiry notifications for this item
      await this.scheduleExpiryNotifications(itemData.userId);
      
      return this.convertDates(item);
    } catch (error) {
      console.error("[GroceriesStorage] Failed to create grocery item:", error);
      throw new Error("Failed to create grocery item");
    }
  }

  async getGroceryItems(userId: number, limit = 50): Promise<GroceryItem[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select()
        .from(groceryItems)
        .where(and(
          eq(groceryItems.userId, userId),
          eq(groceryItems.isConsumed, false)
        ))
        .orderBy(desc(groceryItems.createdAt))
        .limit(limit);

      return result.map(item => this.convertDates(item));
    } catch (error) {
      console.error("[GroceriesStorage] Failed to get grocery items:", error);
      return [];
    }
  }

  async getExpiringItems(userId: number, days = 3): Promise<GroceryItem[]> {
    await this.ensureInitialized();
    
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      
      const result = await this.client
        .select()
        .from(groceryItems)
        .where(and(
          eq(groceryItems.userId, userId),
          eq(groceryItems.isConsumed, false),
          lte(groceryItems.expiryDate, targetDate.toISOString().split('T')[0])
        ))
        .orderBy(groceryItems.expiryDate);

      return result.map(item => this.convertDates(item));
    } catch (error) {
      console.error("[GroceriesStorage] Failed to get expiring items:", error);
      return [];
    }
  }

  async updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem | undefined> {
    try {
      const result = await this.client
        .update(groceryItems)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(groceryItems.id, id))
        .returning();

      return result[0] ? this.convertDates(result[0]) : undefined;
    } catch (error) {
      console.error("[GroceriesStorage] Failed to update grocery item:", error);
      return undefined;
    }
  }

  async deleteGroceryItem(id: number): Promise<boolean> {
    try {
      const result = await this.client
        .update(groceryItems)
        .set({ isConsumed: true, updatedAt: new Date() })
        .where(eq(groceryItems.id, id));

      return result.rowCount > 0;
    } catch (error) {
      console.error("[GroceriesStorage] Failed to delete grocery item:", error);
      return false;
    }
  }

  async scanGroceryImage(userId: number, imageDescription: string): Promise<ScanHistory> {
    const startTime = Date.now();
    
    try {
      console.log("[GroceriesStorage] Starting AI image recognition for user:", userId);
      
      // Mock AI recognition for demo
      const recognizedItems = [
        {
          name: "Organic Apples",
          confidence: 0.95,
          category: "Fruits",
          estimatedExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          quantity: 4,
          unit: "pieces"
        }
      ];
      
      const processingTime = Date.now() - startTime;
      
      console.log("[GroceriesStorage] AI recognized", recognizedItems.length, "items in", processingTime, "ms");
      
      // Save scan history
      const scanData: InsertScanHistory = {
        userId,
        imageUrl: null,
        recognizedItems,
        processingTime,
        success: true
      };
      
      const result = await this.client.insert(scanHistory).values(scanData).returning();
      const scan = result[0];
      
      // Auto-add high-confidence items to inventory
      for (const item of recognizedItems) {
        if (item.confidence > 0.8) {
          try {
            await this.createGroceryItem({
              userId,
              name: item.name,
              category: item.category,
              expiryDate: item.estimatedExpiry,
              quantity: item.quantity || 1,
              unit: item.unit || "pieces",
              location: "Refrigerator",
              aiConfidence: item.confidence.toString(),
              addedDate: new Date().toISOString().split('T')[0]
            });
          } catch (error) {
            console.error("[GroceriesStorage] Failed to auto-add item:", item.name, error);
          }
        }
      }
      
      return this.convertDates(scan);
    } catch (error) {
      console.error("[GroceriesStorage] Scan failed:", error);
      
      // Save failed scan
      const failedScanData: InsertScanHistory = {
        userId,
        imageUrl: null,
        recognizedItems: [],
        processingTime: Date.now() - startTime,
        success: false,
        errorMessage: error.message
      };
      
      const result = await this.client.insert(scanHistory).values(failedScanData).returning();
      return this.convertDates(result[0]);
    }
  }

  async createNotification(notificationData: InsertNotification): Promise<ExpiryNotification> {
    try {
      const result = await this.client.insert(expiryNotifications).values({
        ...notificationData,
        createdAt: new Date()
      }).returning();
      
      return this.convertDates(result[0]);
    } catch (error) {
      console.error("[GroceriesStorage] Failed to create notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  async getNotifications(userId: number, unreadOnly = false): Promise<ExpiryNotification[]> {
    await this.ensureInitialized();
    
    try {
      let whereConditions = [eq(expiryNotifications.userId, userId)];
      
      if (unreadOnly) {
        whereConditions.push(eq(expiryNotifications.isRead, false));
      }
      
      const result = await this.client
        .select()
        .from(expiryNotifications)
        .where(and(...whereConditions))
        .orderBy(desc(expiryNotifications.createdAt))
        .limit(50);

      return result.map(notification => this.convertDates(notification));
    } catch (error) {
      console.error("[GroceriesStorage] Failed to get notifications:", error);
      return [];
    }
  }

  async markNotificationRead(id: number): Promise<boolean> {
    try {
      const result = await this.client
        .update(expiryNotifications)
        .set({ isRead: true })
        .where(eq(expiryNotifications.id, id));

      return result.rowCount > 0;
    } catch (error) {
      console.error("[GroceriesStorage] Failed to mark notification as read:", error);
      return false;
    }
  }

  async scheduleExpiryNotifications(userId: number): Promise<void> {
    try {
      console.log("[GroceriesStorage] Scheduling expiry notifications for user:", userId);
      
      // Get items expiring in the next 7 days
      const expiringItems = await this.getExpiringItems(userId, 7);
      
      for (const item of expiringItems) {
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if notification already exists for this item
        const existingNotification = await this.client
          .select()
          .from(expiryNotifications)
          .where(and(
            eq(expiryNotifications.userId, userId),
            eq(expiryNotifications.groceryItemId, item.id),
            eq(expiryNotifications.type, 'expiry_warning')
          ))
          .limit(1);
        
        if (existingNotification.length === 0 && daysUntilExpiry <= 3) {
          const message = daysUntilExpiry <= 0 
            ? `Your ${item.name} has expired. Consider removing it from your inventory.`
            : `Your ${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Consider using it soon!`;
          
          await this.createNotification({
            userId,
            groceryItemId: item.id,
            type: 'expiry_warning',
            title: daysUntilExpiry <= 0 ? 'Item Expired' : 'Item Expiring Soon',
            message,
            priority: daysUntilExpiry <= 0 ? 'high' : daysUntilExpiry <= 1 ? 'high' : 'medium',
            scheduledFor: new Date()
          });
        }
      }
      
      console.log("[GroceriesStorage] Scheduled notifications for", expiringItems.length, "expiring items");
    } catch (error) {
      console.error("[GroceriesStorage] Failed to schedule notifications:", error);
    }
  }

  async getGroceryStats(userId: number): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const totalItems = await this.client
        .select({ count: sql<number>`count(*)` })
        .from(groceryItems)
        .where(and(
          eq(groceryItems.userId, userId),
          eq(groceryItems.isConsumed, false)
        ));
      
      const expiringItems = await this.getExpiringItems(userId, 3);
      
      const recentScans = await this.client
        .select({ count: sql<number>`count(*)` })
        .from(scanHistory)
        .where(and(
          eq(scanHistory.userId, userId),
          gte(scanHistory.scanDate, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        ));
      
      return {
        totalItems: totalItems[0]?.count || 0,
        expiringItems: expiringItems.length,
        wasteReduced: 85,
        moneySaved: 127,
        recentScans: recentScans[0]?.count || 0
      };
    } catch (error) {
      console.error("[GroceriesStorage] Failed to get stats:", error);
      return {
        totalItems: 0,
        expiringItems: 0,
        wasteReduced: 0,
        moneySaved: 0,
        recentScans: 0
      };
    }
  }

  async searchGroceryItems(userId: number, query: string): Promise<GroceryItem[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select()
        .from(groceryItems)
        .where(and(
          eq(groceryItems.userId, userId),
          eq(groceryItems.isConsumed, false),
          or(
            ilike(groceryItems.name, `%${query}%`),
            ilike(groceryItems.category, `%${query}%`),
            ilike(groceryItems.location, `%${query}%`)
          )
        ))
        .orderBy(desc(groceryItems.createdAt))
        .limit(50);

      return result.map(item => this.convertDates(item));
    } catch (error) {
      console.error("[GroceriesStorage] Failed to search grocery items:", error);
      return [];
    }
  }

  async getItemsByCategory(userId: number, category: string): Promise<GroceryItem[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select()
        .from(groceryItems)
        .where(and(
          eq(groceryItems.userId, userId),
          eq(groceryItems.isConsumed, false),
          eq(groceryItems.category, category)
        ))
        .orderBy(desc(groceryItems.createdAt));

      return result.map(item => this.convertDates(item));
    } catch (error) {
      console.error("[GroceriesStorage] Failed to get items by category:", error);
      return [];
    }
  }

  async getItemsByLocation(userId: number, location: string): Promise<GroceryItem[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select()
        .from(groceryItems)
        .where(and(
          eq(groceryItems.userId, userId),
          eq(groceryItems.isConsumed, false),
          eq(groceryItems.location, location)
        ))
        .orderBy(desc(groceryItems.createdAt));

      return result.map(item => this.convertDates(item));
    } catch (error) {
      console.error("[GroceriesStorage] Failed to get items by location:", error);
      return [];
    }
  }

  private convertDates(item: any): any {
    if (item.createdAt && typeof item.createdAt === 'string') {
      item.createdAt = new Date(item.createdAt);
    }
    if (item.updatedAt && typeof item.updatedAt === 'string') {
      item.updatedAt = new Date(item.updatedAt);
    }
    if (item.scheduledFor && typeof item.scheduledFor === 'string') {
      item.scheduledFor = new Date(item.scheduledFor);
    }
    if (item.sentAt && typeof item.sentAt === 'string') {
      item.sentAt = new Date(item.sentAt);
    }
    if (item.scanDate && typeof item.scanDate === 'string') {
      item.scanDate = new Date(item.scanDate);
    }
    return item;
  }
}

export const groceriesStorage = new GroceriesStorage();