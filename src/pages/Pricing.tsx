import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Gem, Sparkles } from "lucide-react";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { BrandingIntakeModal } from "@/components/branding/BrandingIntakeModal";
import { motion } from "framer-motion";

export default function Pricing() {
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string, price: string } | null>(null);
  const [showIntake, setShowIntake] = useState(false);
  const [intakeData, setIntakeData] = useState<Record<string, string>>({});

  const products = [
    {
      id: "ai-single",
      name: "Single AI Snap",
      price: "$4.99",
      period: "per image",
      icon: Zap,
      desc: "Perfect for a quick product shot",
      features: ["1 High-Res Download", "Instant Delivery", "Commercial License", "Standard Resolution"],
      cta: "Get Started",
      highlight: false,
      requiresIntake: false,
      delay: 0.1
    },
    {
      id: "creator-pack",
      name: "Creator Pack",
      price: "$29.99",
      period: "for 10 images",
      icon: Star,
      desc: "Best value for small catalogs",
      features: ["10 High-Res Downloads", "Priority Generation", "Commercial License", "4K Resolution Support"],
      cta: "Buy Pack",
      highlight: true,
      requiresIntake: false,
      delay: 0.2
    },
    {
      id: "branding-service",
      name: "Brand Polish",
      price: "$99.00",
      period: "one-time service",
      icon: Gem,
      desc: "Human-refined for perfection",
      features: ["Manual Human Editing", "Logo Integration", "Color Correction", "24h Turnaround", "Dedicated Designer"],
      cta: "Book Service",
      highlight: false,
      requiresIntake: true,
      delay: 0.3
    },
  ];

  const handleProductSelect = (product: typeof products[0]) => {
    setSelectedProduct(product);
    if (product.requiresIntake) {
      setShowIntake(true);
    }
  };

  const handleIntakeComplete = (data: Record<string, string>) => {
    setIntakeData(data);
    setShowIntake(false);
  };

  const closeModals = () => {
    setSelectedProduct(null);
    setShowIntake(false);
    setIntakeData({});
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Pricing Plans | VizAI Boost</title>
        <meta name="description" content="Simple, transparent pricing for AI product photography. Pay as you go or get professional branding services." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 blur-[150px] rounded-full sm:pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-secondary/10 blur-[150px] rounded-full sm:pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl">
              Simple <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-xl text-white/60 font-light">
              No subscriptions. Pay for what you need.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: product.delay, duration: 0.5 }}
                className={`relative rounded-[2rem] p-8 flex flex-col transition-all duration-300 group hover:translate-y-[-10px] ${product.highlight
                    ? 'glass-card border-primary/30 shadow-[0_0_40px_rgba(0,191,255,0.15)] bg-primary/5'
                    : 'glass-card hover:bg-white/10'
                  }`}
              >
                {product.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-black" /> Best Value
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${product.highlight ? 'bg-primary text-background' : 'bg-white/10 text-white'
                    }`}>
                    <product.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-white/50 text-sm">{product.desc}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white tracking-tight">{product.price}</span>
                    <span className="ml-2 text-sm text-white/40 font-bold uppercase tracking-wider">{product.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-center text-sm text-white/70 font-medium">
                      <div className={`mr-4 p-1 rounded-full ${product.highlight ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/50'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleProductSelect(product)}
                  className={`w-full h-14 rounded-xl font-black text-lg transition-all duration-300 ${product.highlight
                      ? 'bg-primary hover:bg-primary/90 text-background shadow-xl hover:shadow-primary/20 hover:scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/5 hover:border-white/20'
                    }`}
                >
                  {product.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <BrandingIntakeModal
          isOpen={showIntake}
          onClose={closeModals}
          onProceedToCheckout={handleIntakeComplete}
        />

        <PaymentModal
          isOpen={!!selectedProduct && !showIntake}
          onClose={closeModals}
          productId={selectedProduct?.id || ""}
          productName={selectedProduct?.name || ""}
          price={selectedProduct?.price || ""}
          metadata={intakeData}
        />
      </div>
    </PageTransition>
  );
}
