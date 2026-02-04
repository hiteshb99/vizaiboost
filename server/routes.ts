import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import { isAuthenticated } from "./auth";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerPaymentRoutes } from "./payment/routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getBaseUrl } from "./services/stripe";
import { applyWatermark } from "./services/watermark";
import { registerAdminRoutes } from "./admin_routes";

// Configure multer for local file storage
const uploadDir = path.resolve(process.cwd(), "public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Google Auth
  await setupAuth(app);

  // Register AI Integrations
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Register Object Storage routes for image uploads (keeping existing logic)
  registerObjectStorageRoutes(app);

  // Register Payment Routes
  registerPaymentRoutes(app);

  // Register Admin Routes
  registerAdminRoutes(app);

  // Serve the uploads directory statically to ensure immediate access
  app.use('/uploads', express.static(uploadDir));

  // New route for public image upload
  app.post('/api/upload-image', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Construct public URL
      // Since we are serving 'client/public' as root in production, 
      // and we added specific middleware for '/uploads', this should work.
      const publicUrl = `/uploads/${req.file.filename}`;

      res.status(201).json({
        url: publicUrl,
        filename: req.file.filename,
        size: req.file.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // Helper function to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Retry wrapper with exponential backoff for rate limits
  async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 30000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const isRateLimit = error?.status === 429 ||
          error?.message?.includes('429') ||
          error?.message?.includes('Too Many Requests') ||
          error?.message?.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit && attempt < maxRetries) {
          const waitTime = baseDelayMs * Math.pow(2, attempt);
          console.log(`Rate limit hit (attempt ${attempt + 1}/${maxRetries + 1}). Waiting ${waitTime / 1000}s before retry...`);
          await delay(waitTime);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  // Professional Studio Style Presets
  const stylePresets: Record<string, string> = {
    white: 'Pure white seamless cyclorama wall, soft high-key studio lighting, subtle professional contact shadow, clean Amazon-ready aesthetic',
    minimalist: 'Minimalist architectural space, warm beige plaster walls, single organic marble block, sharp morning sunlight with elegant shadows',
    luxury: 'Black polished obsidian surface, dramatic rim lighting, golden hour reflection, out-of-focus high-end boutique interior',
    cyberpunk: 'Dark futuristic street, neon blue and magenta lighting, rain-slicked pavement reflections, cinematic volumetric fog',
    tropical: 'Lush exotic monstera leaves, dappled sunlight filtering through palms, warm wooden texture, vibrant natural atmosphere',
    industrial: 'Raw concrete loft, aged brick wall, overhead industrial pendant light, moody shadows, edgy commercial vibe',
    nordic: 'Light oak wood surface, soft diffused overcast daylight, neutral grey tones, clean Scandinavian aesthetic',
    vogue: 'High-contrast fashion studio, deep red velvet backdrop, sharp spotlight, high-fashion editorial mood'
  };

  // Gemini Image Generation endpoint
  app.post('/generate', upload.single('file'), async (req: any, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google AI API key not configured" });
      }

      // 0. Credit Check (Authenticated Users Only - Fetch fresh from DB)
      if (req.isAuthenticated()) {
        const freshUser = await storage.getUser(req.user.id);
        if (!freshUser || (freshUser.credits || 0) < 1) {
          return res.status(403).json({ error: "INSUFFICIENT_CREDITS", message: "You have 0 credits. Please upgrade your plan." });
        }
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      console.log("🚀 ACTIVATING MULTIMODAL ENGINE: gemini-2.5-flash-image");
      // Use gemini-2.5-flash-image for stable multimodal output support (Image + Text)
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: {
          ...({ responseModalities: ["image", "text"] } as any)
        }
      });

      const userPrompt = req.body.user_prompt || req.body.userPrompt || "";
      const selectedStyle = req.body.style || 'minimalist';
      const stylePrompt = stylePresets[selectedStyle] || stylePresets.minimalist;
      const imageUrl = req.body.image_url || req.body.imageUrl;

      // Extract individual preset parameters
      const focalLength = req.body.focal_length || '';
      const lighting = req.body.lighting || '';
      const aspectRatio = req.body.aspect_ratio || '';
      const influencer = req.body.influencer || '';
      const enhance = req.body.enhance === 'true'; // Extract enhanced mode
      const colorGrading = req.body.color_grading || ''; // Extract color grading

      // Build the comprehensive prompt with all presets properly integrated
      const systemPrompt = `ACT AS A PRESTIGIOUS COMMERCIAL PHOTOGRAPHER. 
      
      CAMERA SETUP:
      ${focalLength ? `- LENS: ${focalLength} - Apply the characteristic optical properties (compression, distortion, bokeh, depth of field) of this focal length.` : ''}
      ${lighting ? `- LIGHTING: ${lighting} - Replicate this exact lighting mood and atmosphere.` : ''}
      ${aspectRatio ? `- COMPOSITION: ${aspectRatio} - Frame the shot in this aspect ratio and composition style.` : ''}
      ${colorGrading ? `- COLOR SCIENCE: Apply ${colorGrading} color grading. Replicate the specific film stock or cinema look (contrast curve, saturation, grain structure, white balance).` : ''}

      ${enhance ? `
      MAGIC ENHANCE ENABLED:
      - CRITICAL: OPTIMIZE EVERYTHING.
      - Apply professional retraining to the image.
      - Maximize sharpness, dynamic range, and clarity.
      - Ensure perfect lighting balance and removal of any artifacts.
      - Make the product look 10x more expensive/premium.
      ` : ''}
      
      ${influencer ? `HUMAN MODEL: ${influencer}
The model should be naturally holding or presenting the product in a lifestyle context.
` : 'PRODUCT FOCUS: No human models. The product is the sole subject.'}
      
      TASK: 
      1. CRITICAL: Re-create the uploaded product image in a professional studio setting.
      2. OPTICS: Strictly follow the lens characteristics specified above.
      3. CINEMATIC STORYTELLER: Generate a "Social Storytelling Kit" in text. This must include:
         - **THE HOOK**: A 1-sentence scroll-stopping headline.
         - **THE VIBE**: A 2-word aesthetic description (e.g. "Minimalist Noir").
         - **SCENE SCRIPT**: A 15-second TikTok/Reel script describing the camera movement and mood.
         - **AD BLUEPRINT**: 3 high-converting captions (Minimalist, Problem/Solution, Emotional).
      
      STUDIO STANDARDS:
      - Camera: Phase One XF IQ4 (150MP).
      - Quality: 8k resolution, razor-sharp focus on the product, cinematic depth of field.
      
      RULES:
      - PRODUCT INTEGRITY: The product silhouette, color, and labels must be 100% accurate.
      - BACKGROUND: High-end context based on: ${stylePrompt}.
      
      ${userPrompt || "High-end consumer product"}`;

      let imageParts: any[] = [];

      // ... existing image handling remains same ... (I'll keep it for the replacement)
      if (req.file) {
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype || 'image/jpeg';
        imageParts.push({ inlineData: { data: base64Image, mimeType: mimeType } });
      } else if (imageUrl) {
        try {
          const imageResponse = await fetch(imageUrl);
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          imageParts.push({ inlineData: { data: base64Image, mimeType: contentType } });
        } catch (fetchError) {
          console.error("Failed to fetch image from URL:", fetchError);
          return res.status(400).json({ error: "Failed to fetch reference image" });
        }
      }

      if (imageParts.length === 0) return res.status(400).json({ error: "No image provided." });

      const result = await retryWithBackoff(async () => {
        return await model.generateContent([systemPrompt, ...imageParts]);
      }, 3, 30000);

      const response = await result.response;
      const candidates = response.candidates;
      let generatedImageUrl = null;
      let marketingBlueprint = "";

      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content?.parts || []) {
          if ((part as any).inlineData?.data) {
            const imageData = (part as any).inlineData.data;
            const filename = `generated-${Date.now()}.png`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
            generatedImageUrl = `/uploads/${filename}`;
          }
          if (part.text) {
            marketingBlueprint = part.text;
          }
        }
      }

      if (generatedImageUrl) {
        // If user is guest, apply watermark
        if (!req.isAuthenticated()) {
          const absolutePath = path.join(uploadDir, path.basename(generatedImageUrl));
          const watermarkedFilename = `watermarked-${path.basename(generatedImageUrl)}`;
          const watermarkedPath = path.join(uploadDir, watermarkedFilename);

          await applyWatermark(absolutePath, watermarkedPath);
          generatedImageUrl = `/uploads/${watermarkedFilename}`;
        } else {
          // 4. Deduct Credit for Authenticated Users (Fetch latest from DB)
          const latestUser = await storage.getUser(req.user.id);
          if (latestUser) {
            await storage.updateUserCredits(req.user.id, (latestUser.credits || 0) - 1);
          }
        }

        return res.json({
          image: generatedImageUrl,
          blueprint: marketingBlueprint,
          isGuest: !req.isAuthenticated()
        });
      }

      return res.status(400).json({ error: "Generation issue. AI Feedback: " + (response.text?.() || "") });

    } catch (error: any) {
      console.error("Gemini generation error:", error);

      const isQuotaExhausted = error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');

      if (isQuotaExhausted) {
        return res.status(429).json({
          error: "API quota exhausted. Please try again later.",
          retryAfter: 60
        });
      }

      return res.status(500).json({
        error: error.message || "Failed to generate image"
      });
    }
  });

  // --- Smart Variations Endpoint (A/B Testing) ---
  app.post('/generate-variations', upload.single('file'), async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key missing" });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["image"] } as any
      });

      const styles = [
        { id: 'minimalist', label: 'Minimalist Clean', prompt: stylePresets.minimalist },
        { id: 'luxury', label: 'Dark Luxury', prompt: stylePresets.luxury },
        { id: 'lifestyle', label: 'Lifestyle Natural', prompt: 'Natural lifestyle setting, authentic home environment, soft daylight, lived-in feel' },
        { id: 'studio', label: 'Bright Studio', prompt: stylePresets.white }
      ];

      // Prepare image parts
      let imageParts: any[] = [];
      if (req.file) {
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        imageParts.push({ inlineData: { data: base64Image, mimeType: req.file.mimetype } });
      } else if (req.body.image_url) {
        // Url handling fallback
      }

      if (imageParts.length === 0) return res.status(400).json({ error: "No image provided." });

      // Parallel Generation
      const generationPromises = styles.map(async (style) => {
        const systemPrompt = `ACT AS A PRESTIGIOUS COMMERCIAL PHOTOGRAPHER.
        TASK: Re-create the uploaded product in a ${style.label} style.
        STYLE GUIDE: ${style.prompt}
        PRODUCT NAME: ${req.body.user_prompt || 'The product'}
        REQUIREMENTS: 
        - High-end professional photography
        - 8k resolution
        - Strict adherence to the ${style.label} aesthetic
        `;

        try {
          const result = await model.generateContent([systemPrompt, ...imageParts]);
          const response = await result.response;
          const candidates = response.candidates;

          if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content?.parts || []) {
              if ((part as any).inlineData?.data) {
                const imageData = (part as any).inlineData.data;
                const filename = `variant-${style.id}-${Date.now()}.png`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
                return {
                  id: style.id,
                  label: style.label,
                  image: `/uploads/${filename}`
                };
              }
            }
          }
          return null;
        } catch (e) {
          console.error(`Variation ${style.id} failed:`, e);
          return null;
        }
      });

      const results = await Promise.all(generationPromises);
      const successfulVariations = results.filter(r => r !== null);

      if (successfulVariations.length === 0) {
        return res.status(500).json({ error: "Failed to generate any variations." });
      }

      res.json({ variations: successfulVariations });

    } catch (error) {
      console.error("Variations Error:", error);
      res.status(500).json({ error: "Failed to run variations engine." });
    }
  });

  // --- Scene Intelligence Endpoint (Auto-Detect) ---
  app.post('/analyze-image', upload.single('file'), async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key missing" });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["text"] } as any
      });

      if (!req.file) return res.status(400).json({ error: "No image provided" });

      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');
      const imagePart = { inlineData: { data: base64Image, mimeType: req.file.mimetype } };

      const prompt = `ACT AS A WORLD-CLASS COMMERCIAL PHOTOGRAPHER & STYLIST.
      Analyze this product image.
      Return a STRICT JSON object (no markdown, no backticks) with:
      
      {
        "productName": "Short descriptive name (e.g. 'Luxury Leather Tote')",
        "category": "Product category",
        "suggestedStyle": "One of [minimalist, luxury, lifestyle, studio, neon, nature, zen]",
        "suggestedLighting": "One of [soft, cinematic, golden-hour, studio-strobe, neon-punk, dramatic]",
        "suggestedPrompt": "A highly descriptive, creative background prompt for a commercial shot.",
        "marketingHook": "A 5-word marketing hook."
      }
      `;

      try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/(\`\`\`json|\`\`\`)/g, '').trim();
        const data = JSON.parse(jsonStr);

        res.json(data);
      } catch (e) {
        console.error("Analysis failed:", e);
        res.status(500).json({ error: "Failed to analyze image." });
      }

    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // --- Multi-Angle Generation Endpoint (360° Studio) ---
  app.post('/generate-angles', upload.single('file'), async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key missing" });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["image"] } as any
      });

      if (!req.file) return res.status(400).json({ error: "No image provided" });

      // Parse angles from request body (expects comma-separated string or array)
      let requestedAngles: string[] = [];
      if (req.body.angles) {
        requestedAngles = Array.isArray(req.body.angles) ? req.body.angles : req.body.angles.split(',');
      } else {
        requestedAngles = ['side', 'top', 'back']; // default
      }

      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');
      const imagePart = { inlineData: { data: base64Image, mimeType: req.file.mimetype } };

      const productName = req.body.productName || "product";

      // Parallel Generation for each angle
      const anglePromises = requestedAngles.map(async (angle) => {
        const systemPrompt = `ACT AS A 3D PRODUCT VISUALIZATION EXPERT.
        TASK: Generate a photorealistic image of this EXACT ${productName} from the ${angle.toUpperCase()} view.
        
        CRITICAL REQUIREMENTS:
        - PERSPECTIVE: Strictly ${angle} view.
        - CONSISTENCY: Keep color, materials, logos, and shape 100% identical to the input image.
        - BACKGROUND: Clean studio grey or white background to isolate the subject.
        - QUALITY: 8k resolution, sharp focus.
        `;

        try {
          const result = await model.generateContent([systemPrompt, imagePart]);
          const response = await result.response;

          // Helper to extract image data (reused logic)
          // Simplified for brevity/robustness
          const candidates = response.candidates;
          if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content?.parts || []) {
              if ((part as any).inlineData?.data) {
                const imageData = (part as any).inlineData.data;
                const filename = `angle-${angle}-${Date.now()}.png`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
                return { angle, image: `/uploads/${filename}` };
              }
            }
          }
          return null;
        } catch (e) {
          console.error(`Angle ${angle} failed:`, e);
          return null;
        }
      });

      const results = await Promise.all(anglePromises);
      const successfulAngles = results.filter(r => r !== null);

      if (successfulAngles.length === 0) {
        return res.status(500).json({ error: "Failed to generate any angles." });
      }

      res.json({ angles: successfulAngles });

    } catch (error) {
      console.error("Multi-Angle Error:", error);
      res.status(500).json({ error: "Failed to generate angles." });
    }
  });

  // --- Batch Processing Endpoint (High-Ticket Feature) ---
  app.post('/batch-generate', upload.array('files', 50), async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API Key missing" });

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const files = req.files as Express.Multer.File[];
      const { style, lighting, focal_length, influencer, enhance } = req.body;
      const userPrompt = req.body.user_prompt || "Professional product photography";

      // IMPORTANT: In a real app, we would use a job queue (BullMQ/Redis).
      // For this MVP, we'll process in chunks of 3 to avoid hitting rate limits too hard.
      const CHUNK_SIZE = 3;
      const results: string[] = [];

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["image"] } as any
      });

      // Helper for single generation
      const processFile = async (file: Express.Multer.File) => {
        try {
          const imageBuffer = fs.readFileSync(file.path);
          const base64Image = imageBuffer.toString('base64');
          const imagePart = { inlineData: { data: base64Image, mimeType: file.mimetype } };

          const systemPrompt = `ACT AS A COMMERCIAL PRODUCT PHOTOGRAPHER.
            Style: ${style || 'Minimalist'}
            Lighting: ${lighting || 'Soft Studio'}
            Product: ${userPrompt}
            Enhance: ${enhance === 'true' ? 'YES (Maximize detail, sharpness, dynamic range)' : 'NO'}
            
            Generate a high-quality studio shot of this product.`;

          const result = await model.generateContent([systemPrompt, imagePart]);
          const response = await result.response;

          // Extract image
          const candidates = response.candidates;
          if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content?.parts || []) {
              if ((part as any).inlineData?.data) {
                const imageData = (part as any).inlineData.data;
                const filename = `batch-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
                return `/uploads/${filename}`;
              }
            }
          }
          return null;
        } catch (e) {
          console.error(`Batch item failed:`, e);
          return null;
        }
      };

      // Process in chunks
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.all(chunk.map(file => processFile(file)));
        chunkResults.forEach(r => { if (r) results.push(r); });
      }

      if (results.length === 0) {
        return res.status(500).json({ error: "Batch processing failed completely." });
      }

      res.json({ images: results });

    } catch (error) {
      console.error("Batch Error:", error);
      res.status(500).json({ error: "Batch processing failed." });
    }
  });

  // Brand Polish Endpoint
  app.post('/api/brand-polish', upload.single('logo'), async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      const { image_url, style, border_style } = req.body;
      const logoFile = req.file;

      if (!apiKey) return res.status(500).json({ error: "Google AI API key not configured" });
      if (!logoFile) return res.status(400).json({ error: "No logo uploaded" });
      if (!image_url) return res.status(400).json({ error: "No image URL provided" });

      const genAI = new GoogleGenerativeAI(apiKey);
      console.log("🚀 ACTIVATING BRAND POLISH ENGINE: gemini-2.5-flash-image");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: {
          ...({ responseModalities: ["image"] } as any)
        }
      });

      // 1. Prepare Logo
      const logoBuffer = fs.readFileSync(logoFile.path);
      const logoBase64 = logoBuffer.toString('base64');
      const logoMimeType = logoFile.mimetype || 'image/png';

      // 2. Prepare Source Image
      let sourceBase64 = "";
      let sourceMimeType = "image/png";

      if (image_url.startsWith('/uploads/')) {
        const localPath = path.join(uploadDir, path.basename(image_url));
        if (fs.existsSync(localPath)) {
          const sourceBuffer = fs.readFileSync(localPath);
          sourceBase64 = sourceBuffer.toString('base64');
          if (localPath.endsWith('.jpg') || localPath.endsWith('.jpeg')) sourceMimeType = 'image/jpeg';
        }
      }

      if (!sourceBase64) {
        // Fallback to fetch if path not found
        const url = image_url.startsWith('http') ? image_url : `${getBaseUrl()}${image_url}`;
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        sourceBase64 = Buffer.from(buffer).toString('base64');
        sourceMimeType = response.headers.get('content-type') || 'image/png';
      }

      const systemPrompt = `ACT AS A SENIOR BRAND DESIGNER. 
      INPUT: 
      1. A professional AI-generated product rendering (already contains a high-end studio environment).
      2. User's brand logo.
      
      TASK:
      1. PRESERVATION: CRITICAL - STICK TO THE CURRENT ENVIRONMENT. Do NOT replace the background or the product. The rendering you see is the intended final scene; preserve every pixel of the product and its setting.
      2. FRAMING: Generate a highly stylized border *around* this existing rendering. STYLE INSTRUCTION: ${border_style || 'elegant white or black gallery frame'}. This border should act as a physical frame for the image.
      3. BRANDING: Place the provided logo in the bottom-right corner of the image (inside the frame) with 15% padding and a subtle drop shadow to make it feel integrated.
      
      OUTPUT: A single polished, commercial-ready branded asset that preserves the source rendering exactly but adds the professional frame and logo.`;

      const result = await model.generateContent([
        systemPrompt,
        { inlineData: { data: sourceBase64, mimeType: sourceMimeType } },
        { inlineData: { data: logoBase64, mimeType: logoMimeType } }
      ]);

      const response = await result.response;
      const candidates = response.candidates;
      let brandedImageUrl = null;

      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content?.parts || []) {
          if ((part as any).inlineData?.data) {
            const imageData = (part as any).inlineData.data;
            const filename = `branded-${Date.now()}.png`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
            brandedImageUrl = `/uploads/${filename}`;
          }
        }
      }

      if (brandedImageUrl) {
        return res.json({ image: brandedImageUrl });
      }

      return res.status(500).json({ error: "Failed to apply brand polish. AI did not return an image." });

    } catch (error: any) {
      console.error("Brand Polish Error:", error);
      res.status(500).json({ error: error.message || "Branding failed" });
    }
  });

  // API Routes
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const input = api.contact.submit.input.parse(body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Protected Upload Routes
  app.post(api.uploads.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const input = api.uploads.create.input.parse({ ...body, userId });
      const upload = await storage.createUpload(input);
      res.status(201).json(upload);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.uploads.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const uploads = await storage.getUploadsByUserId(userId);
      res.json(uploads);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Logs Endpoint
  app.get('/api/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await storage.getAllPromptLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
