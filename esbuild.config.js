const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/server.js',
    format: 'cjs',
    sourcemap: true,
    minify: true,
    external: ['fastify'],
  })
  .catch(() => process.exit(1));
