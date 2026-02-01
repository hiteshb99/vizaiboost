import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandingIntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProceedToCheckout: (formData: Record<string, string>) => void;
}

export function BrandingIntakeModal({ isOpen, onClose, onProceedToCheckout }: BrandingIntakeModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        brandName: "",
        instructions: "",
        logoUrl: "",
        referenceUrl: ""
    });

    const { toast } = useToast();

    // File refs
    const logoInputRef = useRef<HTMLInputElement>(null);
    const refInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File, field: 'logoUrl' | 'referenceUrl') => {
        setLoading(true);
        const form = new FormData();
        form.append('file', file);

        try {
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                body: form
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setFormData(prev => ({ ...prev, [field]: data.url }));
            toast({ title: "Upload Complete", description: "File successfully attached." });
        } catch (error) {
            console.error(error);
            toast({ title: "Upload Failed", description: "Could not upload file. Try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!formData.brandName) {
            toast({ title: "Missing Information", description: "Please enter your brand name.", variant: "destructive" });
            return;
        }
        // Proceed
        onProceedToCheckout(formData);
    };

    const reset = () => {
        setStep(1);
        setFormData({ brandName: "", instructions: "", logoUrl: "", referenceUrl: "" });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-lg bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Professional Branding Service</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === 1 ? "Tell us about your brand." : "Upload your assets."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="brandName">Brand Name</Label>
                                <Input
                                    id="brandName"
                                    placeholder="e.g. Acme Corp"
                                    value={formData.brandName}
                                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instructions">Instructions / Notes</Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="Describe your style (e.g. 'Minimalist, Use hex code #FF5733 for borders')"
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="bg-background/50 border-white/10 min-h-[100px]"
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>Brand Logo (Transparent PNG preferred)</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full h-24 border-dashed border-white/20 hover:border-primary/50 flex flex-col gap-2"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        {formData.logoUrl ? (
                                            <span className="text-green-500 font-bold flex items-center"><CheckIcon className="w-4 h-4 mr-2" /> Logo Uploaded</span>
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Click to upload logo</span>
                                            </>
                                        )}
                                    </Button>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logoUrl')}
                                    />
                                </div>
                            </div>

                            {/* Reference Upload with Camera Support */}
                            <div className="space-y-2">
                                <Label>Reference Photo (Optional)</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full h-24 border-dashed border-white/20 hover:border-primary/50 flex flex-col gap-2"
                                        onClick={() => refInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        {formData.referenceUrl ? (
                                            <span className="text-green-500 font-bold flex items-center"><CheckIcon className="w-4 h-4 mr-2" /> Reference Added</span>
                                        ) : (
                                            <>
                                                <div className="flex gap-2">
                                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                                    <Camera className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <span className="text-xs text-muted-foreground">Upload or Take Photo</span>
                                            </>
                                        )}
                                    </Button>
                                    <input
                                        type="file"
                                        ref={refInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        capture="environment" /* Enables camera on mobile */
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'referenceUrl')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    ) : (
                        <div /> /* Spacer */
                    )}

                    {step === 1 ? (
                        <Button onClick={() => setStep(2)} className="w-full sm:w-auto">Next: Upload Assets</Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            className="w-full sm:w-auto bg-primary text-primary-foreground font-bold"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proceed to Payment"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
