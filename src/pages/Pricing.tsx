import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Gem, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { PaymentModal } from "@/components/payment/PaymentModal";

export default function Pricing() {

  const products = [
    {
      id: "ai-single",
      name: "Starter Pass",
      price: "$19.99",
      creditAmount: "50 CREDITS",
      icon: Zap,
      desc: "Essential toolkit for independent creators.",
      features: ["50 Studio Credits", "~10 Ultra-HD Exports", "Commercial License", "Standard Support"],
      cta: "Unlock Starter Pass",
      highlight: false,
      stripeProductId: "prod_starter_pack",
      metadata: { creditAmount: "50", productId: "credit_starter" },
      delay: 0.1,
    },
    {
      id: "brand-polish",
      name: "Pro Studio",
      price: "$49.99",
      creditAmount: "150 CREDITS",
      icon: Star,
      desc: "High-volume generation for growing brands.",
      features: ["150 Studio Credits", "~30 Ultra-HD Exports", "Priority GPU Queue", "Batch Mode Access"],
      cta: "Unlock Pro Studio",
      highlight: true,
      stripeProductId: "prod_pro_pack",
      metadata: { creditAmount: "150", productId: "credit_pro" },
      delay: 0.15,
    },
    {
      id: "brand-subscription",
      name: "Agency Vault",
      price: "$199.99",
      creditAmount: "1000 CREDITS",
      icon: Gem,
      desc: "Unrestricted power for professional teams.",
      features: ["1000 Studio Credits", "Human Polish Access", "Dedicated Slack Channel", "White-Glove Onboarding"],
      cta: "Unlock Agency Vault",
      highlight: false,
      stripeProductId: "prod_agency_pack",
      metadata: { creditAmount: "1000", productId: "credit_agency" },
      delay: 0.2,
    },
  ];

  // Payment Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleProductSelect = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setIsPaymentOpen(true);
  };



  return (
    <PageTransition>
      <Helmet>
        <title>Pricing Plans | VizAI</title>
        <meta name="description" content="Simple, transparent pricing for AI product photography. Pay as you go or get professional branding services." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-background">
        {/* Cinematic Background */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Commercial License Included</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
              INVEST IN <br />
              <span className="text-gradient">PERFECTION</span>
            </h1>
            <p className="text-xl text-white/40 font-light max-w-2xl mx-auto leading-relaxed">
              Premium optics, cinematic lighting, and agency-grade branding. <br />
              Choose the package that aligns with your vision.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Stripe Secured</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                <Star className="w-4 h-4 text-primary fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Studio Verified</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Gemini 2.5 Powered</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {products.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: product.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-[2.5rem] p-10 flex flex-col transition-all duration-700 group border h-full ${product.highlight
                  ? 'bg-white/[0.03] border-primary/50 shadow-[0_0_50px_-10px_rgba(0,191,255,0.2)]' // enhanced highlight
                  : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                  }`}
              >
                {product.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </div>
                )}

                <div className="mb-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110 shadow-2xl ${product.highlight ? 'bg-primary text-background' : 'bg-white/5 text-white/60 border border-white/10'
                    }`}>
                    <product.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">{product.name}</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">{product.desc}</p>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white uppercase tracking-tighter italic">{product.price}</span>
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{product.creditAmount}</span>
                  </div>
                </div>

                <ul className="space-y-6 mb-12 flex-grow">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-4 text-sm text-white/60 font-medium group/feat">
                      <div className={`mt-1 p-1 rounded-full transition-colors ${product.highlight ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/30'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="group-hover/feat:text-white transition-colors uppercase tracking-tight font-black text-[11px]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleProductSelect(product)}
                  className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${product.highlight
                    ? 'bg-primary hover:bg-white text-background shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                    }`}
                >
                  {product.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        productName={selectedProduct?.name || ""}
        productPrice={selectedProduct?.price || ""}
        stripeProductId={selectedProduct?.stripeProductId}
        // No credit cost, this is a PURCHASE mode
        onSuccess={() => {
          setIsPaymentOpen(false);
          window.location.href = '/dashboard';
        }}
        metadata={selectedProduct?.metadata}
      />
    </PageTransition >
  );
}
