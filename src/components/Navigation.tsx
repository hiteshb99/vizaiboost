import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, LayoutDashboard, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Create a separate component/logic for credits if needed, but direct fetch is fine.
  const { data: creditData } = useQuery({
    queryKey: ['/api/payment/credits'],
    queryFn: async () => {
      if (!user) return { credits: 0 };
      const res = await fetch('/api/payment/credits');
      if (!res.ok) return { credits: 0 };
      return res.json();
    },
    enabled: !!user // Only fetch if logged in
  });

  const credits = creditData?.credits || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/90 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background shadow-[0_0_15px_rgba(0,191,255,0.4)] group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          VIZAI
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          <a href="/#how-it-works" className="text-sm font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest">How It Works</a>
          <Link href="/pricing" className={`text-sm font-bold uppercase tracking-widest transition-colors ${location === "/pricing" ? "text-primary" : "text-white/50 hover:text-white"}`}>Pricing</Link>
          <a href="/#portfolio" className="text-sm font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest">Portfolio</a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {/* Credit Badge */}
              <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mr-2">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-sm font-bold text-white">{credits}</span>
                <a href="/pricing" className="ml-2 text-[10px] font-bold text-primary hover:text-white uppercase tracking-wider">+ ADD</a>
              </div>

              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:text-primary gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button onClick={() => logout()} variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-background font-bold shadow-[0_0_20px_rgba(0,191,255,0.3)] hover:shadow-[0_0_30px_rgba(0,191,255,0.5)] transition-all">
                Claim 15 Credits
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-card border-b border-white/5 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg font-medium py-2 px-4 rounded-lg hover:bg-white/5 ${location === link.href ? "text-primary bg-white/5" : "text-muted-foreground"
                }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-start" variant="ghost">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={() => { logout(); setMobileOpen(false); }} className="w-full justify-start" variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-background font-bold">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
