import type { Express, Request, Response } from "express";

export function registerImageRoutes(app: Express): void {
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, image } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      // 1. Verification Step (Enhanced Simulated Verification)
      const lowercasePrompt = prompt.toLowerCase();
      const suspiciousTerms = ["person", "human", "face", "nude", "explicit"];
      if (suspiciousTerms.some(term => lowercasePrompt.includes(term))) {
        return res.status(400).json({ error: "Invalid product description. Please focus on commercial objects." });
      }

      // 2. Multi-generation logic with specialized environmental prompts
      const variations = [
        {
          name: "Minimalist Studio",
          prompt: "luxury minimalist marble studio, dramatic overhead spotlight, clean professional staging"
        },
        {
          name: "Tech Showcase",
          prompt: "futuristic high-tech showroom, neon blue fiber optic accents, glass and polished metal surfaces"
        },
        {
          name: "Clean Commercial",
          prompt: "high-end commercial catalog photography, soft box lighting, pure white background, soft shadows"
        },
        {
          name: "Lifestyle Loft",
          prompt: "modern industrial loft, warm natural window light, rustic wood textures, cinematic bokeh"
        }
      ];

      const generateVariation = async (v: { name: string, prompt: string }) => {
        // We use Flux via Pollinations for the best identity preservation and prompt adherence on free tier
        // Flux handles "identical product" instructions much better than SDXL base without ControlNet
        const encodedPrompt = encodeURIComponent(
          `Professional ${v.name} photography. The product is a ${prompt}. ` +
          `IMPORTANT: The product MUST remain 100% IDENTICAL to the reference image in shape, color, and branding. ` +
          `Environment: ${v.prompt}. 8k resolution, sharp focus, commercial quality.`
        );
        
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&model=flux&nologo=true`;
        
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error("Pollinations failed");
          const buffer = await response.arrayBuffer();
          return Buffer.from(buffer).toString('base64');
        } catch (e) {
          // Final fallback to SDXL if Pollinations is down
          const sdxlRes = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              body: JSON.stringify({
                inputs: `Product: ${prompt}. Environment: ${v.prompt}. EXACT SAME details.`,
                image: image.replace(/^data:image\/\w+;base64,/, ""),
                parameters: { denoising_strength: 0.25 }
              }),
            }
          );
          const buffer = await sdxlRes.arrayBuffer();
          return Buffer.from(buffer).toString('base64');
        }
      };

      // Run generations in parallel
      const results = await Promise.all(variations.map(v => generateVariation(v)));

      res.json({
        images: results
      });
    } catch (error) {
      console.error("Error generating images:", error);
      res.status(500).json({ error: "Neural engine synchronization failed. Please check your product description." });
    }
  });
}

