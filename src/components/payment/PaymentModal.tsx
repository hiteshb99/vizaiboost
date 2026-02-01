import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    price: string;
    metadata?: Record<string, string>;
}

export function PaymentModal({ isOpen, onClose, productId, productName, price, metadata }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/payment/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    metadata
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Checkout failed");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                title: "Checkout Error",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Confirm Purchase</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        You are about to purchase: <span className="font-bold text-white">{productName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="text-3xl font-bold text-center mb-2">{price}</div>
                    <p className="text-center text-sm text-muted-foreground">
                        Secure processing by Stripe
                    </p>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button
                        className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleCheckout}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Proceed to Checkout
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
