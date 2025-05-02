const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, "../public/icons");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Draw background
  ctx.fillStyle = "#990000";
  ctx.fillRect(0, 0, size, size);

  // Draw "USC" text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("USC", size / 2, size / 2);

  // Save the image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, `icon-${size}x${size}.png`), buffer);
});
