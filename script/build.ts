import { build as viteBuild } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
    try {
        console.log("🚀 CLEAN BUILD STARTING (WITHOUT FS-EXTRA)...");
        console.log("🚀 Starting build process...");

        // 1. Clean dist directory
        const distPath = path.resolve(__dirname, "../dist");
        if (fs.existsSync(distPath)) {
            console.log("🧹 Cleaning dist directory...");
            fs.rmSync(distPath, { recursive: true, force: true });
        }

        // 2. Build Frontend
        console.log("📦 Building frontend with Vite...");
        await viteBuild();

        console.log("✅ Build complete!");
    } catch (error) {
        console.error("❌ Build failed:", error);
        process.exit(1);
    }
}

build();
