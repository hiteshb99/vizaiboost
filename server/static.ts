import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Fallback to index.html for Single Page App routing
  // Using a functional check to avoid Express 5 path-to-regexp string issues
  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api") &&
      !req.path.includes(".")
    ) {
      res.sendFile(path.resolve(distPath, "index.html"));
    } else {
      next();
    }
  });
}
