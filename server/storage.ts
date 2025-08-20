import { type PastPaper, type InsertPastPaper, type Sale, type InsertSale, type Admin, type InsertAdmin, type User, type InsertUser, type UserPurchase, type InsertUserPurchase } from "@shared/schema";

export interface IStorage {
  // Past Papers
  getPastPapers(): Promise<PastPaper[]>;
  getPastPaperById(id: number): Promise<PastPaper | undefined>;
  createPastPaper(paper: InsertPastPaper): Promise<PastPaper>;
  updatePastPaper(id: number, paper: Partial<InsertPastPaper>): Promise<PastPaper | undefined>;
  deletePastPaper(id: number): Promise<boolean>;
  
  // Sales
  getSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Admin
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User Purchases
  createUserPurchase(purchase: InsertUserPurchase): Promise<UserPurchase>;
  getUserPurchases(userId: number): Promise<UserPurchase[]>;
  
  // Analytics
  getTotalSales(): Promise<number>;
  getTotalPapersSold(): Promise<number>;
  getRecentSales(limit: number): Promise<Sale[]>;
}

export class MemStorage implements IStorage {
  private pastPapers: Map<number, PastPaper>;
  private sales: Map<number, Sale>;
  private admins: Map<number, Admin>;
  private users: Map<number, User>;
  private userPurchases: Map<number, UserPurchase>;
  private nextId: number;

  constructor() {
    this.pastPapers = new Map();
    this.sales = new Map();
    this.admins = new Map();
    this.users = new Map();
    this.userPurchases = new Map();
    this.nextId = 1;
    
    this.initializeDefaultAdmin();
    this.initializeSampleData();
  }

  private getNextId(): number {
    return this.nextId++;
  }

  private async initializeDefaultAdmin() {
    const defaultAdmin: Admin = {
      id: this.getNextId(),
      username: "admin",
      password: "admin123", // In real app, this would be hashed
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);
  }

  private async initializeSampleData() {
    // Add some sample past papers
    const samplePapers: InsertPastPaper[] = [
      {
        title: "Grade 3 Mathematics Term 2 2023",
        description: "Comprehensive mathematics past paper covering numbers, geometry, and basic algebra concepts.",
        grade: "Grade 3",
        subject: "Mathematics",
        price: 120,
        fileUrl: "/sample-papers/grade3-math-term2.pdf",
        fileName: "grade3-math-term2.pdf"
      },
      {
        title: "Grade 2 English Term 1 2023",
        description: "Complete English assessment covering reading comprehension, grammar, and writing skills.",
        grade: "Grade 2",
        subject: "English",
        price: 100,
        fileUrl: "/sample-papers/grade2-english-term1.pdf",
        fileName: "grade2-english-term1.pdf"
      },
      {
        title: "PP2 Kiswahili Term 3 2023",
        description: "Kiswahili assessment for pre-primary 2 students with basic vocabulary and reading exercises.",
        grade: "PP2",
        subject: "Kiswahili",
        price: 80,
        fileUrl: "/sample-papers/pp2-kiswahili-term3.pdf",
        fileName: "pp2-kiswahili-term3.pdf"
      }
    ];

    for (const paper of samplePapers) {
      await this.createPastPaper(paper);
    }
  }

  async getPastPapers(): Promise<PastPaper[]> {
    return Array.from(this.pastPapers.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPastPaperById(id: number): Promise<PastPaper | undefined> {
    return this.pastPapers.get(id);
  }

  async createPastPaper(paper: InsertPastPaper): Promise<PastPaper> {
    const id = this.getNextId();
    const newPaper: PastPaper = {
      ...paper,
      id,
      createdAt: new Date(),
    };
    this.pastPapers.set(id, newPaper);
    return newPaper;
  }

  async updatePastPaper(id: number, paper: Partial<InsertPastPaper>): Promise<PastPaper | undefined> {
    const existing = this.pastPapers.get(id);
    if (!existing) return undefined;
    
    const updated: PastPaper = { ...existing, ...paper };
    this.pastPapers.set(id, updated);
    return updated;
  }

  async deletePastPaper(id: number): Promise<boolean> {
    return this.pastPapers.delete(id);
  }

  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.getNextId();
    const newSale: Sale = {
      ...sale,
      id,
      status: "completed",
      createdAt: new Date(),
    };
    this.sales.set(id, newSale);
    return newSale;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = this.getNextId();
    const newAdmin: Admin = {
      ...admin,
      id,
    };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.getNextId();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async createUserPurchase(purchase: InsertUserPurchase): Promise<UserPurchase> {
    const id = this.getNextId();
    const newPurchase: UserPurchase = {
      ...purchase,
      id,
      purchasedAt: new Date(),
    };
    this.userPurchases.set(id, newPurchase);
    return newPurchase;
  }

  async getUserPurchases(userId: number): Promise<UserPurchase[]> {
    return Array.from(this.userPurchases.values())
      .filter(purchase => purchase.userId === userId)
      .sort((a, b) => new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime());
  }

  async getTotalSales(): Promise<number> {
    return Array.from(this.sales.values()).reduce((sum, sale) => sum + sale.totalAmount, 0);
  }

  async getTotalPapersSold(): Promise<number> {
    return Array.from(this.sales.values()).reduce((sum, sale) => {
      const paperIds = Array.isArray(sale.paperIds) ? sale.paperIds : JSON.parse(sale.paperIds as string);
      return sum + paperIds.length;
    }, 0);
  }

  async getRecentSales(limit: number): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();