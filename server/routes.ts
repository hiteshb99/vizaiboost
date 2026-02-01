import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerPaymentRoutes } from "./payment/routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Register AI Integrations
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Register Object Storage routes for image uploads (keeping existing logic)
  registerObjectStorageRoutes(app);

  // Register Payment Routes
  registerPaymentRoutes(app);

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

  // Style presets for generation
  const stylePresets: Record<string, string> = {
    white: 'pure white seamless background #FFFFFF, soft studio lighting, gentle shadows, Amazon compliant, product centered filling 85% frame',
    transparent: 'clean transparent background, high contrast, sharp edges, professional product cutout',
    studio: 'Professional minimalist studio, clean neutral backdrop, softbox lighting, 8k.',
    lifestyle: 'Natural lighting, realistic home/office environment, soft bokeh, warm tones.',
    luxury: 'Elegant marble and velvet, dramatic rim lighting, high-end boutique feel.',
    black: 'dramatic solid black background, luxury product lighting, rim lights, high contrast',
    blue: 'clean solid blue background, professional commercial lighting, vibrant atmosphere',
    green: 'clean solid green background, professional commercial lighting, fresh and natural feel'
  };

  // Gemini Image Generation endpoint
  app.post('/generate', upload.single('file'), async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google AI API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.5-flash-image for better stability and higher free-tier quota
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: {
          // Fix for LSP error: responseModalities is not recognized by some type definitions but may be required for older SDK versions
          // Casting to any to bypass strict type checking while keeping functionality
          ...({ responseModalities: ["image", "text"] } as any)
        }
      });

      const userPrompt = req.body.user_prompt || req.body.userPrompt || "";
      const selectedStyle = req.body.style || 'studio';
      const stylePrompt = stylePresets[selectedStyle] || stylePresets.studio;
      const imageUrl = req.body.image_url || req.body.imageUrl;

      // Build the prompt for product photography with professional photography keywords
      const systemPrompt = `Professional commercial photography of the subject in this image. Environment: ${stylePrompt}. Keep the subject 100% identical in shape and detail. Output a single high-quality variation. Product details: ${userPrompt}`;

      let imageParts: any[] = [];

      // Handle uploaded file
      if (req.file) {
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype || 'image/jpeg';

        imageParts.push({
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        });
      } else if (imageUrl) {
        // Fetch image from URL
        try {
          const imageResponse = await fetch(imageUrl);
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

          imageParts.push({
            inlineData: {
              data: base64Image,
              mimeType: contentType
            }
          });
        } catch (fetchError) {
          console.error("Failed to fetch image from URL:", fetchError);
          return res.status(400).json({ error: "Failed to fetch reference image" });
        }
      }

      if (imageParts.length === 0) {
        return res.status(400).json({ error: "No image provided. Please upload a product photo." });
      }

      console.log(`Generating ${selectedStyle} product photo variation for: ${userPrompt.substring(0, 50)}...`);

      // Generate content with image using retry mechanism for rate limits
      const result = await retryWithBackoff(async () => {
        return await model.generateContent([
          systemPrompt,
          ...imageParts
        ]);
      }, 3, 30000);

      const response = await result.response;

      // Try to extract any generated image data
      const candidates = response.candidates;
      let generatedImageUrl = null;

      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content?.parts || []) {
          if ((part as any).inlineData?.data) {
            const imageData = (part as any).inlineData.data;
            const mimeType = (part as any).inlineData.mimeType || 'image/png';

            // Save generated image to uploads folder
            const filename = `generated-${Date.now()}.png`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
            generatedImageUrl = `/uploads/${filename}`;
            break;
          }
        }
      }

      if (generatedImageUrl) {
        console.log(`Generated image saved: ${generatedImageUrl}`);

        // Log the prompt (attach to user if logged in)
        try {
          const userId = (req as any).user?.claims?.sub || null;
          const productName = userPrompt.split('.')[0] || 'Unknown Product';

          await storage.logPrompt({
            userId,
            productName,
            prompt: userPrompt,
            style: selectedStyle,
            imageUrl: generatedImageUrl
          });
        } catch (logError) {
          console.error("Failed to log prompt:", logError);
        }

        return res.json({ image: generatedImageUrl });
      }

      // If no image was generated, return the text analysis
      const text = response.text?.() || "";
      console.log("No image generated, returning analysis");
      return res.json({
        error: "Image generation not available with current model. Analysis: " + text.substring(0, 200)
      });

    } catch (error: any) {
      console.error("Gemini generation error:", error);

      // Check for quota exhaustion and return clear error
      const isQuotaExhausted = error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');

      if (isQuotaExhausted) {
        return res.status(429).json({
          error: "API quota exhausted. Please try again later or upgrade your API plan.",
          retryAfter: 60
        });
      }

      return res.status(500).json({
        error: error.message || "Failed to generate image"
      });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const uploads = await storage.getUploadsByUserId(userId);
      res.json(uploads);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Logs Endpoint
  app.get('/api/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      // For now, any authenticated user can see logs in this MVP
      // We could add an admin check here later
      const logs = await storage.getAllPromptLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
