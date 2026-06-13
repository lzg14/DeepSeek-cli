import * as esbuild from 'esbuild';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outfile = join(__dirname, '..', 'dist', 'ds.js');

const isWatch = process.argv.includes('--watch');

const ctx = await esbuild.build({
  entryPoints: [join(__dirname, '..', 'src', 'main.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  external: [],
  logLevel: 'info',
});

if (isWatch) {
  await ctx.watch();
  console.log('Watching for changes...');
}
