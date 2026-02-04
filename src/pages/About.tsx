import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import CountUp from "react-countup";
import { Users, Globe, Award } from "lucide-react";

export default function About() {
  return (
    <PageTransition>
      <Helmet>
        <title>About Us | VizAI</title>
        <meta name="description" content="Learn about the team behind VizAI and our mission to revolutionize e-commerce content production." />
      </Helmet>
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">Our Story</h1>
          <p className="text-xl text-muted-foreground">
            Founded in 2026, VizAI was born from a simple idea: E-commerce moves fast, and visual content should too. We combine cutting-edge generative AI with human artistry.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-card border border-white/10 p-8 rounded-2xl text-center">
            <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
            <div className="text-4xl font-bold text-white mb-2">
              <CountUp end={24} duration={2} />+
            </div>
            <p className="text-muted-foreground">Countries Served</p>
          </div>
          <div className="bg-card border border-white/10 p-8 rounded-2xl text-center">
            <Users className="w-8 h-8 text-secondary mx-auto mb-4" />
            <div className="text-4xl font-bold text-white mb-2">
              <CountUp end={500} duration={2} />+
            </div>
            <p className="text-muted-foreground">Happy Clients</p>
          </div>
          <div className="bg-card border border-white/10 p-8 rounded-2xl text-center">
            <Award className="w-8 h-8 text-primary mx-auto mb-4" />
            <div className="text-4xl font-bold text-white mb-2">
              <CountUp end={48} duration={2} />h
            </div>
            <p className="text-muted-foreground">Average Delivery Time</p>
          </div>
        </div>

        {/* Story Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
              alt="Team collaboration"
              className="rounded-2xl shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-white">Global Reach, Local Touch</h2>
            <p className="text-muted-foreground leading-relaxed">
              Headquartered in Mauritius with a distributed team across 4 continents, we bring diverse perspectives to every project. Our registration (BRN C26012345) reflects our commitment to international business standards.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We don't just prompt and pray. Our proprietary VizAI Engine™ allows us to control lighting, texture, and composition with pixel-perfect precision, ensuring your brand guidelines are met every single time.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
