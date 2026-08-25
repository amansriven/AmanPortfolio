/**
 * Renders every page of the research PDF into `src/assets/media/research/`.
 *
 *   node scripts/render-paper-pages.mjs
 *
 * The research page shows the paper as an object — a cover in the masthead and
 * a page strip at the bottom — so those images have to come from the PDF
 * itself. Rendering them at build-input time rather than screenshotting by hand
 * means the two can never drift apart: replace the PDF, re-run this, done.
 *
 * macOS only. It drives PDFKit through the Swift interpreter that ships with
 * the Xcode Command Line Tools, which avoids adding a PDF rasteriser to
 * package.json for something that runs about once a year.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';

const PDF_DIR = join(process.cwd(), 'public/research');
const OUT = join(process.cwd(), 'src/assets/media/research');

/** Rasterise at 2.4x, then downsample — cheaper than fighting PDFKit's AA. */
const SCALE = 2.4;
/** Wide enough for a 2x cover at 24rem; the strip only ever asks for 448px. */
const WIDTH = 1100;

const RENDER_SWIFT = `
import Foundation
import PDFKit
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let src = CommandLine.arguments[1]
let outDir = CommandLine.arguments[2]
let scale = CGFloat(Double(CommandLine.arguments[3])!)

guard let doc = PDFDocument(url: URL(fileURLWithPath: src)) else {
    FileHandle.standardError.write("cannot open \\(src)\\n".data(using: .utf8)!)
    exit(1)
}

for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let w = Int(bounds.width * scale), h = Int(bounds.height * scale)

    guard let cg = CGContext(
        data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { continue }

    // PDF pages are transparent; without this the text lands on black.
    cg.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    cg.fill(CGRect(x: 0, y: 0, width: w, height: h))
    cg.interpolationQuality = .high
    cg.saveGState()
    cg.scaleBy(x: scale, y: scale)
    cg.translateBy(x: -bounds.origin.x, y: -bounds.origin.y)
    page.draw(with: .mediaBox, to: cg)
    cg.restoreGState()

    guard let image = cg.makeImage() else { continue }
    let url = URL(fileURLWithPath: "\\(outDir)/page-\\(i + 1).png")
    guard let dest = CGImageDestinationCreateWithURL(
        url as CFURL, UTType.png.identifier as CFString, 1, nil) else { continue }
    CGImageDestinationAddImage(dest, image, nil)
    CGImageDestinationFinalize(dest)
    print("page-\\(i + 1)")
}
`;

const pdfs = existsSync(PDF_DIR)
  ? (await readdir(PDF_DIR)).filter((f) => f.toLowerCase().endsWith('.pdf'))
  : [];

if (pdfs.length !== 1) {
  console.error(
    `Expected exactly one PDF in public/research/, found ${pdfs.length}. ` +
      `The page links whichever file is named in src/lib/research.ts.`,
  );
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

const script = join(tmpdir(), `render-paper-${process.pid}.swift`);
await writeFile(script, RENDER_SWIFT);

try {
  execFileSync('swift', [script, join(PDF_DIR, pdfs[0]), OUT, String(SCALE)], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
} finally {
  await unlink(script).catch(() => {});
}

// Full-depth renders of text pages run ~600 KB each. A 64-colour palette holds
// the type crisp at these sizes and lands near a third of that.
for (const file of (await readdir(OUT)).filter((f) => f.endsWith('.png'))) {
  const path = join(OUT, file);
  const buffer = await sharp(path)
    .resize({ width: WIDTH })
    .png({ palette: true, colours: 64, dither: 0, compressionLevel: 9 })
    .toBuffer();
  await writeFile(path, buffer);
  console.log(`  ${file}  ${(buffer.length / 1024).toFixed(0)} KB`);
}
