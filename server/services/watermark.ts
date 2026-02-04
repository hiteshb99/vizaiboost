import sharp from "sharp";
import path from "path";

/**
 * Applies a "VIZ AI TRIAL" watermark to an image.
 * @param inputPath Path to the input image.
 * @param outputPath Path to save the watermarked image.
 */
export async function applyWatermark(inputPath: string, outputPath: string): Promise<void> {
    const metadata = await sharp(inputPath).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    // Create a SVG overlay for the watermark
    const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          fill: rgba(255, 255, 255, 0.3);
          font-family: sans-serif;
          font-weight: 900;
          font-size: ${Math.floor(width / 15)}px;
          text-anchor: middle;
        }
      </style>
      <text 
        x="50%" 
        y="50%" 
        class="watermark" 
        transform="rotate(-45, ${width / 2}, ${height / 2})"
      >
        VIZ AI TRIAL • CREATE ACCOUNT TO UNLOCK
      </text>
    </svg>
  `;

    await sharp(inputPath)
        .composite([
            {
                input: Buffer.from(svgText),
                top: 0,
                left: 0,
            },
        ])
        .toFile(outputPath);
}
