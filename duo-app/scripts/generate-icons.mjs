import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function drawDuoIcon(ctx, size) {
  const bg = '#D4537E';
  const r = size / 2;

  // Background circle / rounded rect
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Two overlapping circles (Duo logo)
  const cx1 = size * 0.38;
  const cx2 = size * 0.62;
  const cy = size * 0.5;
  const cr = size * 0.26;

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx1, cy, cr, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx2, cy, cr, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

const sizes = [192, 512];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawDuoIcon(ctx, size);
  const buf = canvas.toBuffer('image/png');
  const outPath = join(__dirname, '..', 'public', 'icons', `icon-${size}.png`);
  writeFileSync(outPath, buf);
  console.log(`Generated ${outPath}`);
}
