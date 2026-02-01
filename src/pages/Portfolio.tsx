import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

const portfolios = [
  {
    id: 0,
    title: "HY Premium Series",
    before: "/images/hy-image.png",
    after: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526170301010-f1d4c6792244?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585333127302-715d96f94741?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603912663489-082463e27181?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544441893-675973e31d85?q=80&w=400&h=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=400&h=400&auto=format&fit=crop",
    ]
  },
  {
    id: 1,
    title: "Artisanal Gold Ring",
    before: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=400&h=400&auto=format&fit=crop",
    after: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3f416?q=80&w=400&h=400&auto=format&fit=crop", // Ring on velvet
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=400&h=400&auto=format&fit=crop", // Ring on model finger
      "https://images.unsplash.com/photo-1599643477877-537ef527852b?q=80&w=400&h=400&auto=format&fit=crop", // Macro studio shot
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=400&h=400&auto=format&fit=crop", // On jewelry stand
      "https://images.unsplash.com/photo-1588444837495-c6cfaf504670?q=80&w=400&h=400&auto=format&fit=crop", // Ring in box
      "https://images.unsplash.com/photo-1599643478123-24151246c4f8?q=80&w=400&h=400&auto=format&fit=crop", // Dramatic shadow lighting
      "https://images.unsplash.com/photo-1617038262743-f14a8ca02415?q=80&w=400&h=400&auto=format&fit=crop", // Outdoor lifestyle
      "https://images.unsplash.com/photo-1544441893-675973e31d85?q=80&w=400&h=400&auto=format&fit=crop", // On wooden texture
      "https://images.unsplash.com/photo-1603912663489-082463e27181?q=80&w=400&h=400&auto=format&fit=crop", // High-key white BG
      "https://images.unsplash.com/photo-1627483262268-9c2b5b2834b5?q=80&w=400&h=400&auto=format&fit=crop", // Artistic composition
    ]
  },
  {
    id: 2,
    title: "Classic Leather Loafer",
    before: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=400&h=400&auto=format&fit=crop",
    after: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=400&h=400&auto=format&fit=crop", // In a modern hallway
      "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?q=80&w=400&h=400&auto=format&fit=crop", // Professional studio floor
      "https://images.unsplash.com/photo-1614252329302-6c39f1ed8ca1?q=80&w=400&h=400&auto=format&fit=crop", // On a cobblestone street
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=400&h=400&auto=format&fit=crop", // Side profile studio
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=400&h=400&auto=format&fit=crop", // In a luxury store setting
      "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=400&h=400&auto=format&fit=crop", // Top down lifestyle
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=400&h=400&auto=format&fit=crop", // Minimalist dark BG
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&h=400&auto=format&fit=crop", // Warm indoor lighting
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=400&h=400&auto=format&fit=crop", // Dynamic action shot
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&h=400&auto=format&fit=crop", // On a carpeted room
    ]
  },
  {
    id: 3,
    title: "Heritage Wristwatch",
    before: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&h=400&auto=format&fit=crop",
    after: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&h=400&auto=format&fit=crop", // On a wrist in a suit
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=400&h=400&auto=format&fit=crop", // Flat lay on a desk
      "https://images.unsplash.com/photo-1508685096489-7aac291ba5b3?q=80&w=400&h=400&auto=format&fit=crop", // Close up mechanism detail
      "https://images.unsplash.com/photo-1522312346375-d1ad50559b96?q=80&w=400&h=400&auto=format&fit=crop", // On a marble surface
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=400&h=400&auto=format&fit=crop", // Luxury store display
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=400&h=400&auto=format&fit=crop", // Cinematic dark mood
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=400&h=400&auto=format&fit=crop", // Lifestyle on a cafe table
      "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=400&h=400&auto=format&fit=crop", // Abstract bokeh background
      "https://images.unsplash.com/photo-1585123334904-845d60e97b29?q=80&w=400&h=400&auto=format&fit=crop", // Professional studio white
      "https://images.unsplash.com/photo-1619134716983-4903522295d7?q=80&w=400&h=400&auto=format&fit=crop", // Golden hour outdoor
    ]
  }
];

export default function Portfolio() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <PageTransition>
      <Helmet>
        <title>Portfolio | VizAI Boost</title>
        <meta name="description" content="Browse our gallery of AI-generated product and lifestyle visuals for e-commerce." />
      </Helmet>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">Selected Works</h1>
          <p className="text-xl text-muted-foreground">
            See the transformation from a simple phone photo to 10 professional AI-enhanced variations ready for delivery.
          </p>
        </div>

        <div className="space-y-24">
          {portfolios.map((item) => (
            <div key={item.id} className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3">
                  <div className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-square">
                    <img src={item.before} alt="Before" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      PHONE PHOTO (BEFORE)
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="w-full md:flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {item.after.map((src, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/5 aspect-square"
                      onClick={() => setSelectedImage(src)}
                    >
                      <img src={src} alt={`Variation ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-muted-foreground">10 unique AI enhancements delivered in 48 hours.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-8 right-8 text-white hover:text-primary transition-colors">
                <X className="w-8 h-8" />
              </button>
              <img 
                src={selectedImage} 
                alt="Full size" 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" 
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
