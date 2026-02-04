import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productPrice: string;    // Display price "$4.99"
    stripeProductId?: string; // If buying directly with Stripe
    creditCost?: number;      // If paying with credits (e.g., 5)
    userCredits?: number;     // Current user balance
    onSuccess?: () => void;
    metadata?: Record<string, string>;
}

export function PaymentModal({ isOpen, onClose, productName, productPrice, stripeProductId, creditCost = 0, userCredits = 0, onSuccess, metadata }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // 1. Pay with Stripe (Cash)
    const handleStripeCheckout = async () => {
        if (!stripeProductId) return;
        setLoading(true);
        try {
            const response = await fetch("/api/payment/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: stripeProductId, metadata }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Checkout failed");
            if (data.url) window.location.href = data.url;
            else onSuccess?.(); // Dev bypass
        } catch (error: any) {
            console.error(error);
            toast({ title: "Checkout Failed", description: "Could not initiate Stripe checkout.", variant: "destructive" });
            setLoading(false);
        }
    };

    // 2. Pay with Credits
    const handleCreditSpend = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/payment/spend-credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: creditCost, description: `Purchase: ${productName}` }),
            });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 402) {
                    toast({ title: "Insufficient Credits", description: "Please top up your wallet.", variant: "destructive" });
                    // Could switch to 'buy credits' mode here
                }
                throw new Error(data.error || "Transaction failed");
            }

            toast({ title: "Purchase Successful", description: `${creditCost} credits deducted.` });
            onSuccess?.();
            onClose();

        } catch (error: any) {
            console.error(error);
            toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const canPayWithCredits = creditCost > 0 && userCredits >= creditCost;
    const isCreditPurchase = !stripeProductId; // If no stripe ID, it's a credit-only item (or mixed)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Confirm Purchase</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Unlock <span className="font-bold text-white">{productName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 text-center space-y-4">
                    {/* Price Display */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        {creditCost > 0 && (
                            <div className="flex items-center gap-2 text-3xl font-black text-yellow-400">
                                <Coins className="w-8 h-8" />
                                <span>{creditCost}</span>
                            </div>
                        )}
                        {stripeProductId && (
                            <div className="text-xl text-muted-foreground">
                                or {productPrice}
                            </div>
                        )}
                    </div>

                    {/* Insufficient Funds Warning */}
                    {creditCost > 0 && userCredits < creditCost && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-200">
                            You have <b>{userCredits} credits</b>. You need <b>{creditCost}</b>.
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    {/* Primary Action: Spend Credits */}
                    {canPayWithCredits && (
                        <Button
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold h-12 text-lg"
                            onClick={handleCreditSpend}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay with ${creditCost} Credits`}
                        </Button>
                    )}

                    {/* Secondary/Fallback: Buy Credits or Pay Cash */}
                    {(!canPayWithCredits || stripeProductId) && (
                        <div className="w-full space-y-3 pt-2">
                            {stripeProductId ? (
                                <Button
                                    className="w-full bg-white text-black hover:bg-white/90 font-black h-12 text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                                    onClick={handleStripeCheckout}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Complete Purchase ${productPrice}`}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-primary text-black font-bold h-12"
                                    onClick={() => window.location.href = '/pricing'}
                                >
                                    Top Up Credits
                                </Button>
                            )}

                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                <Shield className="w-3 h-3" />
                                Secure Checkout with Stripe
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Coins, Shield } from "lucide-react";
