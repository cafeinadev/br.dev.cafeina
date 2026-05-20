import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// This repo serves two static sites built from one codebase:
//   APP=landing         -> cafeina.dev.br
//   APP=design-system   -> design-system.cafeina.dev.br
const app = process.env.APP === 'design-system' ? 'design-system' : 'landing';
const root = import.meta.dirname;

export default defineConfig({
  root: resolve(root, 'src', app),
  publicDir: resolve(root, 'public'),
  base: '/',
  build: {
    outDir: resolve(root, 'dist', app),
    emptyOutDir: true,
    target: 'es2022',
  },
});
