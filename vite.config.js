import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Este repo serve apps estáticos a partir de um código:
//   APP=landing         -> cafeina.dev.br
//   APP=design-system   -> design-system.cafeina.dev.br
//   APP=ia              -> chat local com o Ollama (uso local, não deployado)
//   APP=tutor-socratico -> tutor de matemática (uso local, não deployado)
const APPS = {
  'design-system': 'design-system',
  ia: 'ia',
  'tutor-socratico': 'tutor-socratico',
};
const app = APPS[process.env.APP] ?? 'landing';
const root = import.meta.dirname;

// ia/ e tutor-socratico/ ficam na raiz do repo, não em src/.
const rootApps = new Set(['ia', 'tutor-socratico']);
const appRoot = rootApps.has(app) ? resolve(root, app) : resolve(root, 'src', app);

// O tutor-socratico tem publicDir próprio — assim o runtime pesado do Pyodide
// (~35 MB em tutor-socratico/public/pyodide/) não vaza para o build dos outros
// apps, que compartilham o public/ da raiz.
const publicDir =
  app === 'tutor-socratico'
    ? resolve(root, 'tutor-socratico', 'public')
    : resolve(root, 'public');

// Proxy do Ollama: o navegador faz chamadas same-origin (sem CORS).
// A barra final em '/ollama/' é essencial — a chave do proxy é um prefixo,
// então '/ollama' (sem barra) capturaria também arquivos como
// '/ollama-client.js'. Com '/ollama/' só o namespace da API é interceptado.
const ollamaProxy = {
  '/ollama/': {
    target: 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/ollama/, ''),
  },
};

export default defineConfig({
  root: appRoot,
  publicDir,
  base: '/',
  server: { proxy: ollamaProxy },
  preview: { proxy: ollamaProxy },
  build: {
    outDir: resolve(root, 'dist', app),
    emptyOutDir: true,
    target: 'es2022',
  },
});
