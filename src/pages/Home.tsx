import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Upload,
  Sparkles,
  Layers,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Twitter,
  Facebook,
  Mail,
  Star,
  Loader2,
  Share2,
  MessageCircle,
  Shield,
  Wand2,
  Download,
  Check
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useState, useRef, MouseEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { BrandingIntakeModal } from "@/components/branding/BrandingIntakeModal";
import { PageTransition } from "@/components/PageTransition";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

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

// --- Configuration ---
const styleChips = [
  { id: 'minimalist', label: 'Minimalist', emoji: '🏛️', color: '#E5E7EB', prompt: 'clean minimalist space, soft natural light, architectural shadows' },
  { id: 'luxury', label: 'Luxury', emoji: '✨', color: '#FCD34D', prompt: 'black obsidian surface, dramatic rim lighting, golden hour' },
  { id: 'white', label: 'Studio White', emoji: '⚪', color: '#FFFFFF', prompt: 'pure white cyclorama, soft studio lighting, professional contact shadow' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌌', color: '#A855F7', prompt: 'neon lights, wet pavement, futuristic city fog' },
  { id: 'tropical', label: 'Tropical', emoji: '🌴', color: '#22C55E', prompt: 'lush green leaves, dappled sunlight, wooden textures' },
  { id: 'industrial', label: 'Industrial', emoji: '🏭', color: '#6B7280', prompt: 'raw concrete loft, aged brick, industrial pendant lighting' },
  { id: 'nordic', label: 'Nordic', emoji: '🪵', color: '#92400E', prompt: 'light oak wood, soft diffused daylight, clean Scandinavian' },
  { id: 'vogue', label: 'Vogue', emoji: '👠', color: '#DC2626', prompt: 'red velvet backdrop, sharp spotlight, high-fashion mood' },
];

const formatOptions = [
  { id: 'square', label: 'Square (1:1)', emoji: '□', ratio: 'aspect-square', prompt: 'centered square composition' },
  { id: 'portrait', label: 'Portrait (4:5)', emoji: '📱', ratio: 'aspect-[4/5]', prompt: 'vertical social media post layout' },
  { id: 'story', label: 'Story (9:16)', emoji: '🎬', ratio: 'aspect-[9/16]', prompt: 'full screen mobile story format' },
  { id: 'landscape', label: 'Landscape (3:2)', emoji: '🖼️', ratio: 'aspect-[3/2]', prompt: 'wide professional banner layout' },
  { id: 'cinematic', label: 'Cinematic (21:9)', emoji: '🎞️', ratio: 'aspect-[21/9]', prompt: 'ultra-wide cinematic presentation' },
];

const lightingMoods = [
  { id: 'natural', label: 'Golden Hour', emoji: '🌇', prompt: 'warm lighting, long shadows' },
  { id: 'studio', label: 'Softbox', emoji: '💡', prompt: 'balanced studio lighting, no harsh shadows' },
  { id: 'noir', label: 'Dramatic Noir', emoji: '🌒', prompt: 'high contrast, Moody, rim lighting' },
  { id: 'neon', label: 'Neon Glow', emoji: '🔮', prompt: 'vibrant colorful highlights, cinematic bloom' },
];

const focalLengthOptions = [
  { id: '35mm', label: '35mm Wide', emoji: '🏙️', prompt: '35mm wide-angle lens, slight environmental context, deep focus' },
  { id: '50mm', label: '50mm Prime', emoji: '📸', prompt: '50mm primary lens, natural perspective, realistic proportions' },
  { id: '85mm', label: '85mm Pro', emoji: '👤', prompt: '85mm telephoto lens, beautiful background compression, creamy bokeh' },
  { id: '100mm', label: '100mm Macro', emoji: '🔍', prompt: '100mm macro lens, extreme close-up detail, razor-sharp focus on textures' },
];


const borderPresets = [
  { id: 'gallery-white', label: 'Gallery White', icon: '🖼️', prompt: 'clean white museum gallery frame with 10% inner padding' },
  { id: 'luxury-black', label: 'Luxury Black', icon: '🖤', prompt: 'elegant deep black velvet border with soft rim lighting' },
  { id: 'modern-oak', label: 'Modern Oak', icon: '🪵', prompt: 'thin architectural light oak wood frame' },
  { id: 'obsidian-deco', label: 'Obsidian Deco', icon: '💎', prompt: 'beveled obsidian frame with subtle golden trim' },
];


const colorGradingPresets = [
  { id: 'none', label: 'Standard', emoji: '🎨', prompt: '' },
  { id: 'portra-400', label: 'Portra 400', emoji: '🎞️', prompt: 'Kodak Portra 400 film look, warm tones, fine grain, high dynamic range' },
  { id: 'cinestill-800t', label: 'CineStill 800T', emoji: '🌃', prompt: 'CineStill 800T specific halation, tungsten balanced, cinematic night look' },
  { id: 'fuji-velvia', label: 'Fuji Velvia', emoji: '🏔️', prompt: 'Fujifilm Velvia 50, high saturation, vivid colors, deep blacks' },
  { id: 'arri-alexa', label: 'ARRI Alexa', emoji: '🎥', prompt: 'ARRI Alexa LogC to Rec709, cinematic highlight roll-off, soft contrast' },
  { id: 'teal-orange', label: 'Teal & Orange', emoji: '🧡', prompt: 'Hollywood blockbuster look, teal shadows, orange skin tones' },
  { id: 'monochrome', label: 'Leica B&W', emoji: '⚫', prompt: 'Leica Monochrom, rich high-contrast black and white, silver tones' },
];

const influencerPresets = [
  { id: 'none', label: 'Product Only', emoji: '📦', prompt: '' },
  { id: 'asian-female-lifestyle', label: 'Asian Female - Lifestyle', emoji: '👩', prompt: 'East Asian woman, 25-30 years old, casual lifestyle setting, natural smile, holding product naturally in everyday context' },
  { id: 'black-male-luxury', label: 'Black Male - Luxury', emoji: '👨🏿', prompt: 'Black man, 30-35 years old, luxury setting, sophisticated styling, presenting product elegantly with confidence' },
  { id: 'hispanic-female-fitness', label: 'Hispanic Female - Fitness', emoji: '💪', prompt: 'Hispanic woman, 22-28 years old, athletic build, fitness/wellness setting, energetic pose with product' },
  { id: 'white-male-professional', label: 'White Male - Professional', emoji: '👔', prompt: 'Caucasian man, 35-45 years old, business professional setting, corporate attire, presenting product in office context' },
  { id: 'south-asian-female-creative', label: 'South Asian Female - Creative', emoji: '🎨', prompt: 'South Asian woman, 25-32 years old, artistic/creative workspace, bohemian style, naturally interacting with product' },
  { id: 'middle-eastern-male-tech', label: 'Middle Eastern Male - Tech', emoji: '💻', prompt: 'Middle Eastern man, 28-35 years old, modern tech workspace, casual professional attire, using/showcasing product' },
  { id: 'black-female-entrepreneur', label: 'Black Female - Entrepreneur', emoji: '👩🏾\u200d💼', prompt: 'Black woman, 30-40 years old, confident entrepreneur, modern office setting, presenting product with authority' },
  { id: 'asian-male-minimalist', label: 'Asian Male - Minimalist', emoji: '🧘', prompt: 'East Asian man, 25-35 years old, minimalist aesthetic, clean background, zen-like presentation of product' },
];

// --- AI Engine (Preserved Logic, Enhanced UI) ---
function AIPreviewEngine() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<'idle' | 'uploading' | 'processing' | 'result' | 'order-success'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [blueprint, setBlueprint] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>('minimalist');
  const [selectedFormat, setSelectedFormat] = useState<string>('square');
  const [selectedLighting, setSelectedLighting] = useState<string>('natural');
  const [selectedFocalLength, setSelectedFocalLength] = useState<string>('50mm');
  const [selectedColorGrading, setSelectedColorGrading] = useState<string>('none');
  const [isMagicEnhanceEnabled, setIsMagicEnhanceEnabled] = useState(false);
  const [isABTestMode, setIsABTestMode] = useState(false);
  const [is360Mode, setIs360Mode] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [selectedAngles, setSelectedAngles] = useState<string[]>(['side', 'top', 'back']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variations, setVariations] = useState<Array<{ id: string, label: string, image: string }>>([]);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isBranding, setIsBranding] = useState(false);
  const [brandedImage, setBrandedImage] = useState<string | null>(null);
  const [selectedBorderPreset, setSelectedBorderPreset] = useState(borderPresets[0].id);
  const [borderStyle, setBorderStyle] = useState(borderPresets[0].prompt);
  const [selectedInfluencer, setSelectedInfluencer] = useState('none');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string, price: string } | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [intakeMetadata, setIntakeMetadata] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Credit System Integration ---
  const { data: creditData, refetch: refetchCredits } = useQuery({
    queryKey: ['/api/payment/credits'],
    queryFn: async () => {
      const res = await fetch('/api/payment/credits');
      if (!res.ok) return { credits: 0 };
      return res.json();
    }
  });
  const userCredits = creditData?.credits || 0;

  const COSTS = { SINGLE_EXPORT: 5, BATCH_EXPORT: 30, HUMAN_POLISH: 50 };

  const getPaymentProps = () => {
    // Human Polish
    if (selectedProduct?.id === 'brand-polish') {
      return {
        productName: "Brand Studio Polish",
        productPrice: "$99.00",
        stripeProductId: "prod_human_polish", // Fallback
        creditCost: COSTS.HUMAN_POLISH
      };
    }
    // Batch
    if (isBatchMode) {
      return {
        productName: "Batch Studio License",
        productPrice: "$29.99",
        creditCost: COSTS.BATCH_EXPORT
      };
    }
    // Default: Single Export
    return {
      productName: "Commercial 8K License",
      productPrice: "$4.99",
      creditCost: COSTS.SINGLE_EXPORT
    };
  };

  const paymentProps = getPaymentProps();
  // ---------------------------------

  const handleStyleSelect = (styleId: string, prompt: string) => {
    setSelectedStyle(styleId);
    setCustomPrompt(prompt); // Auto-populate description box
  };

  const currentThemeColor = styleChips.find(s => s.id === selectedStyle)?.color || '#00BFFF';

  const handleBrandPolish = async () => {
    if (!logoFile || !results[0]) return;
    setIsBranding(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('image_url', results[0]);
      formData.append('style', selectedStyle);
      formData.append('border_style', borderStyle);

      const response = await fetch('/api/brand-polish', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Branding failed');
      const data = await response.json();
      setBrandedImage(data.image);
      toast({ title: "Brand Polish Complete", description: "Your commercial asset is ready." });
    } catch (err) {
      toast({ title: "Branding Failed", description: "Could not apply brand style.", variant: "destructive" });
    } finally {
      setIsBranding(false);
    }
  };

  const handleAutoDetect = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file && !originalImage) {
      toast({ title: "No Image Found", description: "Please upload an image first to analyze.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    toast({ title: "Analyzing Scene...", description: "AI is studying your product to find the best settings." });

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (originalImage) {
      // Logic for existing image if needed, but for now rely on file input
      // Ideally we should track the current File object in state
    }

    try {
      const response = await fetch('/analyze-image', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Apply AI Suggestions
      if (data.productName) setProductName(data.productName);
      if (data.suggestedPrompt) setCustomPrompt(data.suggestedPrompt);

      // Attempt to match styles
      if (data.suggestedStyle) {
        const styleMatch = styleChips.find(s => s.id.includes(data.suggestedStyle.toLowerCase()) || data.suggestedStyle.toLowerCase().includes(s.id));
        if (styleMatch) setSelectedStyle(styleMatch.id);
      }

      if (data.suggestedLighting) {
        const lightingMatch = lightingMoods.find(l => l.id.includes(data.suggestedLighting.toLowerCase()));
        if (lightingMatch) setSelectedLighting(lightingMatch.id);
      }

      toast({
        title: "✨ Recipe Created!",
        description: `Optimized for ${data.category || 'your product'}.`,
        className: "bg-primary text-black border-none"
      });

    } catch (e) {
      toast({ title: "Analysis Failed", description: "Could not auto-detect settings.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const launchBatchProcessing = async () => {
    if (batchFiles.length === 0) return;
    setStage('uploading');
    setProgress(0);
    const progressInterval = setInterval(() => setProgress(prev => Math.min(prev + 5, 90)), 300);

    try {
      const formData = new FormData();
      batchFiles.forEach(file => formData.append('files', file));
      formData.append('user_prompt', `${productName}. ${customPrompt}`.trim());
      // Add other settings as needed
      formData.append('style', selectedStyle);

      const response = await fetch('/batch-generate', { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setStage('processing');

      if (!response.ok) throw new Error('Batch generation failed');
      const data = await response.json();

      if (data.images) {
        setVariations(data.images.map((img: string, i: number) => ({ id: `batch-${i}`, label: `Img ${i + 1}`, image: img })));
        setResults([data.images[0]]);
        setStage('result');
      }
    } catch (e) {
      toast({ title: "Batch Failed", description: "Could not process batch.", variant: "destructive" });
      setStage('idle');
    }
  };

  const startProcessing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle File Selection
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isBatchMode) {
      if (files.length > 50) {
        toast({ title: "Limit Exceeded", description: "Max 50 images per batch.", variant: "destructive" });
        return;
      }
      setBatchFiles(Array.from(files));
      // Don't auto-start processing for batch. User needs to click "Ignite" -> Pay -> Process.
      // But for this flow, let's assume the "Ignite" button triggers this input if empty, or we use a separate handler.
      // Actually, the input onChange triggers this.
      // So let's just store the files if in batch mode.
      return;
    }

    const file = files[0];
    if (!productName.trim()) {
      toast({ title: "Product Name Required", description: "Give your project a name first!", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);
    setStage('uploading');
    setProgress(0);

    const progressInterval = setInterval(() => setProgress(prev => Math.min(prev + 5, 90)), 300);

    try {
      if (isABTestMode) {
        // A/B Test Generation
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_prompt', `${productName}. ${customPrompt}`.trim());

        const response = await fetch('/generate-variations', { method: 'POST', body: formData });
        clearInterval(progressInterval);
        setStage('processing');

        if (!response.ok) throw new Error('Variation generation failed');
        const data = await response.json();

        if (data.variations) {
          setVariations(data.variations);
          // Set the first one as main result for compatibility
          setResults([data.variations[0].image]);
        }
      } else if (is360Mode) {
        // 360 Multi-Angle Generation
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productName', productName);
        formData.append('angles', selectedAngles.join(','));

        const response = await fetch('/generate-angles', { method: 'POST', body: formData });
        clearInterval(progressInterval);
        setStage('processing');

        if (!response.ok) throw new Error('Angle generation failed');
        const data = await response.json();

        if (data.angles) {
          setVariations(data.angles.map((a: any) => ({
            id: a.angle,
            label: a.angle.toUpperCase(),
            image: a.image
          })));
          setResults([data.angles[0].image]);
        }
      } else {
        // Single Image Generation
        const selectedFormatPrompt = formatOptions.find(f => f.id === selectedFormat)?.prompt || '';
        const selectedLightingPrompt = lightingMoods.find(l => l.id === selectedLighting)?.prompt || '';
        const selectedFocalPrompt = focalLengthOptions.find(f => f.id === selectedFocalLength)?.prompt || '';
        const selectedInfluencerPrompt = influencerPresets.find(i => i.id === selectedInfluencer)?.prompt || '';
        const selectedColorGradingPrompt = colorGradingPresets.find(c => c.id === selectedColorGrading)?.prompt || '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_prompt', `${productName}. ${customPrompt}`.trim());
        formData.append('style', selectedStyle);
        formData.append('focal_length', selectedFocalPrompt);
        formData.append('lighting', selectedLightingPrompt);
        formData.append('aspect_ratio', selectedFormatPrompt);
        formData.append('influencer', selectedInfluencerPrompt);
        formData.append('enhance', isMagicEnhanceEnabled.toString());
        formData.append('color_grading', selectedColorGradingPrompt);

        const response = await fetch('/generate', { method: 'POST', body: formData });
        clearInterval(progressInterval);
        setStage('processing');

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Generation failed');
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setResults([data.image]);
        setBlueprint(data.blueprint || "");

        if (data.isGuest) {
          toast({
            title: "✨ Wow Moment!",
            description: "Your product looks amazing. Create an account to remove watermark and get 15 free credits!",
            duration: 10000,
          });
        } else {
          // Refresh credits for authenticated users
          queryClient.invalidateQueries({ queryKey: ['/api/payment/credits'] });
        }
      }

      setStage('result');
      setProgress(100);
    } catch (err) {
      toast({ title: "Generation Failed", description: err instanceof Error ? err.message : "Error connecting to AI.", variant: "destructive" });
      setStage('idle');
    }
  };

  return (
    <div className="relative group z-[60] w-full max-w-6xl mx-auto mt-12 perspective-2000">
      {/* Dynamic Mood Glow */}
      <div
        className="absolute -inset-4 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-700 animate-pulse-slow"
        style={{ backgroundColor: currentThemeColor }}
      ></div>

      <div className="relative bg-[#050505] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 md:p-10 min-h-[600px] flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        <AnimatePresence>
          {stage === 'idle' && (
            <motion.div
              key="idle"
              className="w-full space-y-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-stretch">
                {/* Left: Engine Controls */}
                <div className="space-y-8 bg-white/[0.02] p-8 rounded-3xl border border-white/5">

                  <div className="space-y-3">
                    {/* Magic Enhance Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                          <h3 className="text-sm font-black text-white tracking-wide">MAGIC ENHANCE</h3>
                        </div>
                        <p className="text-[10px] text-white/50">Auto-optimize lighting, details & color science</p>
                      </div>
                      <button
                        onClick={() => setIsMagicEnhanceEnabled(!isMagicEnhanceEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isMagicEnhanceEnabled ? 'bg-primary' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isMagicEnhanceEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* A/B Test Mode Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚖️</span>
                          <h3 className="text-sm font-black text-white tracking-wide">SMART A/B TEST</h3>
                        </div>
                        <p className="text-[10px] text-white/50">Generate 4 variations instantly</p>
                      </div>
                      <button
                        onClick={() => { setIsABTestMode(!isABTestMode); setIs360Mode(false); }}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isABTestMode ? 'bg-purple-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isABTestMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* 360 Studio Toggle */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔄</span>
                            <h3 className="text-sm font-black text-white tracking-wide">360° STUDIO</h3>
                          </div>
                          <p className="text-[10px] text-white/50">Generate comprehensive product views</p>
                        </div>
                        <button
                          onClick={() => { setIs360Mode(!is360Mode); setIsABTestMode(false); setIsBatchMode(false); }}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${is360Mode ? 'bg-blue-500' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${is360Mode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Angle Selectors (Only visible when active) */}
                      {is360Mode && (
                        <div className="grid grid-cols-2 gap-2 mt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                          {['side', 'top', 'back', 'feature'].map(angle => (
                            <label key={angle} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={selectedAngles.includes(angle)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedAngles([...selectedAngles, angle]);
                                  else setSelectedAngles(selectedAngles.filter(a => a !== angle));
                                }}
                                className="w-3 h-3 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                              />
                              <span className="text-[10px] font-bold uppercase text-white/70">{angle} View</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Batch Processing Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📦</span>
                          <h3 className="text-sm font-black text-white tracking-wide">BATCH STUDIO</h3>
                        </div>
                        <p className="text-[10px] text-white/50">Upload up to 50 images ($29.99)</p>
                      </div>
                      <button
                        onClick={() => { setIsBatchMode(!isBatchMode); setIsABTestMode(false); setIs360Mode(false); }}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isBatchMode ? 'bg-orange-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isBatchMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">1. AESTHETIC CATALOG</h3>
                      <span className="text-[10px] text-primary font-bold animate-pulse">8 PROFESSIONAL PRESETS</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {styleChips.map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => handleStyleSelect(chip.id, chip.prompt)}
                          className={`group/btn relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-500 ${selectedStyle === chip.id
                            ? 'bg-white/10 border-white/20 shadow-xl'
                            : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                            }`}
                        >
                          <span className={`text-2xl transition-transform duration-500 ${selectedStyle === chip.id ? 'scale-125' : 'group-hover/btn:scale-110'}`}>{chip.emoji}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-widest ${selectedStyle === chip.id ? 'text-white' : 'text-white/40'}`}>{chip.label}</span>
                          {selectedStyle === chip.id && (
                            <motion.div layoutId="activeStyle" className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">2. COLOR SCIENCE</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {colorGradingPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedColorGrading(preset.id)}
                          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${selectedColorGrading === preset.id
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                            }`}
                        >
                          <span className="text-lg">{preset.emoji}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest truncate w-full text-center">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">3. DIRECTOR'S CUT: LIGHTING</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {lightingMoods.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => setSelectedLighting(mood.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${selectedLighting === mood.id
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                            }`}
                        >
                          {mood.emoji} {mood.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">4. RATIO & COMPOSITION</h3>
                    <div className="flex flex-wrap gap-2">
                      {formatOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedFormat(opt.id)}
                          className={`flex gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${selectedFormat === opt.id
                            ? 'bg-primary border-primary text-background'
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">5. OPTICS & FOCAL LENGTH</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {focalLengthOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedFocalLength(opt.id)}
                          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${selectedFocalLength === opt.id
                            ? 'bg-white/10 border-primary/50 text-white'
                            : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                            }`}
                        >
                          <span className="text-lg">{opt.emoji}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Influencer Selector */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">6. AI INFLUENCER</h3>
                      <div className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">New</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {influencerPresets.map((inf) => (
                        <button
                          key={inf.id}
                          onClick={() => setSelectedInfluencer(inf.id)}
                          className={`h-12 px-3 rounded-xl border flex items-center gap-2 transition-all ${selectedInfluencer === inf.id
                            ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                            }`}
                        >
                          <span className="text-base">{inf.emoji}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider truncate">{inf.label}</span>
                        </button>
                      ))}
                    </div>
                    {selectedInfluencer !== 'none' && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[9px] text-white/50 leading-relaxed">
                          <span className="text-primary font-black">AI-GENERATED MODEL:</span> This is not a real person. The image will feature an AI-generated human model presenting your product.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">7. STUDIO DESCRIPTION</h3>
                      <button
                        onClick={handleAutoDetect}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                      >
                        <Wand2 className={`w-3 h-3 text-primary ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                          {isAnalyzing ? 'Detecting...' : 'Auto-Detect'}
                        </span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Product Name (Essential)"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 transition-all placeholder:text-white/10"
                      />
                      <textarea
                        rows={3}
                        placeholder="Customize the scene details... (Auto-populates from presets)"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 transition-all placeholder:text-white/10 resize-none font-light leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Smart Dropzone */}
                <div className="relative group/zone bg-[#0A0A0A] rounded-3xl border border-white/5 p-4 flex flex-col">
                  <div className="flex-grow relative rounded-2xl border-2 border-dashed border-white/5 bg-black/40 flex flex-col items-center justify-center p-8 transition-all group-hover/zone:border-primary/20 overflow-hidden">
                    {/* Animated Background Gradients */}
                    <div className="absolute inset-0 opacity-0 group-hover/zone:opacity-20 transition-opacity duration-1000">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary blur-3xl animate-pulse delay-700"></div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer z-50"
                      onChange={startProcessing}
                      accept="image/*"
                      multiple={isBatchMode} // Enable multiple files only in batch mode
                    />

                    <div className="relative z-10 text-center">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover/zone:scale-110 group-hover/zone:border-primary/20 transition-all duration-700">
                        {isBatchMode && batchFiles.length > 0 ? (
                          <div className="text-3xl font-black text-orange-500">{batchFiles.length}</div>
                        ) : (
                          <Upload className="w-10 h-10 text-white/20 group-hover/zone:text-primary transition-colors" />
                        )}
                      </div>
                      <h4 className="text-xl font-black text-white mb-2 tracking-tight">
                        {isBatchMode ? (batchFiles.length > 0 ? 'Files Selected' : 'Drop Batch (Max 50)') : 'Drop Source Asset'}
                      </h4>
                      <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">
                        {isBatchMode ? 'JPG, PNG • PRO PLAN' : 'RAW, PNG, or JPEG • MAX 50MB'}
                      </p>

                      <div className="mt-10 flex items-center gap-4 justify-center">
                        <div className="h-px w-8 bg-white/5"></div>
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">or click to browse</span>
                        <div className="h-px w-8 bg-white/5"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      {isBatchMode && batchFiles.length > 0 ? (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            // Trigger Payment for Batch
                            setSelectedProduct({ id: 'batch-studio', name: 'Studio Batch Pass (50 Images)', price: '$29.99' });
                            setIsPaymentModalOpen(true);
                          }}
                          className="w-full h-14 rounded-2xl bg-orange-500 text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg border-none"
                        >
                          UNLOCK BATCH PROCESS ($29.99)
                        </Button>
                      ) : (
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-14 rounded-2xl bg-primary text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,191,255,0.2)] border-none"
                        >
                          IGNITE STUDIO ENGINE
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Processing States */}
          {(stage === 'uploading' || stage === 'processing') && (
            <motion.div key="processing" className="text-center space-y-10 w-full max-w-lg" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse" style={{ backgroundColor: currentThemeColor }}></div>
                <div className="relative bg-[#0A0A0A] rounded-full w-full h-full flex items-center justify-center border border-white/10 shadow-3xl">
                  <div className="absolute inset-2 border border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-2" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{progress}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white leading-tight">
                  {stage === 'uploading' ? 'Digitizing Product' : 'Calibrating Optics'}
                </h3>
                <div className="flex justify-center gap-6">
                  {['TEXTURES', 'LIGHTING', 'SHADOWS'].map(txt => (
                    <div key={txt} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      <span className="text-[10px] font-black text-white/40 tracking-widest">{txt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Success State (Premium Service) */}
          {stage === 'order-success' && (
            <motion.div key="success" className="w-full max-w-2xl mx-auto text-center space-y-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-black rounded-full w-full h-full flex items-center justify-center border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Brand Studio Polish Ordered</h2>
                <p className="text-xl text-white/60 max-w-lg mx-auto leading-relaxed">
                  Your image is now queued for <span className="text-primary font-bold">designer review</span>.
                  <br />
                  A professional will refine your selected image and apply your brand details.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 text-left max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4">What happens next:</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">1</div>
                    <span className="text-sm text-white/80">Designer reviews your AI image</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">2</div>
                    <span className="text-sm text-white/80">Brand framing & logo are applied</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">3</div>
                    <span className="text-sm text-white/80">Final quality check</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold">4</div>
                    <span className="text-sm text-white font-bold">High-resolution asset delivered</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center gap-2 text-white/50 text-xs">
                  <span>⏱ Estimated delivery: 24–48 hours</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                  <span>You’ll be notified by email</span>
                </div>
                {/* @ts-ignore */}
                <Button
                  onClick={() => setStage('result')}
                  className="h-14 px-8 rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  View Order Status
                </Button>
                <p className="text-[10px] text-white/30">Order ID: #BS-{Math.floor(Math.random() * 10000)}</p>
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {stage === 'result' && (
            <motion.div key="result" className="w-full space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid md:grid-cols-2 gap-8">
                {isBatchMode ? (
                  <div className="col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-2xl font-black text-white">BATCH RESULTS ({variations.length})</h3>
                      <Button onClick={() => window.open(variations[0].image, '_blank')} variant="outline" className="text-xs">Download All (ZIP)</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {variations.map((v, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                          <img src={v.image} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => window.open(v.image, '_blank')}>
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="group/res relative rounded-3xl overflow-hidden border border-white/5 bg-black/40 flex items-center justify-center p-4">
                      <img src={originalImage || ''} className="w-full h-full object-contain opacity-30 blur-sm transition-all group-hover/res:opacity-60 group-hover/res:blur-0" />
                      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Source Asset</span>
                      </div>
                    </div>

                    {variations.length > 0 ? (
                      is360Mode ? (
                        // 360 Grid
                        <div className="grid grid-cols-2 gap-4">
                          {variations.map((variant) => (
                            <div key={variant.id} className="relative group/var rounded-2xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => setResults([variant.image])}>
                              <img src={variant.image} className="w-full h-full object-cover" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="bg-blue-500/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-wider text-center border border-white/10">
                                  {variant.label}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Variations Grid (A/B Test)
                        <div className="grid grid-cols-2 gap-4">
                          {variations.map((variant) => (
                            <div key={variant.id} className="relative group/var rounded-2xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => setResults([variant.image])}>
                              <img src={variant.image} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/var:opacity-100 transition-all flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur-md">Select</span>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-wider text-center border border-white/10">
                                  {variant.label}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      // Single Result Display
                      <div className="group/final relative rounded-3xl overflow-hidden border border-primary/20 bg-black/40 shadow-2xl flex flex-col items-center justify-center p-2">
                        <div className={`w-full h-full ${formatOptions.find(f => f.id === selectedFormat)?.ratio} overflow-hidden rounded-2xl relative group/meta`}>
                          <img src={results[0]} className="w-full h-full object-cover" />

                          {/* Watermark Layer - Only for Guests */}
                          {!user && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden rotate-45 select-none">
                              <p className="text-[60px] font-black text-white/20 uppercase tracking-[1em] whitespace-nowrap">VIZ AI TRIAL</p>
                            </div>
                          )}

                          {/* Pro Spec Overlay */}
                          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 opacity-0 group-hover/meta:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-primary border border-primary/20">ISO 100 • 85mm</div>
                            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-white/50 border border-white/5">f/8.0 • 1/125s</div>
                          </div>

                          {/* Viral Badge (Scaling Loop) */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 backdrop-blur-md border border-white/10 opacity-60">
                            <Sparkles className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Powered by VIZAI</span>
                          </div>
                        </div>

                        {/* Guest Conversion CTA */}
                        {!user && (
                          <div className="w-full mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center space-y-3">
                            <p className="text-xs font-black text-white uppercase tracking-tighter">Loved the result? ❤️</p>
                            <Link href="/auth">
                              <Button className="w-full bg-primary text-black font-black hover:scale-[1.02] transition-all">
                                CLAIM 15 FREE CREDITS & DOWNLOAD
                              </Button>
                            </Link>
                          </div>
                        )}

                        <div className="absolute top-6 left-6 flex items-center gap-3">
                          <div className="px-3 py-1.5 rounded-full bg-primary border border-primary/20 backdrop-blur-md flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-black">Studio Grade 8K</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white">Verified Asset</span>
                          </div>
                        </div>

                        {user && (
                          <div className="absolute inset-0 bg-black/90 opacity-0 group-hover/final:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6 backdrop-blur-xl">
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Export Ready</h4>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest -mt-4">Get Instant Commercial Rights</p>
                            <div className="flex gap-4">
                              <Button onClick={() => window.open(results[0], '_blank')} variant="outline" className="rounded-full border-white/10 text-white hover:bg-white hover:text-black">Preview Watermarked</Button>
                              <Button
                                onClick={() => {
                                  setSelectedProduct({ id: 'ai-single', name: 'Commercial License (8K)', price: '$4.99' });
                                  setIsPaymentModalOpen(true);
                                }}
                                className="rounded-full bg-primary text-black font-black px-8"
                              >
                                PURCHASE LICENSE ($4.99)
                              </Button>
                            </div>
                            <Button onClick={() => setStage('idle')} variant="ghost" className="text-[10px] text-white/40 uppercase font-black hover:text-white">New Session</Button>
                          </div>
                        )}
                        {!user && (
                          <Button onClick={() => setStage('idle')} variant="ghost" className="absolute top-4 right-4 text-[10px] text-white/40 uppercase font-black hover:text-white">Close</Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {blueprint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background">
                      <Sparkles className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter">Marketing Blueprint</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest">AI-GENERATED AD STRATEGY</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Performance ROI Card */}
                    <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-6 border border-primary/20 space-y-3 relative overflow-hidden group/roi">
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/roi:opacity-40 transition-opacity">
                        <TrendingUp className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-current" /> Predicted Impact
                      </p>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-white">+42%</p>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">Avg. Conversion Boost</p>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-primary" />
                      </div>
                    </div>

                    {blueprint.includes('THE HOOK') ? (
                      <>
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-3 relative group/kit">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">The Hook</p>
                          <p className="text-sm text-white font-bold leading-relaxed">
                            {blueprint.split('**THE HOOK**:')[1]?.split('\n')[0]?.trim() || "Generating..."}
                          </p>
                          <Button
                            variant="ghost" size="icon"
                            className="absolute top-4 right-4 opacity-0 group-hover/kit:opacity-100 transition-opacity"
                            onClick={() => {
                              navigator.clipboard.writeText(blueprint.split('**THE HOOK**:')[1]?.split('\n')[0]?.trim() || "");
                              toast({ title: "Hook Copied", description: "Ready to paste on socials." });
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-3 relative group/kit">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">The Vibe</p>
                          <p className="text-sm text-white/70 italic">
                            {blueprint.split('**THE VIBE**:')[1]?.split('\n')[0]?.trim() || "Calculating..."}
                          </p>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-3 relative group/kit md:col-span-2 lg:col-span-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Scene Script (15s)</p>
                          <p className="text-xs text-white/50 leading-loose scrollbar-hide overflow-y-auto max-h-[100px]">
                            {blueprint.split('SCENE SCRIPT**:')[1]?.split('**AD BLUEPRINT**')[0]?.trim() || "Drafting script..."}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative overflow-hidden group/copy w-full">
                        <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">
                          {blueprint}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Brand Polish Service Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-12 group"
              >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <Layers className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium Service</span>
                    </div>
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Brand <span className="text-gradient">Studio</span> Polish</h3>
                    <p className="text-white/50 text-sm leading-relaxed max-w-md">
                      Elevate your render to a final commercial asset. We'll clean the background, add a signature border, and beautifully place your logo for a high-end finish.
                    </p>

                    <div className="flex flex-col gap-6 pt-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Frame Aesthetics</label>
                        <div className="grid grid-cols-2 gap-3">
                          {borderPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => {
                                setSelectedBorderPreset(preset.id);
                                setBorderStyle(preset.prompt);
                              }}
                              className={`h-14 rounded-xl border flex items-center justify-center gap-3 transition-all ${selectedBorderPreset === preset.id
                                ? 'bg-primary border-primary text-black'
                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                }`}
                            >
                              <span className="text-lg">{preset.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest">{preset.label}</span>
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={borderStyle}
                          onChange={(e) => {
                            setBorderStyle(e.target.value);
                            setSelectedBorderPreset('custom');
                          }}
                          placeholder="Or type custom style (e.g. minimalist oak)"
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:border-primary/50 outline-none transition-all placeholder:opacity-30"
                        />
                      </div>

                      <div className="relative group/logo w-full">
                        <input
                          type="file"
                          id="logo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center justify-between px-6 h-16 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 cursor-pointer transition-all group-hover/logo:bg-white/[0.08]"
                        >
                          <div className="flex items-center gap-4">
                            <Upload className="w-5 h-5 text-white/40" />
                            <span className="text-sm font-bold text-white/60">
                              {logoFile ? logoFile.name : 'Upload Your Logo (PNG preferred)'}
                            </span>
                          </div>
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest">Browse</div>
                        </label>
                      </div>

                      <Button
                        onClick={() => setIsIntakeModalOpen(true)}
                        disabled={!logoFile || isBranding}
                        className="h-16 rounded-2xl bg-primary text-black font-black uppercase tracking-tighter hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isBranding ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                        ) : (
                          <>Upgrade to Human Studio <ArrowRight className="w-5 h-5" /></>
                        )}
                      </Button>
                    </div>
                  </div>


                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl">
                    {brandedImage ? (
                      <>
                        <img src={brandedImage} className="w-full h-full object-cover" />

                        {/* Payment Gate Overlay */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-8 p-10 text-center">
                          <div className="space-y-4 max-w-lg">
                            <h5 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                              Brand Studio Polish <br />
                              <span className="text-primary text-lg font-bold tracking-normal normal-case">(Human-Finished)</span>
                            </h5>
                            <p className="text-white/70 text-sm leading-relaxed">
                              Final commercial refinement by a professional designer.
                              <br />
                              <span className="text-white/40 text-xs mt-2 block">
                                Background cleanup • Brand-consistent framing • Precise logo placement • Human quality control
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                            <Button
                              onClick={() => {
                                setSelectedProduct({ id: 'brand-polish', name: 'Brand Studio Polish', price: '$99.00' });
                                setIsPaymentModalOpen(true);
                              }}
                              className="w-full bg-primary hover:bg-white text-background font-black h-14 rounded-full text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-105"
                            >
                              POLISH WITH DESIGNER ($99)
                            </Button>
                            <div className="space-y-1">
                              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">⏱ Delivery: 24–48 hours</p>
                              <p className="text-[10px] text-white/30">You’ll be notified when your final asset is ready</p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-8 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                          <Layers className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-white uppercase tracking-widest">Upload Your Logo</p>
                          <p className="text-[10px] text-white/50 leading-relaxed">
                            Used during designer review • PNG preferred<br />
                            Applied during final polish
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Tier 1: Instant AI Export */}
              <div className="w-full max-w-2xl mx-auto border-t border-white/10 pt-8 mt-8 text-center space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Option A: Instant Download (AI Only)</h4>
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={() => {
                      setSelectedProduct({
                        id: 'ai-single',
                        name: 'Single AI Snap (8K)',
                        price: '$4.99'
                      });
                      setIsPaymentModalOpen(true);
                    }}
                    className="h-16 px-12 rounded-full text-lg font-bold bg-transparent border-2 border-white/20 text-white hover:bg-white hover:text-black transition-all"
                  >
                    EXPORT AI IMAGE ($4.99)
                  </Button>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Instant download • No human review</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Branding Intake Modal */}
        <BrandingIntakeModal
          isOpen={isIntakeModalOpen}
          onClose={() => setIsIntakeModalOpen(false)}
          onProceedToCheckout={(formData) => {
            setIsIntakeModalOpen(false);
            setIntakeMetadata(formData);
            setSelectedProduct({ id: 'brand-polish', name: 'Brand Studio Polish', price: '$99.00' });
            setIsPaymentModalOpen(true);
          }}
        />

        {/* Payment Modal */}
        {selectedProduct && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedProduct(null);
            }}
            productName={paymentProps.productName}
            productPrice={paymentProps.productPrice}
            stripeProductId={paymentProps.stripeProductId}
            creditCost={paymentProps.creditCost}
            userCredits={userCredits}
            metadata={{
              imageUrl: results[0] || brandedImage || '',
              productName: productName,
              ...intakeMetadata
            }}
            onSuccess={() => {
              refetchCredits();
              setIsPaymentModalOpen(false);
              switch (selectedProduct.id) {
                case 'batch-studio':
                  launchBatchProcessing();
                  toast({ title: "Batch Engine Ignited", description: "Processing your catalog..." });
                  break;
                case 'brand-polish':
                  setStage('order-success');
                  break;
                case 'ai-single':
                default:
                  // Instant Export
                  if (results[0]) {
                    const link = document.createElement('a');
                    link.href = results[0];
                    link.download = `VizAI-Export-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast({ title: "License Activated", description: "Downloading 8K asset..." });
                  }
                  break;
              }
              setSelectedProduct(null);
            }}
          />
        )}
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
    <PageTransition>
      <div className="bg-background min-h-screen text-foreground overflow-x-hidden">
        <Helmet>
          <title>VizAI | Premium AI Product Photography</title>
        </Helmet>


        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
            <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          </div>

          <div className="container mx-auto px-4 relative z-20 flex flex-col items-center">
            <motion.div style={{ opacity }} className="text-center space-y-8 max-w-5xl mx-auto mb-16">
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

          </div>

          {/* Masterpiece Studio Gallery */}
          <div className="w-full mt-32 container mx-auto px-4 relative z-20">
            <div className="flex flex-col items-center mb-16 text-center space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Star className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">VizAI Excellence</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Studio-Grade <span className="text-gradient">Masterpieces</span></h2>
              <p className="text-white/40 text-sm max-w-xl">Every preset is calibrated for professional standards. Real results from real sessions.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { img: '/assets/watch.png', label: 'Pro Compression', spec: '85mm • f/2.0', title: 'Luxury Timepiece' },
                { img: '/assets/beauty.png', label: 'Hyper Detail', spec: '100mm Macro • f/8.0', title: 'Elite Beauty' },
                { img: '/assets/sneaker.png', label: 'Wide Context', spec: '35mm • f/4.0', title: 'Urban Sneaker' },
              ].map((item, idx) => (
                <TiltCard key={idx} className="group/card relative rounded-[2rem] overflow-hidden border border-white/5 bg-black/40 aspect-[4/5]">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{item.label}</p>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{item.title}</h3>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{item.spec}</span>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/card:bg-primary transition-colors">
                        <ArrowRight className="w-3 h-3 text-white group-hover/card:text-black" />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Showcase */}
        <section className="py-40 relative z-20 overflow-hidden bg-black/20" id="portfolio">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter">The <span className="text-gradient">Studio</span> Effect</h2>
              <p className="text-white/40 uppercase tracking-[0.4em] text-xs font-bold">Industry standard results in seconds</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Royal Chronograph', style: 'Minimalist', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
                { label: 'Ethereal Essence', style: 'Vogue', url: 'https://images.unsplash.com/photo-1596462502278-27bfaf41039c?w=800' },
                { label: 'Obsidian Noir', style: 'Luxury', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800' },
                { label: 'Monstera Mist', style: 'Tropical', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800' },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -10 }} className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5">
                  <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-10 left-10">
                    <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/20 mb-3 w-fit">
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{item.style}</p>
                    </div>
                    <h4 className="text-2xl font-bold text-white uppercase">{item.label}</h4>
                  </div>
                </motion.div>
              ))}
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

        {/* Live Studio Feed (Social Proof) */}
        <section className="py-20 border-t border-white/5 bg-gradient-to-b from-black/50 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Live Studio <span className="text-primary">Feed</span></h3>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Recent Sessions Worldwide</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { product: 'Luxury Watch', location: 'New York', time: '2m ago', style: 'Minimalist Noir' },
                { product: 'Beauty Serum', location: 'London', time: '5m ago', style: 'Vogue Elegance' },
                { product: 'Sneaker Drop', location: 'Tokyo', time: '8m ago', style: 'Urban Edge' },
              ].map((session, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-tight">{session.product}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{session.style}</p>
                    </div>
                    <div className="text-[9px] text-primary font-black uppercase tracking-widest">{session.time}</div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <div className="w-1 h-1 rounded-full bg-white/20"></div>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{session.location}</span>
                  </div>
                </motion.div>
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
    </PageTransition>
  );
}
