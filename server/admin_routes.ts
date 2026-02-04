import { Express } from "express";
import { storage } from "./storage";
import { isAdmin } from "./auth";

export function registerAdminRoutes(app: Express) {
    // Get all users
    app.get("/api/admin/users", isAdmin, async (req, res) => {
        try {
            const users = await storage.getAllUsers();
            res.json(users);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get all orders
    app.get("/api/admin/orders", isAdmin, async (req, res) => {
        try {
            const orders = await storage.getAllOrders();
            res.json(orders);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get platform stats
    app.get("/api/admin/stats", isAdmin, async (req, res) => {
        try {
            const users = await storage.getAllUsers();
            const orders = await storage.getAllOrders();

            const stats = {
                totalUsers: users.length,
                totalOrders: orders.length,
                totalRevenue: orders.reduce((acc, order) => acc + (order.totalAmountCents || 0), 0) / 100,
                activeUsers: users.filter(u => u.credits > 0).length,
            };

            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update user role (e.g., make someone an admin)
    app.post("/api/admin/users/:id/role", isAdmin, async (req, res) => {
        try {
            const { role } = req.body;
            const userId = String(req.params.id);
            const user = await storage.updateUserRole(userId, role);
            res.json(user);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Add credits to user
    app.post("/api/admin/users/:id/credits", isAdmin, async (req, res) => {
        try {
            const { credits } = req.body;
            const userId = String(req.params.id);
            const user = await storage.getUser(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            const updatedUser = await storage.updateUserCredits(userId, (user.credits || 0) + credits);
            res.json(updatedUser);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
}
