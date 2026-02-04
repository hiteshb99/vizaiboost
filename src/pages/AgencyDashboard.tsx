import { PageTransition } from "@/components/PageTransition";
import { Shield, LayoutDashboard, Users, BarChart3, Settings, Image as ImageIcon, Download, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function AgencyDashboard() {
    const [_location, setLocation] = useLocation();

    // 1. Fetch Credits
    const { data: creditData } = useQuery({
        queryKey: ['/api/payment/credits'],
        queryFn: async () => {
            const res = await fetch('/api/payment/credits');
            if (!res.ok) {
                if (res.status === 401) setLocation('/login'); // Redirect if not logged in
                return { credits: 0 };
            }
            return res.json();
        }
    });

    // 2. Fetch Uploads (Asset history)
    const { data: uploads } = useQuery({
        queryKey: ['/api/uploads'],
        queryFn: async () => {
            const res = await fetch('/api/uploads');
            if (!res.ok) return [];
            return res.json();
        }
    });

    const credits = creditData?.credits || 0;

    return (
        <PageTransition>
            <div className="min-h-screen pt-32 pb-20 bg-background text-white">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Studio <span className="text-primary italic">HUB</span></h1>
                            <p className="text-white/40 text-sm mt-1">Manage your generations and account balance.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 flex items-center gap-2">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="font-bold text-lg">{credits}</span>
                                <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Credits</span>
                                <Button size="sm" variant="ghost" className="h-6 text-xs text-primary hover:text-primary hover:bg-white/5 ml-2" onClick={() => window.location.href = '/pricing'}>
                                    + Add
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                className="border-green-500/20 text-green-500 hover:bg-green-500/10"
                                onClick={async () => {
                                    await fetch('/api/payment/trial', { method: 'POST' });
                                    window.location.reload();
                                }}
                            >
                                <Coins className="w-4 h-4 mr-2" /> Claim Trial (50)
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">{uploads?.length || 0} Assets</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">GENERATED IMAGES</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">{credits}</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">AVAILABLE CREDITS</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4">
                            {/* Placeholder for future Saved Stats */}
                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Pro Plan</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">CURRENT TIER</p>
                            </div>
                        </div>
                    </div>

                    {/* Asset Gallery */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Recent Logic</h2>

                        {(!uploads || uploads.length === 0) ? (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                                <p className="text-white/40">No generations yet. Start creating!</p>
                                <Button className="mt-4" onClick={() => window.location.href = '/'}>Go to Studio</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {uploads.map((upload: any) => (
                                    <div key={upload.id} className="group relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                                        <img src={upload.fileUrl} alt={upload.filename} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="outline" className="rounded-full border-white/20 hover:bg-white hover:text-black" onClick={() => window.open(upload.fileUrl, '_blank')}>
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
