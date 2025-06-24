const esbuild = require("esbuild");
const { mkdirSync, existsSync } = require("fs");
const path = require("path");

if (!existsSync("dist/static")) {
  mkdirSync("dist/static", { recursive: true });
}

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="18" fill="#85ea2d" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">API</text>
</svg>`;

require("fs").writeFileSync("dist/static/logo.svg", logoSvg);

esbuild
  .build({
    entryPoints: ["src/server.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: "dist/server.js",
    format: "cjs",
    sourcemap: true,
    minify: true,
    external: ["fastify"],
  })
  .catch(() => process.exit(1));
