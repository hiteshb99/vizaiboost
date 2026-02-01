import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";

export default function Blog() {
  const posts = [
    {
      title: "The Future of AI in E-commerce 2026",
      date: "Oct 12, 2026",
      excerpt: "How generative models are replacing traditional photoshoots for good.",
      img: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=600&q=80"
    },
    {
      title: "Optimizing Visuals for Conversion",
      date: "Sep 28, 2026",
      excerpt: "Why lighting and composition matter more than resolution.",
      img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80"
    },
    {
      title: "Case Study: Brand X Growth",
      date: "Aug 15, 2026",
      excerpt: "How we helped a sneaker brand scale their catalog in 48 hours.",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
    }
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Blog | VizAI Boost</title>
        <meta name="description" content="Insights on AI, design, and the future of e-commerce commerce." />
      </Helmet>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">Insights</h1>
          <p className="text-xl text-muted-foreground">
            Thoughts on AI, design, and the future of commerce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="rounded-2xl overflow-hidden mb-6 border border-white/5 relative aspect-video">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-sm text-primary mb-2 font-medium">{post.date}</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <div className="flex items-center text-white font-medium group-hover:text-primary transition-colors">
                Read Article <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
