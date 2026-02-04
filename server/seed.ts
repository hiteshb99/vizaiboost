import { storage } from "../server/storage";
import { insertProductSchema } from "../shared/schema";

async function seed() {
    console.log("🌱 Seeding commercial products...");

    const initialProducts = [
        {
            id: "ai-single",
            name: "Single AI Snap",
            description: "Perfect for a quick product shot with commercial license.",
            priceCents: 499,
            type: "ai-image",
            active: true
        },
        {
            id: "brand-polish",
            name: "Brand Polish",
            description: "Logo integration + custom professional framing for your AI-generated asset.",
            priceCents: 9900,
            type: "branding-service",
            active: true
        },
        {
            id: "brand-subscription",
            name: "Brand Subscription",
            description: "Unlimited High-Res Generations + Unlimited Brand Polishes per month.",
            priceCents: 29900,
            type: "branding-service",
            active: true
        },
        {
            id: "enterprise-campaign",
            name: "Enterprise Campaign",
            description: "Full 50-item SKU cataloging with Custom AI-Influencers & Motion.",
            priceCents: 249900,
            type: "branding-service",
            active: true
        }
    ];

    for (const prod of initialProducts) {
        try {
            // Check if exists first
            const existing = await storage.getProduct(prod.id);
            if (existing) {
                console.log(`- Product ${prod.id} already exists, skipping.`);
                continue;
            }

            const validated = insertProductSchema.parse(prod);
            await storage.createProduct(validated);
            console.log(`+ Created product: ${prod.name}`);
        } catch (err) {
            console.error(`! Failed to seed ${prod.id}:`, err);
        }
    }

    console.log("✅ Seeding complete.");
}

seed().catch(console.error);
