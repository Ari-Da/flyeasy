#!/usr/bin/env node
/**
 * Rasterize the brand SVG masters into the PNGs the OS needs at build time.
 *
 * Source of truth: brand_designs/icons/*.svg (gitignored design handoff).
 * Output: assets/*.png (committed) — wired up in app.config.ts.
 *
 * The app icon and native splash CANNOT be SVG (the launcher/OS renders them
 * before the app runs), so we generate PNGs here. Everything that lives inside
 * the running app stays vector — see components/ui/Mark.tsx.
 *
 * Run: npm run brand:icons   (after editing an SVG in brand_designs/)
 *
 * Uses @resvg/resvg-js — a dev-only, pure-Rust rasterizer with no system deps.
 * Bricolage fonts are fed explicitly from node_modules so any text-bearing SVG
 * renders deterministically on any machine or CI.
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'brand_designs', 'icons');
const OUT = join(root, 'assets');

const FONT_DIR = join(root, 'node_modules', '@expo-google-fonts', 'bricolage-grotesque');
const fontFiles = [
  join(FONT_DIR, '600SemiBold', 'BricolageGrotesque_600SemiBold.ttf'),
  join(FONT_DIR, '700Bold', 'BricolageGrotesque_700Bold.ttf'),
].filter(existsSync);

/**
 * Each job renders one master SVG to one PNG at a target pixel width.
 * Icons/adaptive layers are 1024² (Apple + Play requirement). The mark-only
 * splash and favicon are smaller, transparent, and font-free.
 */
const JOBS = [
  // iOS — opaque 1024² squares; iOS applies its own corner mask.
  { src: 'ios-icon-light.svg', out: 'icon.png', width: 1024 }, // top-level default icon
  { src: 'ios-icon-light.svg', out: 'ios-icon-light.png', width: 1024 },
  { src: 'ios-icon-dark.svg', out: 'ios-icon-dark.png', width: 1024 },
  { src: 'ios-icon-tinted.svg', out: 'ios-icon-tinted.png', width: 1024 },

  // Android adaptive layers + themed monochrome.
  { src: 'android-adaptive-foreground.svg', out: 'android-icon-foreground.png', width: 1024 },
  { src: 'android-adaptive-background.svg', out: 'android-icon-background.png', width: 1024 },
  { src: 'android-monochrome.svg', out: 'android-icon-monochrome.png', width: 1024 },

  // Native launch splash — mark only (no text), centered on a solid bg set in
  // app.config.ts. The full wordmark lockup shows in the JS splash once React
  // mounts (app/index.tsx). Swap to lockup-stacked.svg here to bake in the name.
  { src: 'mark.svg', out: 'splash-icon.png', width: 288 },
  { src: 'mark-dark.svg', out: 'splash-icon-dark.png', width: 288 },

  // Web favicon.
  { src: 'mark.svg', out: 'favicon.png', width: 196 },
];

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let ok = 0;
for (const job of JOBS) {
  const svgPath = join(SRC, job.src);
  if (!existsSync(svgPath)) {
    console.error(`  ✗ missing source: brand_designs/icons/${job.src}`);
    process.exitCode = 1;
    continue;
  }
  const svg = readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: job.width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Bricolage Grotesque' },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(OUT, job.out), png);
  console.log(`  ✓ ${job.out.padEnd(28)} ${job.width}px  ← ${job.src}`);
  ok++;
}

console.log(`\nGenerated ${ok}/${JOBS.length} assets into assets/.`);
