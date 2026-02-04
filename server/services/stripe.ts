import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY is not set. Payment features will fail.");
}

// Initialize Stripe with the API key
// We default to a placeholder to allow the app to start even if the key is missing (for build/test)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-08-16', // Locking to a recent stable version
    typescript: true,
});

/**
 * Helper to get the base URL of the application
 * Useful for success/cancel URLs in checkout sessions
 */
export function getBaseUrl() {
    if (process.env.REPLIT_DEV_DOMAIN) {
        return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    }
    return process.env.BASE_URL || 'http://0.0.0.0:5000';
}
