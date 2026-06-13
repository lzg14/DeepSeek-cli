import { build } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

const outfile = join(import.meta.dir, 'dist', 'seek.mjs');

const result = await build({
  entrypoints: [join(import.meta.dir, 'src', 'main.ts')],
  outfile,
  target: 'bun',
  minify: process.argv.includes('--dev') ? false : true,
  sourcemap: process.argv.includes('--dev') ? 'inline' : false,
  external: [],
});

if (result.logs.length > 0) {
  for (const log of result.logs) {
    if (log.level === 'error') {
      console.error(log.message);
    } else {
      console.warn(log.message);
    }
  }
}

if (!existsSync(outfile)) {
  console.error('Build failed: output file not created');
  process.exit(1);
}

console.log(`✓ Built seek to ${outfile}`);
