import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Checkout() {
    const [location] = useLocation();
    const [status, setStatus] = useState<'loading' | 'success' | 'canceled'>('loading');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
        // Parse query params manually since wouter doesn't have a built-in hook for it
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const session = params.get("session_id");

        if (session) {
            setSessionId(session);
            setStatus('success');

            // Fetch order details from backend
            fetch(`/api/payment/session/${session}`)
                .then(res => res.json())
                .then(data => {
                    if (data.order) {
                        setOrderData(data.order);
                    }
                })
                .catch(err => console.error('Failed to fetch order:', err));
        } else {
            // Check if it's the cancel route or just empty
            if (window.location.pathname.includes('cancel')) {
                setStatus('canceled');
            } else if (window.location.pathname.includes('result') && !session) {
                // Error state if result page but no session
                setStatus('canceled');
            }
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-card/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                        {status === 'canceled' && <XCircle className="h-12 w-12 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {status === 'loading' && "Processing..."}
                        {status === 'success' && "Payment Successful!"}
                        {status === 'canceled' && "Payment Canceled"}
                    </CardTitle>
                    <CardDescription>
                        {status === 'success' && "Your order has been confirmed. Check your email for details."}
                        {status === 'canceled' && "No charges were made."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'success' && (
                        <div className="grid gap-3">
                            {orderData?.metadata?.imageUrl && (
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Your Purchase</p>
                                    <img src={orderData.metadata.imageUrl} alt="Purchased image" className="w-full rounded-lg mb-3" />
                                    <Button
                                        onClick={() => window.open(orderData.metadata.imageUrl, '_blank')}
                                        className="w-full bg-primary text-black font-black"
                                    >
                                        DOWNLOAD HIGH-RES IMAGE
                                    </Button>
                                </div>
                            )}
                            <Link href="/">
                                <Button variant="outline" className="w-full">Generate Another</Button>
                            </Link>
                        </div>
                    )}
                    {status === 'canceled' && (
                        <div className="grid gap-2">
                            <Link href="/pricing">
                                <Button className="w-full">Try Again</Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full">Back to Home</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
