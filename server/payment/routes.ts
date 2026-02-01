import express from "express";
import { stripe, getBaseUrl } from "../services/stripe";
import { storage } from "../storage";
import { z } from "zod";

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
router.post("/checkout", async (req, res) => {
    try {
        const userId = (req as any).user?.claims?.sub || null; // Matches Replit Auth

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
                },
                quantity: 1,
            }],
            mode: "payment",
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
                await storage.updateOrder(orderId, { status: "paid" });

                await storage.createTransaction({
                    orderId,
                    provider: "stripe",
                    providerTransactionId: session.payment_intent as string,
                    status: "success",
                    amountCents: session.amount_total!,
                    rawResponse: session
                });

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

export function registerPaymentRoutes(app: express.Express) {
    app.use("/api/payment", router);
}
