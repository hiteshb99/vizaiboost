import { build as viteBuild } from "vite";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
    try {
        console.log("🚀 Starting build process...");

        // 1. Clean dist directory
        const distPath = path.resolve(__dirname, "../dist");
        if (fs.existsSync(distPath)) {
            fs.removeSync(distPath);
        }

        // 2. Build Frontend
        console.log("📦 Building frontend with Vite...");
        await viteBuild();

        // 3. Prepare server for production (optional, could just use tsx)
        // For now, we rely on the server running with tsx or index.ts directly 
        // but we ensure the public folder exists in dist.

        console.log("✅ Build complete!");
    } catch (error) {
        console.error("❌ Build failed:", error);
        process.exit(1);
    }
}

build();
