import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Services() {
  const features = [
    {
      title: "AI Product Photography",
      desc: "Perfect lighting, infinite angles. No physical studio required.",
      price: "Starting at $29/image",
      points: ["High-resolution (4K+)", "Transparent backgrounds", "Custom environments", "Color variations"]
    },
    {
      title: "Lifestyle & Context",
      desc: "Place your product in the hands of models or in realistic homes.",
      price: "Starting at $49/image",
      points: ["Diverse model demographic", "Interior/Exterior settings", "Seasonal themes", "Prop integration"]
    },
    {
      title: "Short-Form Video",
      desc: "Engaging 5-10s clips for social media ads and organic reach.",
      price: "Starting at $199/video",
      points: ["Motion graphics", "AI-generated movement", "Sound design included", "Vertical (9:16) format"]
    }
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>AI Content Services | VizAI Boost</title>
        <meta name="description" content="Explore our AI product photography, lifestyle scene generation, and short-form video services." />
      </Helmet>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">Our Services</h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive visual solutions powered by intelligence.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-heading font-bold text-white">{feature.title}</h2>
                <p className="text-xl text-muted-foreground">{feature.desc}</p>
                <div className="text-primary font-bold text-lg">{feature.price}</div>
                <ul className="space-y-3">
                  {feature.points.map((pt, j) => (
                    <li key={j} className="flex items-center text-muted-foreground">
                      <Check className="w-5 h-5 text-secondary mr-3" /> {pt}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Link href="/contact">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">Request Demo</Button>
                  </Link>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="aspect-video bg-card border border-white/10 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {/* Service visual */}
                  <img 
                    src={i === 0 
                      ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop" 
                      : i === 1 
                      ? "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop" 
                      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
                    } 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
