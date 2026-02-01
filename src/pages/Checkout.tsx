import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Checkout() {
    const [location] = useLocation();
    const [status, setStatus] = useState<'loading' | 'success' | 'canceled'>('loading');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Parse query params manually since wouter doesn't have a built-in hook for it
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const session = params.get("session_id");

        if (session) {
            setSessionId(session);
            setStatus('success');
            // In a real app, you might want to verify this session with the backend
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
                        <div className="grid gap-2">
                            <Link href="/dashboard">
                                <Button className="w-full font-bold">Go to Dashboard</Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full">Back to Home</Button>
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
