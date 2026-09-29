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

/* Mirrors the site's light theme (src/styles/tokens.css). */
const W = 1200;
const H = 630;
const PAD = 80;
const BG = '#faf8f5';
const TEXT = '#2c2625';
const MUTED = '#554d49';
const FAINT = '#6f655f';
const ACCENT = '#6b2536';
const SERIF = 'Georgia, Times New Roman, serif';
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';
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

/** The "as." mark, lifted from the favicon so the two never drift apart. */
async function logoMarkup() {
  const svg = await readFile(join(process.cwd(), 'public/favicon.svg'), 'utf8');
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

/** Resizes an image and returns it as a data URI for embedding in the SVG. */
async function dataUri(path, width, height) {
  const buf = await sharp(path)
    .resize({ width: width * 2, height: height * 2, fit: 'cover', position: 'north' })
    .jpeg({ quality: 88 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

/** Viewfinder brackets around a box, as on the landing-page portrait. */
function brackets(x, y, w, h, gap = 14, len = 22) {
  const c = (d) =>
    `<path d="${d}" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.75"/>`;
  const l = x - gap,
    t = y - gap,
    r = x + w + gap,
    b = y + h + gap;
  return [
    c(`M${l} ${t + len}V${t}H${l + len}`),
    c(`M${r - len} ${t}H${r}V${t + len}`),
    c(`M${l} ${b - len}V${b}H${l + len}`),
    c(`M${r - len} ${b}H${r}V${b - len}`),
  ].join('');
}

/**
 * media: { uri, w, h, kind: 'portrait' | 'shot' | 'page' }
 *   portrait/page sit framed on the right; a shot bleeds off the right edge.
 */
function card({ eyebrow, title, titleAccent, tagline, accent, stack = [], media, logo }) {
  const bleed = media.kind === 'shot';
  const mx = bleed ? W - media.w + 60 : W - PAD - media.w;
  const my = Math.round((H - media.h) / 2) + (bleed ? 18 : 0);
  const textWidth = mx - PAD - 56;

  const full = titleAccent ? `${title} ${titleAccent}` : title;
  const titleSize = full.length > 14 ? 72 : 86;
  const titleLines = wrap(full, titleSize, textWidth, 2);
  const taglineLines = wrap(tagline, 25, textWidth, 4);
  const titleTop = 292;
  const lineGap = titleSize * 1.05;

  const titleBlock = titleLines
    .map((line, i) => {
      // Colour the accent word (e.g. "Sriven.") the way the hero does.
      const tail = titleAccent && line.endsWith(titleAccent);
      // librsvg drops spaces at a tspan edge, so the word gap is an explicit dx.
      const head = (tail ? line.slice(0, -titleAccent.length) : line).trimEnd();
      return `<tspan x="${PAD}" y="${titleTop + i * lineGap}">${escapeXml(head)}</tspan>${
        tail
          ? `<tspan dx="${Math.round(titleSize * 0.24)}" fill="${ACCENT}">${escapeXml(titleAccent)}</tspan>`
          : ''
      }`;
    })
    .join('');
  const taglineTop = titleTop + (titleLines.length - 1) * lineGap + 62;
  const taglineBlock = taglineLines
    .map((l, i) => `<tspan x="${PAD}" y="${taglineTop + i * 37}">${escapeXml(l)}</tspan>`)
    .join('');

  const radius = media.kind === 'page' ? 6 : 16;
  const frame = 7;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="80%" cy="50%" r="55%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="11" cy="11" r="1.3" fill="${ACCENT}" fill-opacity="0.32"/>
    </pattern>
    <radialGradient id="dotfade" cx="78%" cy="45%" r="50%">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="dotmask"><rect width="${W}" height="${H}" fill="url(#dotfade)"/></mask>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="18"/>
      <feOffset dy="18"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="photo">
      <rect x="${mx + frame}" y="${my + frame}" width="${media.w - frame * 2}" height="${media.h - frame * 2}" rx="${radius - 3}"/>
    </clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dotmask)"/>

  <!-- brand row -->
  <g transform="translate(${PAD}, 52) scale(1.375)">${logo}</g>
  <text x="${PAD + 58}" y="${52 + 30}" font-family="${SANS}" font-size="21" font-weight="600" fill="${TEXT}">Aman Sriven</text>

  <!-- copy -->
  <text x="${PAD}" y="196" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${ACCENT}">${escapeXml(eyebrow.toUpperCase())}</text>
  <text font-family="${SERIF}" font-size="${titleSize}" letter-spacing="-2.4" fill="${TEXT}">${titleBlock}</text>
  <text font-family="${SANS}" font-size="25" fill="${MUTED}">${taglineBlock}</text>

  <!-- media -->
  <g filter="url(#shadow)">
    <rect x="${mx}" y="${my}" width="${media.w}" height="${media.h}" rx="${radius}" fill="#fff" stroke="${ACCENT}" stroke-opacity="0.22"/>
  </g>
  <image x="${mx + frame}" y="${my + frame}" width="${media.w - frame * 2}" height="${media.h - frame * 2}"
         preserveAspectRatio="xMidYMin slice" clip-path="url(#photo)" href="${media.uri}" xlink:href="${media.uri}"/>
  ${bleed ? '' : brackets(mx, my, media.w, media.h)}

  <!-- footer -->
  ${
    stack.length
      ? `<text x="${PAD}" y="${H - 96}" font-family="${MONO}" font-size="15" letter-spacing="0.4" fill="${FAINT}">${escapeXml(stack.slice(0, 4).join('  ·  '))}</text>`
      : ''
  }
  <rect x="${PAD}" y="${H - 76}" width="${(bleed ? mx - 40 : W - PAD) - PAD}" height="1" fill="${TEXT}" fill-opacity="0.12"/>
  <text x="${PAD}" y="${H - 42}" font-family="${MONO}" font-size="15" letter-spacing="0.4" fill="${FAINT}">amansriven.com</text>
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
  return {
    title: pick('title'),
    tagline: pick('tagline'),
    accent: pick('accent'),
    heroImage: pick('heroImage'),
    stack,
  };
}

await mkdir(OUT, { recursive: true });
const logo = await logoMarkup();
const ASSETS = join(process.cwd(), 'src/assets');

const PORTRAIT = { w: 300, h: 375 };
const PAGE = { w: 300, h: 388 };
const SHOT = { w: 640, h: 360 };

const cards = [
  {
    name: 'default',
    eyebrow: 'Engineer. Student. Builder.',
    title: 'Aman',
    titleAccent: 'Sriven.',
    tagline: 'Thoughtful software. Real-world impact.',
    accent: ACCENT,
    stack: ['Kubernetes', 'Python', 'TypeScript', 'PyTorch'],
    media: { ...PORTRAIT, kind: 'portrait', src: join(ASSETS, 'portrait/aman.jpg') },
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
    stack: ['PyTorch', 'Multi-head attention', 'Focal loss', 'Ensemble'],
    media: { ...PAGE, kind: 'page', src: join(ASSETS, 'media/research/page-1.png') },
  },
];

for (const file of (await readdir(CONTENT)).filter((f) => f.endsWith('.mdx'))) {
  const { title, tagline, accent, heroImage, stack } = frontmatter(
    await readFile(join(CONTENT, file), 'utf8'),
  );
  cards.push({
    name: file.replace(/\.mdx$/, ''),
    eyebrow: 'Project',
    title,
    tagline,
    accent: hslToHex(accent),
    stack,
    // heroImage is a site path like /media/x/hero.png, stored under src/assets.
    media: { ...SHOT, kind: 'shot', src: join(ASSETS, heroImage) },
  });
}

for (const c of cards) {
  const out = join(OUT, `${c.name}.png`);
  const uri = await dataUri(c.media.src, c.media.w, c.media.h);
  await sharp(Buffer.from(card({ ...c, logo, media: { ...c.media, uri } })))
    // A quantised palette keeps cards small; the photo survives thanks to dithering.
    .png({ palette: true, quality: 92, dither: 1, compressionLevel: 9 })
    .toFile(out);
  console.log(`  ${c.name}.png  ${c.title}${c.titleAccent ? ' ' + c.titleAccent : ''}`);
}
console.log(`\n${cards.length} cards written to public/og/`);
