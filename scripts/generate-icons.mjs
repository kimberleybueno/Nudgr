import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "icons");

/**
 * Nudgr icon: bold geometric lowercase "n" with a forward-leaning kick
 * accent stroke and a dot. Rendered in white on a sage gradient rounded
 * square. The "n" is drawn as primitives (rect + arc) for crisp scaling.
 */
const baseSvg = ({ size, maskable }) => {
  const pad = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - pad * 2;
  const radius = maskable ? 0 : Math.round(size * 0.22);

  // Coordinates of the "n" mark inside the inner square
  const cx = size / 2;
  const cy = size / 2;
  const nW = inner * 0.46;            // width of the "n"
  const nH = inner * 0.42;            // height of the "n"
  const strokeW = inner * 0.13;       // stroke thickness
  const x0 = cx - nW / 2;
  const yBase = cy + nH / 2;          // baseline
  const yTop  = cy - nH / 2;
  const archR = nW / 2;

  // Path for the "n":
  //   Start bottom-left, go up the left leg
  //   Arc across the top (semicircle)
  //   Down the right leg to the baseline
  const left = `M ${x0} ${yBase} L ${x0} ${yTop + archR}`;
  const arch = `A ${archR} ${archR} 0 0 1 ${x0 + nW} ${yTop + archR}`;
  const right = `L ${x0 + nW} ${yBase}`;
  const nPath = `${left} ${arch} ${right}`;

  // Kick accent: a short stroke leaning forward off the right leg's foot
  const kickStart = { x: x0 + nW, y: yBase };
  const kickEnd   = { x: x0 + nW + inner * 0.13, y: yBase - inner * 0.10 };

  // Dot above the kick endpoint
  const dotR = inner * 0.045;
  const dotCx = kickEnd.x + inner * 0.02;
  const dotCy = yTop + inner * 0.03;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(165 0.5 0.5)">
      <stop offset="0%" stop-color="#4A6B4E"/>
      <stop offset="55%" stop-color="#7A9E7E"/>
      <stop offset="100%" stop-color="#97B099"/>
    </linearGradient>
  </defs>
  ${maskable ? `<rect width="${size}" height="${size}" fill="#4A6B4E"/>` : ""}
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${radius}" ry="${radius}" fill="url(#g)"/>
  <g fill="none" stroke="#ffffff" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${nPath}"/>
    <line x1="${kickStart.x}" y1="${kickStart.y}" x2="${kickEnd.x}" y2="${kickEnd.y}"/>
  </g>
  <circle cx="${dotCx}" cy="${dotCy}" r="${dotR}" fill="#ffffff"/>
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

await writeFile(join(OUT, "icon.svg"), baseSvg({ size: 512, maskable: false }));
await sharp(Buffer.from(baseSvg({ size: 32, maskable: false }))).png().toFile(join(OUT, "favicon-32.png"));
console.log("✓ done");
