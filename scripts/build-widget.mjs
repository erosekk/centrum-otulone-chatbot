/**
 * Builds widget-src/index.tsx → public/widget.js
 *
 * Usage:
 *   node scripts/build-widget.mjs           # production (minified)
 *   node scripts/build-widget.mjs --watch   # watch mode for development
 */

import * as esbuild from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, "..");
const watch     = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: [resolve(root, "widget-src/index.tsx")],
  bundle:      true,
  outfile:     resolve(root, "public/widget.js"),
  platform:    "browser",
  format:      "iife",
  // Target modern browsers (last 3 years) — avoids heavy polyfills
  target:      ["es2018", "chrome80", "firefox80", "safari13", "edge80"],
  minify:      !watch,
  sourcemap:   watch ? "inline" : false,
  jsx:         "automatic",
  // Resolve Next.js @/ path alias so lib/ and data/ are found correctly
  alias:       { "@": root },
  define: {
    "process.env.NODE_ENV": watch ? '"development"' : '"production"',
  },
  logLevel: "info",
};

if (watch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("Watching widget-src/ for changes…  (Ctrl+C to stop)");
} else {
  await esbuild.build(config);
  console.log("✓ public/widget.js built successfully");
}
