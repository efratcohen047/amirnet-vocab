// One-off: writes the PWA icons as PNGs using only Node built-ins.
// Design: solid blue background with a white open book (two pages and a spine gap).
// Run: node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x1f, 0x6f, 0xeb];
const FG = [0xff, 0xff, 0xff];
const LINE = [0xc9, 0xdc, 0xfb];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Returns the colour of pixel (x, y) in an icon of the given size.
function pixel(x, y, size) {
  const u = x / size;
  const v = y / size;
  // Book occupies the middle of the maskable safe zone.
  const top = 0.3;
  const bottom = 0.72;
  const left = 0.22;
  const right = 0.78;
  const spine = 0.025;
  if (v < top || v > bottom || u < left || u > right) return BG;
  if (Math.abs(u - 0.5) < spine) return BG;
  // Text lines on each page.
  const lineV = (v - top) / (bottom - top);
  const inPageMargin = Math.abs(u - 0.5) > 0.07 && u > left + 0.05 && u < right - 0.05;
  if (inPageMargin && lineV > 0.15 && lineV < 0.85 && Math.floor(lineV * 14) % 3 === 0) return LINE;
  return FG;
}

function png(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png(size));
  console.log(`wrote public/${name}`);
}
