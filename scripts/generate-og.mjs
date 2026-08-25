/**
 * Generates the Open Graph share cards into `public/og/`.
 *
 *   node scripts/generate-og.mjs
 *
 * Titles, taglines, and accents are read from the project MDX so the cards
 * cannot drift from the site. Re-run after editing a project's frontmatter.
 */
import { readdir, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const PAD = 88;
const BG = '#0a0b0c';
const TEXT = '#f2f3f4';
const MUTED = '#9aa1a8';
const FAINT = '#5d646b';
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'JetBrains Mono, Menlo, monospace';

const CONTENT = join(process.cwd(), 'src/content/projects');
const OUT = join(process.cwd(), 'public/og');

/** `28 68% 58%` -> `#rrggbb`; librsvg predates space-separated hsl(). */
function hslToHex(triple) {
  const [h, s, l] = triple.replace(/%/g, '').split(/\s+/).map(Number);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Greedy wrap. librsvg has no text layout, so lines are measured by estimate. */
function wrap(text, fontSize, maxWidth, maxLines) {
  const limit = Math.max(8, Math.floor(maxWidth / (fontSize * 0.5)));
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) {
        lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[,;:]$/, '')}…`;
        return lines;
      }
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function card({ eyebrow, title, tagline, accent, stack = [] }) {
  const titleSize = title.length > 18 ? 76 : 92;
  const titleLines = wrap(title, titleSize, W - PAD * 2, 2);
  const taglineLines = wrap(tagline, 27, W - PAD * 2 - 40, 2);

  const titleTop = 320;
  const titleBlock = titleLines
    .map(
      (l, i) =>
        `<tspan x="${PAD}" y="${titleTop + i * (titleSize * 1.06)}">${escapeXml(l)}</tspan>`,
    )
    .join('');
  const taglineTop = titleTop + (titleLines.length - 1) * (titleSize * 1.06) + 74;
  const taglineBlock = taglineLines
    .map((l, i) => `<tspan x="${PAD}" y="${taglineTop + i * 40}">${escapeXml(l)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="82%" cy="8%" r="72%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- brand row -->
  <g transform="translate(${PAD}, 74) scale(1.06)">
    <path fill="${accent}" fill-rule="evenodd"
      d="M14.1 6h3.8L24.6 26h-4L16 12.4 11.4 26h-4Zm-1.5 13.2h6.8v2.7h-6.8Z"/>
  </g>
  <text x="${PAD + 48}" y="${74 + 24}" font-family="${MONO}" font-size="16"
        letter-spacing="2.6" fill="${TEXT}">AMAN SRIVEN</text>

  <!-- accent rule -->
  <rect x="${PAD}" y="206" width="3" height="42" fill="url(#rule)"/>
  <text x="${PAD + 22}" y="235" font-family="${MONO}" font-size="16"
        letter-spacing="2.6" fill="${accent}">${escapeXml(eyebrow.toUpperCase())}</text>

  <text font-family="${FONT}" font-size="${titleSize}" font-weight="600"
        letter-spacing="-2.6" fill="${TEXT}">${titleBlock}</text>

  <text font-family="${FONT}" font-size="27" font-weight="400"
        letter-spacing="-0.3" fill="${MUTED}">${taglineBlock}</text>

  <!-- footer -->
  ${
    stack.length
      ? `<text x="${PAD}" y="${H - 132}" font-family="${MONO}" font-size="17"
              letter-spacing="0.6" fill="${FAINT}">${escapeXml(stack.slice(0, 6).join('  ·  '))}</text>`
      : ''
  }
  <rect x="${PAD}" y="${H - 96}" width="${W - PAD * 2}" height="1" fill="#ffffff" fill-opacity="0.09"/>
  <text x="${PAD}" y="${H - 52}" font-family="${MONO}" font-size="17"
        letter-spacing="0.4" fill="${FAINT}">amansriven.com</text>
</svg>`;
}

function frontmatter(raw) {
  const block = raw.split('---')[1] ?? '';
  const pick = (key) => {
    const m = block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };
  const stack = (block.match(/^stack:\n((?:\s+-\s+.+\n)+)/m)?.[1] ?? '')
    .split('\n')
    .map((l) => l.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
  return { title: pick('title'), tagline: pick('tagline'), accent: pick('accent'), stack };
}

await mkdir(OUT, { recursive: true });

const cards = [
  {
    name: 'default',
    eyebrow: 'Software Engineer',
    title: 'Aman Sriven',
    tagline: 'Infrastructure that carries real traffic, and products that reach real people.',
    accent: hslToHex('28 68% 58%'),
    stack: ['Kubernetes', 'Envoy', 'Python', 'TypeScript', 'PyTorch', 'Databricks'],
  },
  {
    // Mirrors `paper` in src/lib/research.ts. There is no frontmatter to read
    // for the research page, so keep these two in step by hand.
    name: 'research',
    eyebrow: 'Research Paper',
    title: 'SCRAN',
    tagline:
      'A hybrid residual-attention ensemble for smart contract vulnerability detection, across 111,897 Solidity contracts.',
    accent: hslToHex('264 44% 66%'),
    stack: ['PyTorch', 'Multi-head attention', 'Focal loss', 'SMOTE', 'Ensemble'],
  },
];

for (const file of (await readdir(CONTENT)).filter((f) => f.endsWith('.mdx'))) {
  const { title, tagline, accent, stack } = frontmatter(
    await readFile(join(CONTENT, file), 'utf8'),
  );
  cards.push({
    name: file.replace(/\.mdx$/, ''),
    eyebrow: 'Case Study',
    title,
    tagline,
    accent: hslToHex(accent),
    stack,
  });
}

// A faint grain layer. Without it, the radial glow bands badly once an
// 8-bit PNG quantises a near-black gradient.
const grain = await sharp({
  create: { width: W, height: H, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 5 } },
})
  .png()
  .toBuffer();

for (const c of cards) {
  const out = join(OUT, `${c.name}.png`);
  await sharp(Buffer.from(card(c)))
    .composite([{ input: grain, blend: 'overlay', opacity: 0.055 }])
    // A dithered 128-colour palette. Full-depth PNG of a grained gradient
    // runs ~855 KB; this lands near 57 KB with no visible banding.
    .png({ palette: true, colours: 128, dither: 1, compressionLevel: 9 })
    .toFile(out);
  console.log(`  ${c.name}.png  ${c.title}`);
}
console.log(`\n${cards.length} cards written to public/og/`);
