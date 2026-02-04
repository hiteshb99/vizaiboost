import { PageTransition } from "@/components/PageTransition";
import {
    Users,
    ShoppingBag,
    BarChart3,
    Shield,
    Search,
    ArrowUpRight,
    Plus,
    UserPlus,
    MoreVertical,
    Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Fetch Admin Stats
    const { data: stats } = useQuery({
        queryKey: ['/api/admin/stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error("Not authorized");
            return res.json();
        }
    });

    // 2. Fetch All Users
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['/api/admin/users'],
        queryFn: async () => {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    // 3. Mutations
    const addCreditsMutation = useMutation({
        mutationFn: async ({ userId, amount }: { userId: string, amount: number }) => {
            const res = await fetch(`/api/admin/users/${userId}/credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credits: amount })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
            toast({ title: "Credits Added", description: "The user balance has been updated." });
        }
    });

    const filteredUsers = users?.filter((u: any) =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (usersLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white/50">Loading Admin Hub...</div>;

    return (
        <PageTransition>
            <div className="min-h-screen pt-32 pb-20 bg-background text-white">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Founder <span className="text-primary italic">CORE</span></h1>
                                <p className="text-white/40 text-sm mt-1">Platform-wide management & analytics.</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid md:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
                            { label: "Total Revenue", value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: ShoppingBag, color: "text-green-500" },
                            { label: "Active Now", value: stats?.activeUsers || 0, icon: BarChart3, color: "text-primary" },
                            { label: "Total Orders", value: stats?.totalOrders || 0, icon: ArrowUpRight, color: "text-purple-500" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-3">
                                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                                    <p className="text-2xl font-black">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Management Area */}
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* User Management */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black uppercase italic tracking-wider">Photographers Registry</h2>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <Input
                                        placeholder="Search by email..."
                                        className="pl-10 bg-white/5 border-white/10 rounded-xl"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Level</th>
                                            <th className="px-6 py-4 text-center">Credits</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers?.map((u: any) => (
                                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold">{u.firstName} {u.lastName}</p>
                                                        <p className="text-xs text-white/30">{u.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/10 text-white/40'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-mono text-sm">{u.credits}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-3 text-[10px] font-black uppercase text-primary hover:bg-primary/10"
                                                            onClick={() => addCreditsMutation.mutate({ userId: u.id, amount: 50 })}
                                                        >
                                                            +50 CREDITS
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Queue */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black uppercase italic tracking-wider">Order Queue</h2>
                            <div className="space-y-4">
                                {stats?.totalOrders === 0 ? (
                                    <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                                        <ShoppingBag className="w-8 h-8 text-white/10 mx-auto mb-4" />
                                        <p className="text-sm text-white/30 italic">No revenue yet. Focus on growth.</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/40 italic">Active orders will appear here...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
