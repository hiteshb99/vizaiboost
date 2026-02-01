import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Layers, Sparkles, Loader2, Share2, Facebook, Twitter, Mail, ExternalLink, MessageCircle, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useState, useRef, MouseEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

// --- 3D Tilt Card Component ---
function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - left - width / 2);
    y.set(event.clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX: useTransform(mouseY, [-500, 500], [10, -10]),
        rotateY: useTransform(mouseX, [-500, 500], [-10, 10]),
      }}
      className={`relative transform-gpu perspective-1000 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// --- AI Engine (Preserved Logic, Enhanced UI) ---
function AIPreviewEngine() {
  const { toast } = useToast();
  const [stage, setStage] = useState<'idle' | 'uploading' | 'processing' | 'result'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [productName, setProductName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>('studio');
  const [selectedSocial, setSelectedSocial] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleChips = [
    { id: 'white', label: 'Plain White', emoji: '⚪', prompt: 'pure white seamless background #FFFFFF, soft studio lighting, gentle shadows, Amazon compliant, product centered filling 85% frame' },
    { id: 'studio', label: 'Studio Pro', emoji: '📸', prompt: 'Professional minimalist studio, clean neutral backdrop, softbox lighting, 8k' },
    { id: 'lifestyle', label: 'Lifestyle', emoji: '🌿', prompt: 'natural real-world integration into everyday scene, soft ambient lighting' },
    { id: 'luxury', label: 'Luxury', emoji: '✨', prompt: 'Elegant marble and velvet, dramatic rim lighting, high-end boutique feel' },
  ];

  const socialChips = [
    { id: 'ig-vertical', label: 'Instagram (4:5)', emoji: '📱', prompt: 'optimized 4:5 vertical composition, product centered, negative space' },
    { id: 'square', label: 'Square (1:1)', emoji: '□', prompt: 'perfect 1:1 square composition, product balanced' },
  ];

  const handleStyleSelect = (styleId: string, prompt: string) => {
    setSelectedStyle(styleId);
    setCustomPrompt(prev => {
      const parts = prev.split(' , ');
      const userText = parts[0] || '';
      const socialPart = parts[2] ? ` , ${parts[2]}` : '';
      return `${userText.trim()} , ${prompt}${socialPart}`.trim();
    });
  };

  const handleSocialSelect = (socialId: string, prompt: string) => {
    setSelectedSocial(socialId);
    setCustomPrompt(prev => {
      const parts = prev.split(' , ');
      const userText = parts[0] || '';
      const stylePart = parts[1] ? ` , ${parts[1]}` : '';
      return `${userText.trim()}${stylePart} , ${prompt}`.trim();
    });
  };

  const startProcessing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!productName.trim()) {
      toast({ title: "Product Name Required", description: "Please enter your product name.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);
    setStage('uploading');
    setProgress(0);

    const progressInterval = setInterval(() => setProgress(prev => Math.min(prev + 5, 90)), 300);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_prompt', `${productName}. ${customPrompt}`.trim());
      formData.append('style', selectedStyle);

      const response = await fetch('/generate', { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setStage('processing');

      if (!response.ok) throw new Error((await response.json()).error || 'Generation failed');
      const data = await response.json();
      setResults([data.image]);
      setStage('result');
      setProgress(100);
    } catch (err) {
      toast({ title: "Generation Failed", description: err instanceof Error ? err.message : "Error connecting to AI.", variant: "destructive" });
      setStage('idle');
    }
  };

  return (
    <div className="relative group z-[60] w-full max-w-5xl mx-auto mt-12 perspective-1000">
      {/* Dynamic Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-white/20 to-secondary rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse-slow"></div>

      <div className="relative bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 min-h-[500px] flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <motion.div
              key="idle"
              className="w-full space-y-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Left Column: Controls */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary/70"></span> 1. Select Style
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {styleChips.map((chip) => (
                        <button key={chip.id} onClick={() => handleStyleSelect(chip.id, chip.prompt)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${selectedStyle === chip.id ? 'bg-primary border-primary text-background shadow-[0_0_15px_rgba(0,191,255,0.4)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}>
                          <span className="text-lg">{chip.emoji}</span><span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary/70"></span> 2. Format
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {socialChips.map((chip) => (
                        <button key={chip.id} onClick={() => handleSocialSelect(chip.id, chip.prompt)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${selectedSocial === chip.id ? 'bg-secondary border-secondary text-white shadow-[0_0_15px_rgba(255,69,0,0.4)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                          <span>{chip.emoji}</span><span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">3. Details</h3>
                    <input type="text" placeholder="Product Name (e.g. Leather Wallet)" value={productName} onChange={(e) => setProductName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20" />
                  </div>
                </div>

                {/* Right Column: Upload */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-2 h-full flex flex-col">
                  <div className="relative flex-grow rounded-xl border-2 border-dashed border-white/10 bg-black/20 hover:border-primary/30 transition-colors flex flex-col items-center justify-center p-8 group/upload">
                    <input type="file" ref={fileInputRef} className="absolute inset-0 opacity-0 cursor-pointer z-50" onChange={startProcessing} accept="image/*" />

                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover/upload:scale-110 transition-transform duration-500">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upload Photo</h3>
                    <p className="text-white/40 text-sm text-center max-w-[200px] leading-relaxed">Drag & drop or click to browse from your device</p>

                    <Button className="mt-8 rounded-full font-black px-8 shimmer-bg border-none text-background">
                      GENERATE MAGIC
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading States */}
          {(stage === 'uploading' || stage === 'processing') && (
            <motion.div key="processing" className="text-center space-y-8 w-full px-8 max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative bg-black rounded-full w-full h-full flex items-center justify-center border border-white/10 shadow-2xl">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">{stage === 'uploading' ? 'Uploading Asset...' : 'Designing Scene...'}</h3>
                <p className="text-white/40 text-sm">Our AI is analyzing light, composition, and texture.</p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-primary to-secondary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {stage === 'result' && (
            <motion.div key="result" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid md:grid-cols-2 gap-8 h-full">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 group/img">
                  <img src={originalImage || ''} className="w-full h-full object-cover opacity-60 grayscale transition-all group-hover/img:grayscale-0 group-hover/img:opacity-100" />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white">Original</div>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-primary/50 shadow-[0_0_40px_rgba(0,191,255,0.15)] group/res">
                  <img src={results[0]} className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 bg-primary text-background px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">AI Generated</div>

                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/res:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <Button onClick={() => window.open(results[0], '_blank')} variant="outline" className="rounded-full border-white/20 text-white">View Full</Button>
                    <Button onClick={() => setStage('idle')} className="rounded-full bg-white text-black font-bold">New Creation</Button>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Link href="/pricing">
                  <Button className="h-14 px-10 rounded-full text-lg font-black bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10 hover:scale-105 transition-transform">
                    UNLOCK HD DOWNLOAD <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="bg-background min-h-screen text-foreground overflow-x-hidden">
      <Helmet>
        <title>VizAI Boost | Premium AI Product Photography</title>
      </Helmet>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-[100] border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background"><Sparkles className="w-5 h-5 fill-current" /></div>
            VIZAI
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {['How It Works', 'Pricing', 'Portfolio'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest">{item}</a>
            ))}
            <Link href="/pricing">
              <Button className="rounded-full bg-white text-black font-bold hover:bg-white/90 text-xs uppercase tracking-widest px-6 h-10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
          <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20 flex flex-col items-center">
          <motion.div
            style={{ opacity }}
            className="text-center space-y-8 max-w-5xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 animate-float">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">AI Engine Online v2.5</span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
              PRODUCT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">PERFECTION</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
              Turn messy phone shots into <span className="text-primary font-bold">agency-grade assets</span> instantly.
              Zero skills. Impeccable results.
            </p>
          </motion.div>

          {/* Interactive AI Preview */}
          <AIPreviewEngine />

          <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <span className="text-lg font-black text-white/20">SHOPIFY</span>
            <span className="text-lg font-black text-white/20">AMAZON</span>
            <span className="text-lg font-black text-white/20">INSTAGRAM</span>
            <span className="text-lg font-black text-white/20">ETSY</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-40 relative z-10" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-xl space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-white leading-none">CRAFTED FOR <br /><span className="text-gradient">COMMERCE</span></h2>
              <p className="text-white/50 text-lg">Every pixel optimized for conversion. We don't just generate images; we build brands.</p>
            </div>
            <Link href="/pricing"><Button variant="outline" className="rounded-full border-white/20 h-14 px-8 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">View All Features</Button></Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Instant Studio", desc: "Replace messy backgrounds with clean, commercial-grade sets.", icon: <Layers />, color: "bg-blue-500" },
              { title: "Smart Lighting", desc: "AI relights your product to match the environment perfectly.", icon: <Sparkles />, color: "bg-yellow-500" },
              { title: "4K Export", desc: "Ultra-high resolution ready for print and retina displays.", icon: <Upload />, color: "bg-purple-500" },
            ].map((item, i) => (
              <TiltCard key={i} className="group cursor-default">
                <div className="h-full bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-colors backdrop-blur-sm flex flex-col justify-between min-h-[320px]">
                  <div className="space-y-6">
                    <div className={`w-14 h-14 rounded-2xl ${item.color}/10 flex items-center justify-center text-white border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                      {item.icon}
                    </div>
                    <h3 className="text-3xl font-bold max-w-[80%]">{item.title}</h3>
                  </div>
                  <div>
                    <div className="w-full h-px bg-white/5 mb-6 group-hover:bg-white/20 transition-colors" />
                    <p className="text-white/40 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-12 px-6 py-3 rounded-full border border-primary/20 bg-primary/5">
            <div className="flex text-primary">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-primary font-bold text-sm uppercase tracking-widest">TrustPilot 4.9/5</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "This tool literally saved my launch. The photos look like I paid $5k for a shoot.",
              "Finally an AI that understands 'luxury'. The marble textures are insane.",
              "I use this for all my client mockups now. It's my secret weapon."
            ].map((text, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 text-left">
                <p className="text-lg text-white/80 font-medium leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5" />
                  <div>
                    <div className="text-sm font-bold text-white">Verified User</div>
                    <div className="text-[10px] text-white/40 uppercase font-black">E-Commerce Owner</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Massive CTA */}
      <section className="py-40 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/90">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
          <div className="absolute -top-[50%] -left-[20%] w-[100vw] h-[100vw] bg-white/20 blur-[200px] rounded-full mix-blend-overlay animate-pulse-slow"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center space-y-10">
          <h2 className="text-5xl md:text-8xl font-black text-black leading-[0.9] tracking-tighter">
            STOP SETTLING <br /> FOR AVERAGE.
          </h2>
          <Link href="/pricing">
            <Button className="h-24 px-16 rounded-full bg-black text-white text-xl font-black hover:scale-105 transition-transform shadow-2xl hover:bg-neutral-900 border-4 border-transparent hover:border-white/20">
              START CREATING FOR FREE <ArrowRight className="ml-4 w-6 h-6" />
            </Button>
          </Link>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm">No Credit Card Required • cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black border-t border-white/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
              VIZAI
            </Link>
            <p className="text-white/30 text-xs max-w-[200px]">Next-gen commerce photography engine powered by Google Gemini.</p>
          </div>

          <div className="flex gap-8">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
