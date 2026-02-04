import express from "express";
import { stripe, getBaseUrl } from "../services/stripe";
import { storage } from "../storage";
import { z } from "zod";

import { isAuthenticated } from "../auth";

const router = express.Router();

// Validation schemas
const checkoutSchema = z.object({
    productId: z.string(),
    metadata: z.record(z.string()).optional(),
});

/**
 * create-checkout-session
 * Handles one-time purchase intent
 */
router.post("/checkout", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.user as any)?.id || null;

        // Parse body
        const body = checkoutSchema.parse(req.body);

        // Get Product
        const product = await storage.getProduct(body.productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Create a pending order in our DB
        const order = await storage.createOrder({
            userId,
            totalAmountCents: product.priceCents,
            status: "pending", // Waiting for payment
            stripeSessionId: null
        });

        // Determine Stripe Mode
        const isSubscription = body.productId.includes('subscription');
        const mode = isSubscription ? "subscription" : "payment";

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        description: product.description || undefined,
                    },
                    unit_amount: product.priceCents,
                    ...(isSubscription && {
                        recurring: {
                            interval: "month",
                        },
                    }),
                },
                quantity: 1,
            }],
            mode: mode,
            success_url: `${getBaseUrl()}/checkout/result?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${getBaseUrl()}/pricing`,
            client_reference_id: order.id.toString(),
            metadata: {
                orderId: order.id.toString(),
                productId: product.id,
                ...body.metadata
            }
        });

        // Update order with session ID
        await storage.updateOrder(order.id, { stripeSessionId: session.id });

        // Respond with URL for frontend redirect
        res.json({ url: session.url });

    } catch (error: any) {
        console.error("Checkout error:", error);
        // If Zod error
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message || "Checkout initialization failed" });
    }
});

/**
 * Get session details
 * Retrieves order information for a completed checkout session
 */
router.get("/session/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // Get the order from database using the session ID
        const order = await storage.getOrderByStripeSession(sessionId);

        res.json({
            session: {
                id: session.id,
                status: session.status,
                payment_status: session.payment_status,
            },
            order: order || null
        });
    } catch (error) {
        console.error("Session retrieval error:", error);
        res.status(500).json({ error: "Failed to retrieve session" });
    }
});

/**
 * Webhook handler
 * Must use raw body for signature verification
 */
router.post("/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.warn("Webhook Error: STRIPE_WEBHOOK_SECRET is not set");
        return res.status(500).send("Webhook configuration error");
    }

    let event;

    try {
        if (!sig) throw new Error("Missing signature");

        // server/index.ts captures 'rawBody'
        const rawBody = (req as any).rawBody;
        if (!rawBody) {
            throw new Error("Raw body not available for signature verification");
        }

        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const orderId = parseInt(session.client_reference_id);

        if (orderId && !isNaN(orderId)) {
            try {
                // 1. Mark Order as Paid
                await storage.updateOrder(orderId, { status: "paid" });

                // 2. Log Transaction
                await storage.createTransaction({
                    orderId,
                    provider: "stripe",
                    providerTransactionId: session.payment_intent as string,
                    status: "success",
                    amountCents: session.amount_total!,
                    rawResponse: session
                });

                // 3. Fulfill Credits if applicable
                const order = await storage.getOrder(orderId);
                const orderProduct = await storage.getProduct(session.metadata.productId);

                if (order && order.userId && orderProduct && orderProduct.type === 'credits') {
                    const user = await storage.getUser(order.userId);
                    if (user) {
                        const creditAmount = parseInt(session.metadata.creditAmount || '0') || 0;
                        if (creditAmount > 0) {
                            await storage.updateUserCredits(user.id, user.credits + creditAmount);
                            console.log(`Added ${creditAmount} credits to user ${user.id}`);
                        }
                    }
                }

                console.log(`Order ${orderId} marked as paid.`);
                // TODO: Send email
            } catch (e) {
                console.error("Failed to update order after webhook:", e);
                // We return 200 anyway to Stripe so they don't retry indefinitely
                // But we should alert admin/logs
            }
        }
    }

    res.json({ received: true });
});

/**
 * Get Credit Balance
 */
router.get("/credits", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const user = await storage.getUser(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ credits: user.credits });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * Spend Credits
 * Used when user clicks "Export" or "Purchase" using balance
 */
router.post("/spend-credits", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { amount, description } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

        const user = await storage.getUser(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.credits < amount) {
            return res.status(402).json({ error: "Insufficient credits", currentBalance: user.credits });
        }

        // Deduct credits
        const remaining = user.credits - amount;
        await storage.updateUserCredits(userId, remaining);

        // Record transaction (internal spend)
        // We accept that 'order_id' is null for internal credit spends for now, or create a $0 order.
        // For now, simpler is better.

        console.log(`User ${userId} spent ${amount} credits on ${description}`);

        res.json({ success: true, remainingCredits: remaining });

    } catch (error) {
        console.error("Spend Credits Error:", error);
        res.status(500).json({ error: "Transaction failed" });
    }
});

/**
 * Claim Free Trial (Testing only)
 */
router.post("/trial", isAuthenticated, async (req, res) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const user = await storage.getUser(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Add 50 credits
        await storage.updateUserCredits(userId, (user.credits || 0) + 50);

        res.json({ success: true, message: "Trial credits added" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add trial credits" });
    }
});

export function registerPaymentRoutes(app: express.Express) {
    app.use("/api/payment", router);
}
