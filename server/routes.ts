import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPastPaperSchema, insertSaleSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import multer, { FileFilterCallback } from "multer";
import path from "path";

// Extend Express Request to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export function registerRoutes(app: Express): Server {
  // Setup authentication middleware
  setupAuth(app);

  // User routes
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ ...req.user, password: undefined });
  });

  // User purchase history
  app.get('/api/user/purchases', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = (req.user as any).id;
      const purchases = await storage.getUserPurchases(userId);
      
      // Get paper details for each purchase
      const purchasesWithPapers = await Promise.all(
        purchases.map(async (purchase) => {
          const paper = purchase.paperId ? await storage.getPastPaperById(purchase.paperId) : null;
          return {
            ...purchase,
            paper
          };
        })
      );
      
      res.json(purchasesWithPapers);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Past Papers Routes
  app.get("/api/past-papers", async (req, res) => {
    try {
      const papers = await storage.getPastPapers();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch past papers" });
    }
  });

  app.get("/api/past-papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paper = await storage.getPastPaperById(id);
      if (!paper) {
        return res.status(404).json({ message: "Past paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch past paper" });
    }
  });

  app.post("/api/past-papers", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      const validatedData = insertPastPaperSchema.parse({
        ...req.body,
        price: parseInt(req.body.price),
        fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
        fileName: req.file ? req.file.originalname : ''
      });

      const paper = await storage.createPastPaper(validatedData);
      res.status(201).json(paper);
    } catch (error) {
      res.status(400).json({ message: "Failed to create past paper", error: error });
    }
  });

  app.put("/api/past-papers/:id", async (req, res) => {
    try {
      const updates = {
        ...req.body,
        ...(req.body.price && { price: parseInt(req.body.price) })
      };
      
      const id = parseInt(req.params.id);
      const paper = await storage.updatePastPaper(id, updates);
      if (!paper) {
        return res.status(404).json({ message: "Past paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(400).json({ message: "Failed to update past paper" });
    }
  });

  app.delete("/api/past-papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePastPaper(id);
      if (!success) {
        return res.status(404).json({ message: "Past paper not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete past paper" });
    }
  });

  // Sales Routes
  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse({
        ...req.body,
        totalAmount: parseInt(req.body.totalAmount)
      });

      const sale = await storage.createSale(validatedData);
      
      // If user is authenticated, record their purchases
      if (req.isAuthenticated && req.isAuthenticated() && (req as any).user?.id) {
        const userId = (req as any).user.id;
        const paperIds = Array.isArray(validatedData.paperIds) ? validatedData.paperIds : [];
        for (const paperId of paperIds) {
          await storage.createUserPurchase({
            userId,
            paperId: Number(paperId),
            saleId: sale.id
          });
        }
      }
      
      // Mock email sending
      const paperIds = Array.isArray(sale.paperIds) ? sale.paperIds : [];
      console.log(`📧 Email sent to ${sale.customerEmail} with ${paperIds.length} past papers`);
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Failed to process sale", error: error });
    }
  });

  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Payment Routes
  app.post("/api/payments/mpesa", async (req, res) => {
    try {
      // Mock M-Pesa payment processing
      const { phoneNumber, amount } = req.body;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      res.json({
        success: true,
        transactionId: `MP${Date.now()}`,
        message: "Payment processed successfully via M-Pesa"
      });
    } catch (error) {
      res.status(500).json({ message: "M-Pesa payment failed" });
    }
  });

  app.post("/api/payments/visa", async (req, res) => {
    try {
      // Mock Visa payment processing
      const { cardNumber, expiryDate, cvv, amount } = req.body;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful payment
      res.json({
        success: true,
        transactionId: `VISA${Date.now()}`,
        message: "Payment processed successfully via Visa"
      });
    } catch (error) {
      res.status(500).json({ message: "Visa payment failed" });
    }
  });

  // Admin Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        success: true, 
        admin: { id: admin.id, username: admin.username }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Analytics Routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const totalSales = await storage.getTotalSales();
      const totalPapersSold = await storage.getTotalPapersSold();
      const recentSales = await storage.getRecentSales(5);
      
      res.json({
        totalSales,
        totalPapersSold,
        recentSales,
        activeUsers: 567, // Mock data
        successRate: 98.5 // Mock data
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Serve uploaded files
  app.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
    res.sendFile(filePath);
  });

  const httpServer = createServer(app);
  return httpServer;
}
