import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "icons");

const baseSvg = ({ size, maskable }) => {
  const pad = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - pad * 2;
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const fontSize = Math.round(inner * 0.55);
  const cx = size / 2;
  const cy = size / 2 + fontSize * 0.06;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(165 0.5 0.5)">
      <stop offset="0%" stop-color="#4A6B4E"/>
      <stop offset="100%" stop-color="#7A9E7E"/>
    </linearGradient>
  </defs>
  ${maskable ? `<rect width="${size}" height="${size}" fill="#4A6B4E"/>` : ""}
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${radius}" ry="${radius}" fill="url(#g)"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif"
        font-size="${fontSize}" font-weight="700" fill="#ffffff">✦</text>
</svg>`;
};

const sizes = [
  { name: "icon-72.png", size: 72 },
  { name: "icon-96.png", size: 96 },
  { name: "icon-128.png", size: 128 },
  { name: "icon-144.png", size: 144 },
  { name: "icon-152.png", size: 152 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-384.png", size: 384 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192-maskable.png", size: 192, maskable: true },
  { name: "icon-512-maskable.png", size: 512, maskable: true },
];

await mkdir(OUT, { recursive: true });

for (const { name, size, maskable } of sizes) {
  const svg = baseSvg({ size, maskable: !!maskable });
  await sharp(Buffer.from(svg)).png().toFile(join(OUT, name));
  console.log(`✓ ${name}`);
}

// also write a favicon.ico-friendly png and the source SVG
await writeFile(join(OUT, "icon.svg"), baseSvg({ size: 512, maskable: false }));
await sharp(Buffer.from(baseSvg({ size: 32, maskable: false }))).png().toFile(join(OUT, "favicon-32.png"));
console.log("✓ done");
